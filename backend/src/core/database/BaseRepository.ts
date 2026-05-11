import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { BaseEntity, IRepository } from './BaseEntity';
import { logger } from '../logger/logger';

/**
 * Abstract Repository base class with common database operations
 * Handles multi-tenancy, soft deletes, and pagination automatically
 */
export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected repository: Repository<T>;

  constructor(
    protected dataSource: DataSource,
    protected entityClass: any,
  ) {
    this.repository = this.dataSource.getRepository(entityClass);
  }

  /**
   * Find by ID with tenant isolation
   */
  async findById(id: string, tenantId: string): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: {
          id,
          tenant_id: tenantId,
          deleted_at: null,
        } as any,
      });
    } catch (error) {
      logger.error('findById error', { id, tenantId, error });
      throw error;
    }
  }

  /**
   * Find all with tenant isolation and pagination
   */
  async findAll(
    tenantId: string,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: string;
      orderDir?: 'ASC' | 'DESC';
    },
  ): Promise<T[]> {
    try {
      let query = this.repository.createQueryBuilder('entity').where('entity.tenant_id = :tenantId', { tenantId }).andWhere('entity.deleted_at IS NULL');

      if (options?.skip) query = query.skip(options.skip);
      if (options?.take) query = query.take(options.take);
      if (options?.orderBy) query = query.orderBy(`entity.${options.orderBy}`, options.orderDir || 'ASC');

      return await query.getMany();
    } catch (error) {
      logger.error('findAll error', { tenantId, options, error });
      throw error;
    }
  }

  /**
   * Create new entity with tenant isolation
   */
  async create(data: Partial<T>, tenantId: string): Promise<T> {
    try {
      const entity = this.repository.create({
        ...data,
        tenant_id: tenantId,
      } as any);

      const saved = await this.repository.save(entity);
      logger.info('Entity created', { entityId: (saved as any).id, tenantId });
      return (saved as any) as T;
    } catch (error) {
      logger.error('create error', { data, tenantId, error });
      throw error;
    }
  }

  /**
   * Update entity with tenant isolation
   */
  async update(id: string, tenantId: string, data: Partial<T>): Promise<T> {
    try {
      const entity = await this.findById(id, tenantId);
      if (!entity) {
        throw new Error(`Entity ${id} not found in tenant ${tenantId}`);
      }

      Object.assign(entity, data);
      const saved = await this.repository.save(entity);
      logger.info('Entity updated', { entityId: id, tenantId });
      return saved;
    } catch (error) {
      logger.error('update error', { id, tenantId, data, error });
      throw error;
    }
  }

  /**
   * Hard delete (physical removal)
   */
  async delete(id: string, tenantId: string): Promise<void> {
    try {
      const entity = await this.findById(id, tenantId);
      if (!entity) {
        throw new Error(`Entity ${id} not found`);
      }

      await this.repository.remove(entity);
      logger.info('Entity deleted', { entityId: id, tenantId });
    } catch (error) {
      logger.error('delete error', { id, tenantId, error });
      throw error;
    }
  }

  /**
   * Soft delete (mark as deleted)
   */
  async softDelete(id: string, tenantId: string): Promise<void> {
    try {
      const entity = await this.findById(id, tenantId);
      if (!entity) {
        throw new Error(`Entity ${id} not found`);
      }

      entity.delete();
      await this.repository.save(entity);
      logger.info('Entity soft deleted', { entityId: id, tenantId });
    } catch (error) {
      logger.error('softDelete error', { id, tenantId, error });
      throw error;
    }
  }

  /**
   * Restore soft deleted entity
   */
  async restore(id: string, tenantId: string): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: {
          id,
          tenant_id: tenantId,
        } as any,
      });

      if (!entity) {
        throw new Error(`Entity ${id} not found`);
      }

      entity.restore();
      const saved = await this.repository.save(entity);
      logger.info('Entity restored', { entityId: id, tenantId });
      return saved;
    } catch (error) {
      logger.error('restore error', { id, tenantId, error });
      throw error;
    }
  }

  /**
   * Count entities in tenant
   */
  async count(tenantId: string, whereCondition?: any): Promise<number> {
    try {
      let query = this.repository
        .createQueryBuilder('entity')
        .where('entity.tenant_id = :tenantId', { tenantId })
        .andWhere('entity.deleted_at IS NULL');

      if (whereCondition) {
        query = query.andWhere(whereCondition);
      }

      return await query.getCount();
    } catch (error) {
      logger.error('count error', { tenantId, error });
      throw error;
    }
  }

  /**
   * Create query builder with tenant isolation
   */
  protected createTenantQuery(tenantId: string, alias: string = 'entity'): SelectQueryBuilder<T> {
    return this.repository
      .createQueryBuilder(alias)
      .where(`${alias}.tenant_id = :tenantId`, { tenantId })
      .andWhere(`${alias}.deleted_at IS NULL`);
  }
}

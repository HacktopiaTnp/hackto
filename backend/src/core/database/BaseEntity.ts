import { Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';
import { generateUUID } from '@utils/helpers';

/**
 * Base Entity with common fields for all entities
 * Provides UUID primary key, tenant_id for multi-tenancy, and timestamps
 */
export abstract class BaseEntity {
  @PrimaryColumn('uuid')
  id: string = generateUUID();

  @Column('uuid')
  @Column()
  tenant_id!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date = new Date();

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date = new Date();

  @Column('timestamp', { nullable: true })
  deleted_at?: Date;

  /**
   * Soft delete
   */
  delete(): void {
    this.deleted_at = new Date();
  }

  /**
   * Check if deleted
   */
  isDeleted(): boolean {
    return !!this.deleted_at;
  }

  /**
   * Restore (undo soft delete)
   */
  restore(): void {
    this.deleted_at = undefined;
  }
}

/**
 * Generic Repository base class
 */
export interface IRepository<T> {
  findById(id: string, tenantId: string): Promise<T | null>;
  findAll(tenantId: string, options?: any): Promise<T[]>;
  create(entity: Partial<T>, tenantId: string): Promise<T>;
  update(id: string, tenantId: string, data: Partial<T>): Promise<T>;
  delete(id: string, tenantId: string): Promise<void>;
  softDelete(id: string, tenantId: string): Promise<void>;
}

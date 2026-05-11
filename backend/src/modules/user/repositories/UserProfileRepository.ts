import { BaseRepository } from '@core/database/BaseRepository';
import { UserProfile } from '../entities/UserProfile';
import { DataSource } from 'typeorm';

/**
 * User Profile Repository
 * Handles database operations for user profiles
 */
export class UserProfileRepository extends BaseRepository<UserProfile> {
  constructor(dataSource: DataSource) {
    super(dataSource, UserProfile);
  }

  /**
   * Find profile by user ID
   */
  async findByUserId(userId: string, tenantId: string): Promise<UserProfile | null> {
    const query = this.createTenantQuery(tenantId, 'profile');
    query.where('profile.user_id = :userId', { userId });
    return (await query.getOne()) || null;
  }

  /**
   * Find profile by email
   */
  async findByEmail(email: string, tenantId: string): Promise<UserProfile | null> {
    const query = this.createTenantQuery(tenantId, 'profile');
    query.andWhere('profile.email = :email', { email });
    return (await query.getOne()) || null;
  }

  /**
   * Get all profiles for tenant with pagination
   */
  async findByTenant(tenantId: string, skip: number = 0, take: number = 10): Promise<{ data: UserProfile[]; total: number }> {
    const query = this.createTenantQuery(tenantId, 'profile');
    query.skip(skip).take(take).orderBy('profile.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  /**
   * Search profiles by name
   */
  async searchByName(name: string, tenantId: string): Promise<UserProfile[]> {
    const query = this.createTenantQuery(tenantId, 'profile');
    query
      .andWhere('(profile.first_name ILIKE :name OR profile.last_name ILIKE :name)', { name: `%${name}%` })
      .orderBy('profile.first_name', 'ASC');

    return await query.getMany();
  }

  /**
   * Upsert profile (insert or update)
   */
  async upsertProfile(userId: string, tenantId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.findByUserId(userId, tenantId);

    if (existing) {
      return await this.update(existing.id, tenantId, data);
    } else {
      return await this.create({ ...data, user_id: userId }, tenantId);
    }
  }

  /**
   * Update profile
   */
  async updateProfile(userId: string, tenantId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    const existing = await this.findByUserId(userId, tenantId);
    if (!existing) return null;

    return await this.update(existing.id, tenantId, data);
  }

  /**
   * Delete profile (soft delete)
   */
  async deleteProfile(userId: string, tenantId: string): Promise<void> {
    const existing = await this.findByUserId(userId, tenantId);
    if (existing) {
      await this.softDelete(existing.id, tenantId);
    }
  }
}

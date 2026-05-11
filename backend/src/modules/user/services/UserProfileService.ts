import { UserProfile } from '../entities/UserProfile';
import { UserProfileRepository } from '../repositories/UserProfileRepository';
import { DatabaseService } from '@core/database/DatabaseService';
import { logger } from '@core/logger/logger';

/**
 * User Profile Service
 * Business logic for user profile operations
 */
export class UserProfileService {
  private repository: UserProfileRepository | null = null;

  /**
   * Initialize repository with database connection
   */
  private async initRepository(): Promise<void> {
    if (!this.repository) {
      const dataSource = await DatabaseService.getConnection();
      this.repository = new UserProfileRepository(dataSource);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string, tenantId: string): Promise<UserProfile | null> {
    try {
      await this.initRepository();
      const profile = await this.repository!.findByUserId(userId, tenantId);
      if (!profile) {
        logger.debug('Profile not found', { userId, tenantId });
        return null;
      }
      return profile;
    } catch (error) {
      logger.error('Error fetching profile', error, { userId, tenantId });
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(userId: string, tenantId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      await this.initRepository();
      logger.info('Upserting profile', { userId, tenantId });
      return await this.repository!.upsertProfile(userId, tenantId, data);
    } catch (error) {
      logger.error('Error upserting profile', error, { userId, tenantId });
      throw error;
    }
  }

  /**
   * Get all tenant profiles
   */
  async getProfilesByTenant(tenantId: string, skip: number = 0, take: number = 10): Promise<{ data: UserProfile[]; total: number }> {
    try {
      await this.initRepository();
      return await this.repository!.findByTenant(tenantId, skip, take);
    } catch (error) {
      logger.error('Error fetching tenant profiles', error, { tenantId });
      throw error;
    }
  }

  /**
   * Search profiles by name
   */
  async searchProfiles(name: string, tenantId: string): Promise<UserProfile[]> {
    try {
      await this.initRepository();
      return await this.repository!.searchByName(name, tenantId);
    } catch (error) {
      logger.error('Error searching profiles', error, { name, tenantId });
      throw error;
    }
  }

  /**
   * Delete profile
   */
  async deleteProfile(userId: string, tenantId: string): Promise<void> {
    try {
      await this.initRepository();
      await this.repository!.deleteProfile(userId, tenantId);
      logger.info('Profile deleted', { userId, tenantId });
    } catch (error) {
      logger.error('Error deleting profile', error, { userId, tenantId });
      throw error;
    }
  }

  /**
   * Update avatar
   */
  async updateAvatar(userId: string, tenantId: string, avatarUrl: string): Promise<UserProfile> {
    try {
      await this.initRepository();
      const result = await this.repository!.updateProfile(userId, tenantId, { avatar_url: avatarUrl } as any);
      if (!result) {
        throw new Error('Profile not found');
      }
      logger.info('Avatar updated', { userId, tenantId });
      return result;
    } catch (error) {
      logger.error('Error updating avatar', error, { userId, tenantId });
      throw error;
    }
  }

  /**
   * Bulk update profiles
   */
  async bulkUpdate(tenantId: string, updates: { userId: string; data: Partial<UserProfile> }[]): Promise<void> {
    try {
      await this.initRepository();
      for (const update of updates) {
        await this.upsertProfile(update.userId, tenantId, update.data);
      }
      logger.info('Bulk update completed', { tenantId, count: updates.length });
    } catch (error) {
      logger.error('Error in bulk update', error, { tenantId });
      throw error;
    }
  }
}

export default UserProfileService;

import bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { DatabaseService } from '@core/database/DatabaseService';
import { logger } from '@core/logger/logger';
import { CacheService } from '@core/cache/CacheService';
import { UnauthorizedError, ConflictError, NotFoundError } from '@utils/errors';
import { generateUUID } from '@utils/helpers';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@api/middleware/auth.middleware';

/**
 * Authentication Service
 * Handles user registration, login, password management, and session management
 */
export class AuthService {
  private userRepository: any;
  private dataSource!: DataSource;

  constructor() {}

  /**
   * Initialize service with database connection
   */
  async initialize(): Promise<void> {
    this.dataSource = await DatabaseService.getConnection();
    this.userRepository = this.dataSource.getRepository(User);
  }

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
    tenant_id: string;
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // Validate email doesn't exist
      const existingUser = await this.userRepository.findOne({
        where: {
          email: data.email.toLowerCase(),
          tenant_id: data.tenant_id,
        },
      });

      if (existingUser) {
        throw new ConflictError('Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user
      const user = this.userRepository.create({
        id: generateUUID(),
        tenant_id: data.tenant_id,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone?.trim(),
        role: data.role || 'student',
        status: 'pending_verification',
        permissions: this.getDefaultPermissions(data.role || 'student'),
      });

      await this.userRepository.save(user);

      logger.info('User registered', {
        userId: user.id,
        email: user.email,
        tenantId: data.tenant_id,
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });

      // Store refresh token in cache
      await CacheService.setSession(`refresh-token:${user.id}`, { token: refreshToken }, 7 * 24 * 60 * 60);

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error('Registration failed', error, { email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
    tenantId: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    try {
      // Find user
      const user = await this.userRepository.findOne({
        where: {
          email: email.toLowerCase(),
          tenant_id: tenantId,
        },
      });

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        throw new UnauthorizedError('Account temporarily locked. Try again later.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        // Increment failed attempts
        user.failed_login_attempts += 1;

        if (user.failed_login_attempts >= 5) {
          user.account_locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
          logger.warn('Account locked due to failed attempts', { userId: user.id });
        }

        await this.userRepository.save(user);
        throw new UnauthorizedError('Invalid email or password');
      }

      // Check if user is active
      if (user.status !== 'active' && user.status !== 'pending_verification') {
        throw new UnauthorizedError(`Account is ${user.getStatusDisplay()}`);
      }

      // Reset failed attempts on successful login
      user.failed_login_attempts = 0;
      user.last_login_at = new Date();
      user.account_locked_until = null;

      await this.userRepository.save(user);

      logger.info('User logged in', { userId: user.id, email: user.email });

      // Generate tokens
      const accessToken = generateAccessToken({
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      });

      // Store refresh token in cache
      await CacheService.setSession(`refresh-token:${user.id}`, { token: refreshToken }, 7 * 24 * 60 * 60);

      return { user, accessToken, refreshToken };
    } catch (error) {
      logger.error('Login failed', error, { email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string, userId: string): Promise<string> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      if (decoded.id !== userId) {
        throw new UnauthorizedError('Token mismatch');
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        tenant_id: decoded.tenant_id,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions,
      });

      logger.info('Token refreshed', { userId });

      return newAccessToken;
    } catch (error) {
      logger.error('Token refresh failed', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    try {
      const key = `refresh-token:${userId}`;
      await CacheService.delete(key);

      logger.info('User logged out', { userId });
    } catch (error) {
      logger.error('Logout failed', error, { userId });
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, tenantId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, tenant_id: tenantId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      user.password_hash = await bcrypt.hash(newPassword, 12);
      await this.userRepository.save(user);

      logger.info('Password changed', { userId });
    } catch (error) {
      logger.error('Change password failed', error, { userId });
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, tenantId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase(), tenant_id: tenantId },
      });

      if (!user) {
        // Don't reveal if user exists for security
        logger.warn('Password reset requested for non-existent user', { email });
        return;
      }

      // Generate reset token (6 digits)
      const resetCode = Math.random().toString().substring(2, 8);

      // Store in cache with 1 hour expiry
      await CacheService.set(`password-reset:${user.id}`, resetCode, 3600);

      logger.info('Password reset requested', { userId: user.id, email });

      // TODO: Send email with reset code
    } catch (error) {
      logger.error('Password reset request failed', error, { email });
    }
  }

  /**
   * Reset password using code
   */
  async resetPassword(userId: string, tenantId: string, code: string, newPassword: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, tenant_id: tenantId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify reset code
      const storedCode = await CacheService.get<string>(`password-reset:${userId}`);

      if (!storedCode || storedCode !== code) {
        throw new UnauthorizedError('Invalid or expired reset code');
      }

      // Hash new password
      user.password_hash = await bcrypt.hash(newPassword, 12);
      await this.userRepository.save(user);

      // Delete reset code from cache
      await CacheService.delete(`password-reset:${userId}`);

      logger.info('Password reset completed', { userId });
    } catch (error) {
      logger.error('Password reset failed', error, { userId });
      throw error;
    }
  }

  /**
   * Enable MFA
   */
  async enableMFA(userId: string, _tenantId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      // Generate TOTP secret
      const speakeasy = require('speakeasy');
      const secret = speakeasy.generateSecret({
        name: `TnP Portal (${userId})`,
        issuer: 'TnP Portal',
        length: 32,
      });

      // Store pending secret in cache (1 hour to verify)
      await CacheService.set(`mfa-pending:${userId}`, secret.base32, 3600);

      logger.info('MFA setup started', { userId });

      return {
        secret: secret.base32,
        qrCode: secret.otpauth_url,
      };
    } catch (error) {
      logger.error('Enable MFA failed', error, { userId });
      throw error;
    }
  }

  /**
   * Verify MFA setup
   */
  async verifyMFA(userId: string, tenantId: string, code: string): Promise<{ backupCodes: string[] }> {
    try {
      const speakeasy = require('speakeasy');

      // Get pending secret
      const secret = await CacheService.get<string>(`mfa-pending:${userId}`);

      if (!secret) {
        throw new UnauthorizedError('MFA setup not initiated');
      }

      // Verify code
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        throw new UnauthorizedError('Invalid MFA code');
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 8).toUpperCase());

      // Update user
      const user = await this.userRepository.findOne({
        where: { id: userId, tenant_id: tenantId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.mfa_enabled = true;
      user.mfa_secret = secret;
      user.mfa_backup_codes = JSON.stringify(backupCodes);

      await this.userRepository.save(user);

      // Delete pending secret from cache
      await CacheService.delete(`mfa-pending:${userId}`);

      logger.info('MFA enabled', { userId });

      return { backupCodes };
    } catch (error) {
      logger.error('Verify MFA failed', error, { userId });
      throw error;
    }
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId: string, tenantId: string, password: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, tenant_id: tenantId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password');
      }

      user.mfa_enabled = false;
      user.mfa_secret = null;
      user.mfa_backup_codes = null;

      await this.userRepository.save(user);

      logger.info('MFA disabled', { userId });
    } catch (error) {
      logger.error('Disable MFA failed', error, { userId });
      throw error;
    }
  }

  /**
   * Verify MFA code during login
   */
  async verifyLoginMFA(userId: string, code: string, useBackupCode: boolean = false): Promise<boolean> {
    try {
      const speakeasy = require('speakeasy');

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user || !user.mfa_enabled) {
        throw new UnauthorizedError('MFA not enabled');
      }

      if (useBackupCode) {
        const backupCodes = JSON.parse(user.mfa_backup_codes || '[]');
        const index = backupCodes.indexOf(code);

        if (index === -1) {
          throw new UnauthorizedError('Invalid backup code');
        }

        // Remove used backup code
        backupCodes.splice(index, 1);
        user.mfa_backup_codes = JSON.stringify(backupCodes);
        await this.userRepository.save(user);

        logger.info('MFA backup code used', { userId });
        return true;
      }

      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token: code,
        window: 2,
      });

      if (!verified) {
        throw new UnauthorizedError('Invalid MFA code');
      }

      logger.info('MFA code verified', { userId });
      return true;
    } catch (error) {
      logger.error('MFA verification failed', error, { userId });
      throw error;
    }
  }

  /**
   * Get default permissions based on role
   */
  private getDefaultPermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      student: [
        'profile:view',
        'profile:edit',
        'dashboard:view',
        'jobs:view',
        'applications:view',
        'applications:create',
        'interviews:view',
        'offers:view',
        'resume:upload',
      ],
      recruiter: [
        'profile:view',
        'profile:edit',
        'dashboard:view',
        'jobs:view',
        'jobs:create',
        'jobs:edit',
        'applications:view',
        'candidates:search',
        'interviews:create',
        'offers:create',
      ],
      tnp_member: [
        'profile:view',
        'profile:edit',
        'admin:view',
        'students:view',
        'placements:view',
        'reports:view',
        'analytics:view',
      ],
      admin: ['*'], // All permissions
      super_admin: ['*'], // All permissions
    };

    return rolePermissions[role] || [];
  }
}

export default AuthService;

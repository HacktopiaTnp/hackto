import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '@core/database/BaseEntity';

/**
 * User Entity
 * Base entity for all users (students, recruiters, admins)
 * Supports multi-tenancy via tenant_id
 * Row-Level Security ensures tenant isolation at database level
 */
@Entity('user')
@Index(['tenant_id', 'email'])
@Index(['tenant_id', 'phone'])
@Index(['tenant_id', 'role'])
@Index(['tenant_id', 'status'])
@Unique('USER_EMAIL_TENANT_UNIQUE', ['tenant_id', 'email'])
@Unique('USER_PHONE_TENANT_UNIQUE', ['tenant_id', 'phone'])
export class User extends BaseEntity {
  // Identity
  @Column('varchar', { length: 255 })
  email!: string;

  @Column('varchar', { length: 255, nullable: true })
  phone?: string;

  @Column('varchar', { length: 255 })
  first_name!: string;

  @Column('varchar', { length: 255 })
  last_name!: string;

  @Column('varchar', { length: 500, nullable: true })
  avatar_url?: string;

  @Column('text', { nullable: true })
  bio?: string;

  // Authentication
  @Column('varchar', { length: 255 })
  password_hash!: string;

  @Column('boolean', { default: false })
  email_verified!: boolean;

  @Column('timestamp', { nullable: true })
  email_verified_at?: Date;

  @Column('varchar', { length: 500, nullable: true })
  phone_verification_code?: string;

  @Column('boolean', { default: false })
  phone_verified!: boolean;

  @Column('timestamp', { nullable: true })
  phone_verified_at?: Date;

  // MFA
  @Column('boolean', { default: false })
  mfa_enabled!: boolean;

  @Column('varchar', { length: 255, nullable: true })
  mfa_secret?: string; // TOTP secret

  @Column('text', { nullable: true })
  mfa_backup_codes?: string; // JSON array of backup codes

  // Role & Permissions
  @Column('enum', {
    enum: ['student', 'recruiter', 'tnp_member', 'admin', 'super_admin'],
    default: 'student',
  })
  role!: 'student' | 'recruiter' | 'tnp_member' | 'admin' | 'super_admin';

  @Column('simple-array', { default: '' })
  permissions: string[] = [];

  // Status
  @Column('enum', {
    enum: ['active', 'inactive', 'suspended', 'banned', 'pending_verification'],
    default: 'pending_verification',
  })
  status!: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification';

  @Column('timestamp', { nullable: true })
  suspended_at?: Date;

  @Column('varchar', { length: 500, nullable: true })
  suspension_reason?: string;

  // Sessions & Security
  @Column('varchar', { length: 500, nullable: true })
  last_ip_address?: string;

  @Column('varchar', { length: 500, nullable: true })
  last_user_agent?: string;

  @Column('timestamp', { nullable: true })
  last_login_at?: Date;

  @Column('int', { default: 0 })
  failed_login_attempts!: number;

  @Column('timestamp', { nullable: true })
  account_locked_until?: Date;

  // Preferences & Settings
  @Column('jsonb', { nullable: true })
  preferences?: {
    language?: string;
    theme?: 'light' | 'dark';
    notifications_enabled?: boolean;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    [key: string]: any;
  };

  @Column('text', { nullable: true })
  device_ids?: string; // JSON array of device IDs for push notifications

  // Privacy
  @Column('boolean', { default: false })
  profile_public!: boolean;

  @Column('boolean', { default: true })
  receive_emails_marketing!: boolean;

  // Audit
  @Column('timestamp', { nullable: true })
  last_activity_at?: Date;

  @Column('varchar', { length: 255, nullable: true })
  created_by?: string;

  @Column('varchar', { length: 255, nullable: true })
  updated_by?: string;

  /**
   * Methods
   */

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  /**
   * Check if account is locked
   */
  isAccountLocked(): boolean {
    if (!this.account_locked_until) return false;
    return this.account_locked_until > new Date();
  }

  /**
   * Check if account is suspended
   */
  isSuspended(): boolean {
    return this.status === 'suspended';
  }

  /**
   * Check if verified
   */
  isVerified(): boolean {
    return this.email_verified && (!this.phone || this.phone_verified);
  }

  /**
   * Check if has permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Check if has role
   */
  hasRole(role: string): boolean {
    return this.role === role;
  }

  /**
   * Check if has any role
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  /**
   * Check if is admin or higher
   */
  isAdmin(): boolean {
    return ['admin', 'super_admin'].includes(this.role);
  }

  /**
   * Get role display name
   */
  getRoleDisplay(): string {
    const roleMap: Record<string, string> = {
      student: 'Student',
      recruiter: 'Recruiter',
      tnp_member: 'T&P Member',
      admin: 'Administrator',
      super_admin: 'Super Administrator',
    };
    return roleMap[this.role] || this.role;
  }

  /**
   * Get status display name
   */
  getStatusDisplay(): string {
    const statusMap: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      suspended: 'Suspended',
      banned: 'Banned',
      pending_verification: 'Pending Verification',
    };
    return statusMap[this.status] || this.status;
  }
}

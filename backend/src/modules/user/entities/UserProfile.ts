import { BaseEntity } from '@core/database/BaseEntity';
import { Entity, Column, Index } from 'typeorm';

/**
 * User Profile Entity
 * Stores user profile information submitted from frontend
 */
@Entity('user_profiles')
@Index(['tenant_id', 'user_id'])
export class UserProfile extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 255 })
  first_name!: string;

  @Column({ type: 'varchar', length: 255 })
  last_name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar_url!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'student' })
  role!: string; // 'student', 'recruiter', 'admin'

  @Column({ type: 'jsonb', nullable: true })
  metadata!: any; // Store additional user data

  @Column({ type: 'timestamp', nullable: true })
  last_updated_at!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by!: string | null;
}

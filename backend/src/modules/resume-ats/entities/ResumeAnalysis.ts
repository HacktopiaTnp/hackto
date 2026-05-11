import { BaseEntity } from '@core/database/BaseEntity';
import { Entity, Column, Index } from 'typeorm';

/**
 * Resume Analysis Entity
 * Stores comprehensive ATS analysis results with all 10-factor scoring
 */
@Entity('resume_analyses')
@Index(['user_id', 'created_at'])
@Index(['user_id', 'tenant_id'])
export class ResumeAnalysis extends BaseEntity {
  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'varchar', length: 255 })
  file_name!: string;

  @Column({ type: 'varchar', length: 100 })
  job_title!: string;

  @Column({ type: 'text', nullable: true })
  job_description!: string | null;

  // Main Scores
  @Column({ type: 'int' })
  overall_score!: number; // 0-100

  @Column({ type: 'int' })
  ats_score!: number; // 0-100

  @Column({ type: 'int' })
  readability_score!: number; // 0-100

  // Detailed Factor Scores (10-factor system)
  @Column({ type: 'int' })
  keywords_match_score!: number; // 0-100 (35% weight)

  @Column({ type: 'int' })
  format_structure_score!: number; // 0-100 (15% weight)

  @Column({ type: 'int' })
  skills_optimization_score!: number; // 0-100 (20% weight)

  @Column({ type: 'int' })
  quantified_achievements_score!: number; // 0-100 (15% weight)

  @Column({ type: 'int' })
  job_title_matching_score!: number; // 0-100 (15% weight)

  @Column({ type: 'int' })
  project_relevance_score!: number; // 0-100 (15% weight)

  @Column({ type: 'int' })
  dates_experience_score!: number; // 0-100 (10% weight)

  @Column({ type: 'int' })
  file_type_naming_score!: number; // 0-100 (5% weight)

  @Column({ type: 'int' })
  ats_killers_score!: number; // 0-100 (penalty factor)

  // Keywords Info
  @Column({ type: 'int' })
  keywords_matched!: number;

  @Column({ type: 'int' })
  total_keywords!: number;

  @Column({ type: 'jsonb' })
  keywords_present!: string[]; // Array of matched keywords

  @Column({ type: 'jsonb' })
  keywords_missing!: string[]; // Array of missing keywords

  // Sections Analysis (JSON format)
  @Column({ type: 'jsonb', nullable: true })
  sections_analysis!: {
    name: string;
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    suggestions: string[];
  }[];

  // Recommendations
  @Column({ type: 'jsonb', nullable: true })
  recommendations!: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: number;
  }[];

  // File Info
  @Column({ type: 'int' })
  file_size_kb!: number;

  @Column({ type: 'varchar', length: 50 })
  file_type!: string; // pdf, docx, doc

  // Status
  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status!: string; // analyzing, completed, failed

  @Column({ type: 'text', nullable: true })
  error_message!: string | null;

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata!: {
    analyzerVersion?: string;
    algorithmVersion?: string;
    processingTimeMs?: number;
    sourceApp?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  analyzed_at!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by!: string | null;
}

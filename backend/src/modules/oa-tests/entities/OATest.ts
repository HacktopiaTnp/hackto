import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface Question {
  id: string;
  question: string;
  type: 'mcq' | 'numerical' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  category?: string;
}

@Entity('oa_tests')
@Index(['tenant_id'])
@Index(['user_id'])
@Index(['company'])
@Index(['status'])
export class OATest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  user_id: string;

  @Column('uuid')
  tenant_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  company: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @Column({ type: 'int', default: 60 })
  duration: number; // in minutes

  @Column({ type: 'int', default: 25 })
  totalQuestions: number;

  @Column({ type: 'int', default: 60 })
  passingScore: number; // percentage

  @Column({ type: 'simple-array', default: '' })
  categories: string[]; // e.g., ['Coding', 'Aptitude', 'Reasoning']

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  questions: Question[]; // All questions for this test

  @Column({ type: 'int', default: 0 })
  attempts: number; // Number of attempts made by user

  @Column({ type: 'varchar', length: 50, default: 'not-started' })
  status: 'not-started' | 'in-progress' | 'completed'; // Status of test for current user

  @Column({ type: 'int', nullable: true })
  bestScore: number; // Best score achieved (percentage)

  @Column({ type: 'varchar', length: 50, nullable: true })
  completedDate: string; // ISO date string

  @Column({ type: 'simple-array', default: '' })
  userAnswers: (string | number)[]; // Answers provided by user

  @Column({ type: 'int', default: 0 })
  correctAnswersCount: number; // Count of correct answers

  @Column({ type: 'varchar', length: 500, nullable: true })
  feedback: string; // Feedback after completion

  @Column({ type: 'boolean', default: true })
  isPublished: boolean; // Whether test is available to users

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import { BaseRepository } from '@core/database/BaseRepository';
import { ResumeAnalysis } from '../entities/ResumeAnalysis';
import { DataSource } from 'typeorm';

/**
 * Resume Analysis Repository
 * Handles database operations for resume ATS analysis results
 */
export class ResumeAnalysisRepository extends BaseRepository<ResumeAnalysis> {
  constructor(dataSource: DataSource) {
    super(dataSource, ResumeAnalysis);
  }

  /**
   * Create a new resume analysis record
   */
  async createAnalysis(
    userId: string,
    tenantId: string,
    analysisData: Partial<ResumeAnalysis>
  ): Promise<ResumeAnalysis> {
    const analysis = new ResumeAnalysis();
    Object.assign(analysis, {
      ...analysisData,
      user_id: userId,
      tenant_id: tenantId,
      analyzed_at: new Date(),
      status: 'completed',
    });

    return await this.repository.save(analysis);
  }

  /**
   * Find analysis by ID
   */
  async findById(analysisId: string, tenantId: string): Promise<ResumeAnalysis | null> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query.where('analysis.id = :analysisId', { analysisId });
    return (await query.getOne()) || null;
  }

  /**
   * Get all analyses for a user
   */
  async findByUserId(
    userId: string,
    tenantId: string,
    skip: number = 0,
    take: number = 10
  ): Promise<{ data: ResumeAnalysis[]; total: number }> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .orderBy('analysis.analyzed_at', 'DESC')
      .skip(skip)
      .take(take);

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  /**
   * Get top scored resumes for a user
   */
  async findTop(
    userId: string,
    tenantId: string,
    limit: number = 5
  ): Promise<ResumeAnalysis[]> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .orderBy('analysis.ats_score', 'DESC')
      .take(limit);

    return await query.getMany();
  }

  /**
   * Find by job title
   */
  async findByJobTitle(
    userId: string,
    jobTitle: string,
    tenantId: string
  ): Promise<ResumeAnalysis[]> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .andWhere('analysis.job_title = :jobTitle', { jobTitle })
      .orderBy('analysis.analyzed_at', 'DESC');

    return await query.getMany();
  }

  /**
   * Get score trends for a user (last N analyses)
   */
  async getScoreTrends(
    userId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<{ analyzedAt: Date; atsScore: number; fileName: string }[]> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    const results = await query
      .select(['analysis.analyzed_at', 'analysis.ats_score', 'analysis.file_name'])
      .where('analysis.user_id = :userId', { userId })
      .orderBy('analysis.analyzed_at', 'ASC')
      .take(limit)
      .getMany();

    return results.map(r => ({
      analyzedAt: r.analyzed_at!,
      atsScore: r.ats_score,
      fileName: r.file_name,
    }));
  }

  /**
   * Get average scores for a user
   */
  async getAverageScores(userId: string, tenantId: string): Promise<{
    avgAtsScore: number;
    avgOverallScore: number;
    avgReadabilityScore: number;
    totalAnalyses: number;
  }> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    const result = await query
      .select('AVG(analysis.ats_score)', 'avgAtsScore')
      .addSelect('AVG(analysis.overall_score)', 'avgOverallScore')
      .addSelect('AVG(analysis.readability_score)', 'avgReadabilityScore')
      .addSelect('COUNT(analysis.id)', 'totalAnalyses')
      .where('analysis.user_id = :userId', { userId })
      .getRawOne();

    return {
      avgAtsScore: Math.round(parseFloat(result.avgAtsScore) || 0),
      avgOverallScore: Math.round(parseFloat(result.avgOverallScore) || 0),
      avgReadabilityScore: Math.round(parseFloat(result.avgReadabilityScore) || 0),
      totalAnalyses: parseInt(result.totalAnalyses || 0),
    };
  }

  /**
   * Get analyses with score above threshold
   */
  async findByScoreThreshold(
    userId: string,
    tenantId: string,
    minScore: number
  ): Promise<ResumeAnalysis[]> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .andWhere('analysis.ats_score >= :minScore', { minScore })
      .orderBy('analysis.ats_score', 'DESC');

    return await query.getMany();
  }

  /**
   * Update analysis status
   */
  async updateStatus(
    analysisId: string,
    status: string,
    tenantId: string,
    errorMessage?: string
  ): Promise<ResumeAnalysis | null> {
    await this.createTenantQuery(tenantId, 'analysis')
      .update(ResumeAnalysis)
      .set({
        status,
        error_message: errorMessage || null,
      })
      .where('id = :analysisId', { analysisId })
      .execute();

    return this.findById(analysisId, tenantId);
  }

  /**
   * Delete old analyses (cleanup)
   */
  async deleteOlderThan(userId: string, tenantId: string, daysOld: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    const result = await this.createTenantQuery(tenantId, 'analysis')
      .delete()
      .where('analysis.user_id = :userId', { userId })
      .andWhere('analysis.analyzed_at < :date', { date })
      .execute();

    return result.affected || 0;
  }

  /**
   * Find the lowest scored analysis for a user
   */
  async findLowestScored(
    userId: string,
    tenantId: string
  ): Promise<ResumeAnalysis | null> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .orderBy('analysis.ats_score', 'ASC')
      .take(1);

    return (await query.getOne()) || null;
  }

  /**
   * Find recent analyses for a user
   */
  async findRecent(
    userId: string,
    tenantId: string,
    limit: number = 3
  ): Promise<ResumeAnalysis[]> {
    const query = this.createTenantQuery(tenantId, 'analysis');
    query
      .where('analysis.user_id = :userId', { userId })
      .orderBy('analysis.analyzed_at', 'DESC')
      .take(limit);

    return await query.getMany();
  }
}

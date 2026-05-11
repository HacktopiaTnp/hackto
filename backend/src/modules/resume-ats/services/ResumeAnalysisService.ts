import { ResumeAnalysisRepository } from '../repositories/ResumeAnalysisRepository';
import { ResumeAnalysis } from '../entities/ResumeAnalysis';
import { DataSource } from 'typeorm';

/**
 * Resume ATS Analysis Service
 * Handles business logic for resume analysis operations
 */
export class ResumeAnalysisService {
  private repository: ResumeAnalysisRepository;

  constructor(dataSource: DataSource) {
    this.repository = new ResumeAnalysisRepository(dataSource);
  }

  /**
   * Save ATS analysis results to database
   */
  async saveAnalysisResults(
    userId: string,
    tenantId: string,
    analysisPayload: {
      fileName: string;
      fileType: string;
      fileSizeKb: number;
      jobTitle: string;
      jobDescription?: string;
      overallScore: number;
      atsScore: number;
      readabilityScore: number;
      detailedScores: {
        keywordsMatch: number;
        formatStructure: number;
        skillsOptimization: number;
        quantifiedAchievements: number;
        jobTitleMatching: number;
        projectRelevance: number;
        datesExperience: number;
        fileTypeNaming: number;
        atsKillers: number;
      };
      keywordMatches: number;
      totalKeywords: number;
      keywordsPresent: string[];
      keywordsMissing: string[];
      sections: {
        name: string;
        score: number;
        status: 'excellent' | 'good' | 'fair' | 'poor';
        issues: string[];
        suggestions: string[];
      }[];
      recommendations: {
        priority: 'critical' | 'high' | 'medium' | 'low';
        title: string;
        description: string;
        impact: number;
      }[];
    }
  ): Promise<ResumeAnalysis> {
    try {
      const analysis = await this.repository.createAnalysis(userId, tenantId, {
        file_name: analysisPayload.fileName,
        file_type: analysisPayload.fileType,
        file_size_kb: analysisPayload.fileSizeKb,
        job_title: analysisPayload.jobTitle,
        job_description: analysisPayload.jobDescription || null,
        overall_score: analysisPayload.overallScore,
        ats_score: analysisPayload.atsScore,
        readability_score: analysisPayload.readabilityScore,
        keywords_match_score: analysisPayload.detailedScores.keywordsMatch,
        format_structure_score: analysisPayload.detailedScores.formatStructure,
        skills_optimization_score: analysisPayload.detailedScores.skillsOptimization,
        quantified_achievements_score: analysisPayload.detailedScores.quantifiedAchievements,
        job_title_matching_score: analysisPayload.detailedScores.jobTitleMatching,
        project_relevance_score: analysisPayload.detailedScores.projectRelevance,
        dates_experience_score: analysisPayload.detailedScores.datesExperience,
        file_type_naming_score: analysisPayload.detailedScores.fileTypeNaming,
        ats_killers_score: analysisPayload.detailedScores.atsKillers,
        keywords_matched: analysisPayload.keywordMatches,
        total_keywords: analysisPayload.totalKeywords,
        keywords_present: analysisPayload.keywordsPresent,
        keywords_missing: analysisPayload.keywordsMissing,
        sections_analysis: analysisPayload.sections,
        recommendations: analysisPayload.recommendations,
        metadata: {
          analyzerVersion: '1.0',
          algorithmVersion: '10-factor-ats',
          sourceApp: 'ResumeAtsAnalysis',
          processingTimeMs: 0,
        },
      });

      return analysis;
    } catch (error) {
      console.error('Error saving analysis results:', error);
      throw new Error('Failed to save analysis results to database');
    }
  }

  /**
   * Get all analyses for a user
   */
  async getUserAnalyses(
    userId: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: ResumeAnalysis[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;
    const { data, total } = await this.repository.findByUserId(userId, tenantId, skip, limit);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a specific analysis
   */
  async getAnalysis(analysisId: string, tenantId: string): Promise<ResumeAnalysis | null> {
    return await this.repository.findById(analysisId, tenantId);
  }

  /**
   * Get top performing resumes
   */
  async getTopResumes(
    userId: string,
    tenantId: string,
    limit: number = 5
  ): Promise<ResumeAnalysis[]> {
    return await this.repository.findTop(userId, tenantId, limit);
  }

  /**
   * Get analyses for a specific job
   */
  async getAnalysesByJobTitle(
    userId: string,
    jobTitle: string,
    tenantId: string
  ): Promise<ResumeAnalysis[]> {
    return await this.repository.findByJobTitle(userId, jobTitle, tenantId);
  }

  /**
   * Get score trends
   */
  async getScoreTrends(
    userId: string,
    tenantId: string,
    limit: number = 10
  ): Promise<{ analyzedAt: Date; atsScore: number; fileName: string }[]> {
    return await this.repository.getScoreTrends(userId, tenantId, limit);
  }

  /**
   * Get average scores
   */
  async getAverageScores(userId: string, tenantId: string): Promise<{
    avgAtsScore: number;
    avgOverallScore: number;
    avgReadabilityScore: number;
    totalAnalyses: number;
  }> {
    return await this.repository.getAverageScores(userId, tenantId);
  }

  /**
   * Get analyses with minimum score
   */
  async getHighScoringAnalyses(
    userId: string,
    tenantId: string,
    minScore: number = 80
  ): Promise<ResumeAnalysis[]> {
    return await this.repository.findByScoreThreshold(userId, tenantId, minScore);
  }

  /**
   * Delete old analyses
   */
  async cleanupOldAnalyses(
    userId: string,
    tenantId: string,
    daysOld: number = 90
  ): Promise<number> {
    return await this.repository.deleteOlderThan(userId, tenantId, daysOld);
  }

  /**
   * Generate summary statistics for user
   */
  async generateUserSummary(userId: string, tenantId: string): Promise<{
    bestScore: number;
    worstScore: number;
    averages: {
      avgAtsScore: number;
      avgOverallScore: number;
      avgReadabilityScore: number;
    };
    totalAnalyses: number;
    recentAnalyses: ResumeAnalysis[];
    improvementAreas: string[];
  }> {
    const averages = await this.repository.getAverageScores(userId, tenantId);
    const top = await this.repository.findTop(userId, tenantId, 1);
    const bottom = await this.repository.findLowestScored(userId, tenantId);
    const recent = await this.repository.findRecent(userId, tenantId, 3);

    // Identify improvement areas
    const improvementAreas: string[] = [];
    if (averages.avgAtsScore < 70) improvementAreas.push('Overall ATS score needs improvement');
    if (averages.avgReadabilityScore < 75) improvementAreas.push('Resume readability could be better');

    return {
      bestScore: top?.[0]?.ats_score || 0,
      worstScore: bottom?.ats_score || 0,
      averages: {
        avgAtsScore: averages.avgAtsScore,
        avgOverallScore: averages.avgOverallScore,
        avgReadabilityScore: averages.avgReadabilityScore,
      },
      totalAnalyses: averages.totalAnalyses,
      recentAnalyses: recent,
      improvementAreas,
    };
  }
}

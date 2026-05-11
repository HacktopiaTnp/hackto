import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';
import { ResumeAnalysisService } from '../services/ResumeAnalysisService';
import { DatabaseService } from '@core/database/DatabaseService';

/**
 * Resume ATS Controller
 * Handles resume analysis and ATS scoring with database persistence
 */
export class ResumeAtsController {
  public router: Router;
  private resumeService: ResumeAnalysisService;

  constructor() {
    this.router = Router();
    this.initializeService();
    this.registerRoutes();
  }

  private async initializeService(): Promise<void> {
    try {
      const dataSource = await DatabaseService.getConnection();
      this.resumeService = new ResumeAnalysisService(dataSource);
    } catch (error) {
      console.error('Failed to initialize ResumeAtsController service:', error);
      throw error;
    }
  }

  private registerRoutes(): void {
    // Save analysis results
    this.router.post(
      '/analyze',
      asyncHandler((req, res) => this.analyzeResume(req, res))
    );

    // Get all user analyses
    this.router.get(
      '/user/:userId',
      asyncHandler((req, res) => this.getUserResumes(req, res))
    );

    // Get specific analysis
    this.router.get(
      '/:analysisId',
      asyncHandler((req, res) => this.getAnalysis(req, res))
    );

    // Get top scoring resumes
    this.router.get(
      '/user/:userId/top',
      asyncHandler((req, res) => this.getTopResumes(req, res))
    );

    // Get analyses by job title
    this.router.get(
      '/user/:userId/job/:jobTitle',
      asyncHandler((req, res) => this.getAnalysesByJobTitle(req, res))
    );

    // Get score trends
    this.router.get(
      '/user/:userId/trends',
      asyncHandler((req, res) => this.getScoreTrends(req, res))
    );

    // Get average scores
    this.router.get(
      '/user/:userId/stats',
      asyncHandler((req, res) => this.getStatistics(req, res))
    );

    // Get user summary
    this.router.get(
      '/user/:userId/summary',
      asyncHandler((req, res) => this.getUserSummary(req, res))
    );
  }

  /**
   * Save and analyze resume
   * POST /analyze
   */
  private async analyzeResume(req: Request, res: Response): Promise<void> {
    const {
      userId,
      fileName,
      fileType,
      fileSizeKb,
      jobTitle,
      jobDescription,
      analysisData,
    } = req.body;

    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    if (!userId || !fileName || !analysisData) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, fileName, analysisData',
      });
      return;
    }

    try {
      // Save analysis to database
      const savedAnalysis = await this.resumeService.saveAnalysisResults(
        userId,
        tenantId,
        {
          fileName,
          fileType: fileType || 'pdf',
          fileSizeKb: fileSizeKb || 0,
          jobTitle: jobTitle || 'Software Engineer',
          jobDescription: jobDescription || undefined,
          overallScore: analysisData.overallScore,
          atsScore: analysisData.atsScore,
          readabilityScore: analysisData.readabilityScore,
          detailedScores: analysisData.detailedScores,
          keywordMatches: analysisData.keywordMatches,
          totalKeywords: analysisData.totalKeywords,
          keywordsPresent: analysisData.keywordsPresent,
          keywordsMissing: analysisData.keywordsMissing,
          sections: analysisData.sections,
          recommendations: analysisData.recommendations,
        }
      );

      res.status(201).json({
        success: true,
        message: 'Analysis saved successfully',
        data: {
          id: savedAnalysis.id,
          atsScore: savedAnalysis.ats_score,
          overallScore: savedAnalysis.overall_score,
          readabilityScore: savedAnalysis.readability_score,
          analyzedAt: savedAnalysis.analyzed_at,
          fileSize: savedAnalysis.file_size_kb,
        },
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to analyze and save resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all user analyses
   * GET /user/:userId
   */
  private async getUserResumes(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const result = await this.resumeService.getUserAnalyses(userId, tenantId, page, limit);

      res.json({
        success: true,
        data: result.data.map(analysis => ({
          id: analysis.id,
          fileName: analysis.file_name,
          jobTitle: analysis.job_title,
          atsScore: analysis.ats_score,
          overallScore: analysis.overall_score,
          readabilityScore: analysis.readability_score,
          analyzedAt: analysis.analyzed_at,
          keywords: {
            matched: analysis.keywords_matched,
            total: analysis.total_keywords,
          },
        })),
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      console.error('Error fetching user analyses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analyses',
      });
    }
  }

  /**
   * Get specific analysis
   * GET /:analysisId
   */
  private async getAnalysis(req: Request, res: Response): Promise<void> {
    const { analysisId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const analysis = await this.resumeService.getAnalysis(analysisId, tenantId);

      if (!analysis) {
        res.status(404).json({
          success: false,
          error: 'Analysis not found',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: analysis.id,
          fileName: analysis.file_name,
          jobTitle: analysis.job_title,
          scores: {
            overall: analysis.overall_score,
            ats: analysis.ats_score,
            readability: analysis.readability_score,
          },
          detailedScores: {
            keywordsMatch: analysis.keywords_match_score,
            formatStructure: analysis.format_structure_score,
            skillsOptimization: analysis.skills_optimization_score,
            quantifiedAchievements: analysis.quantified_achievements_score,
            jobTitleMatching: analysis.job_title_matching_score,
            projectRelevance: analysis.project_relevance_score,
            datesExperience: analysis.dates_experience_score,
            fileTypeNaming: analysis.file_type_naming_score,
            atsKillers: analysis.ats_killers_score,
          },
          keywords: {
            present: analysis.keywords_present,
            missing: analysis.keywords_missing,
            matched: analysis.keywords_matched,
            total: analysis.total_keywords,
          },
          sections: analysis.sections_analysis,
          recommendations: analysis.recommendations,
          analyzedAt: analysis.analyzed_at,
        },
      });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analysis',
      });
    }
  }

  /**
   * Get top resumes
   * GET /user/:userId/top
   */
  private async getTopResumes(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const analyses = await this.resumeService.getTopResumes(userId, tenantId, limit);

      res.json({
        success: true,
        data: analyses.map(a => ({
          id: a.id,
          fileName: a.file_name,
          jobTitle: a.job_title,
          atsScore: a.ats_score,
          analyzedAt: a.analyzed_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching top resumes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top resumes',
      });
    }
  }

  /**
   * Get analyses by job title
   * GET /user/:userId/job/:jobTitle
   */
  private async getAnalysesByJobTitle(req: Request, res: Response): Promise<void> {
    const { userId, jobTitle } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const analyses = await this.resumeService.getAnalysesByJobTitle(userId, jobTitle, tenantId);

      res.json({
        success: true,
        jobTitle,
        count: analyses.length,
        data: analyses.map(a => ({
          id: a.id,
          fileName: a.file_name,
          atsScore: a.ats_score,
          overallScore: a.overall_score,
          analyzedAt: a.analyzed_at,
        })),
      });
    } catch (error) {
      console.error('Error fetching analyses by job title:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analyses',
      });
    }
  }

  /**
   * Get score trends
   * GET /user/:userId/trends
   */
  private async getScoreTrends(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const trends = await this.resumeService.getScoreTrends(userId, tenantId, limit);

      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      console.error('Error fetching score trends:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch score trends',
      });
    }
  }

  /**
   * Get statistics
   * GET /user/:userId/stats
   */
  private async getStatistics(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const stats = await this.resumeService.getAverageScores(userId, tenantId);

      res.json({
        success: true,
        data: {
          averages: {
            atsScore: stats.avgAtsScore,
            overallScore: stats.avgOverallScore,
            readabilityScore: stats.avgReadabilityScore,
          },
          totalAnalyses: stats.totalAnalyses,
        },
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * Get user summary
   * GET /user/:userId/summary
   */
  private async getUserSummary(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    try {
      const summary = await this.resumeService.generateUserSummary(userId, tenantId);

      res.json({
        success: true,
        data: {
          bestScore: summary.bestScore,
          worstScore: summary.worstScore,
          averages: summary.averages,
          totalAnalyses: summary.totalAnalyses,
          improvementAreas: summary.improvementAreas,
          recentAnalyses: summary.recentAnalyses.map(a => ({
            fileName: a.file_name,
            jobTitle: a.job_title,
            atsScore: a.ats_score,
            analyzedAt: a.analyzed_at,
          })),
        },
      });
    } catch (error) {
      console.error('Error generating user summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate summary',
      });
    }
  }
}

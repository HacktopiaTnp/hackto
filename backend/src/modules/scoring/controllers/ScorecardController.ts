import { Request, Response } from 'express';
import { logger } from '@core/logger/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ScorecardController {
  /**
   * Create interview scorecard
   */
  async createScorecard(req: Request, res: Response): Promise<void> {
    try {
      const {
        roomId,
        candidateId,
        interviewerId,
        dsa_score,
        communication_score,
        code_quality_score,
        optimization_score,
        test_case_pass_score,
        feedback_text,
        recommendation,
        interview_feedback,
      } = req.body;

      if (!roomId || !candidateId || !interviewerId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Validate scores are 0-10
      const scores = [
        dsa_score,
        communication_score,
        code_quality_score,
        optimization_score,
        test_case_pass_score,
      ];

      for (const score of scores) {
        if (score < 0 || score > 10) {
          res
            .status(400)
            .json({ error: 'All scores must be between 0 and 10' });
          return;
        }
      }

      // Calculate overall score (average of 5 dimensions)
      const overallScore =
        (dsa_score +
          communication_score +
          code_quality_score +
          optimization_score +
          test_case_pass_score) /
        5;

      // Auto-determine recommendation if not provided
      let autoRecommendation = recommendation;
      if (!autoRecommendation) {
        if (overallScore >= 8) {
          autoRecommendation = 'shortlist';
        } else if (overallScore >= 6) {
          autoRecommendation = 'maybe';
        } else {
          autoRecommendation = 'reject';
        }
      }

      // Create scorecard
      const scorecard = await prisma.interview_scorecards.create({
        data: {
          interview_room_id: roomId,
          candidate_id: candidateId,
          interviewer_id: interviewerId,
          dsa_score,
          communication_score,
          code_quality_score,
          optimization_score,
          test_case_pass_score,
          overall_score: overallScore,
          feedback_text: feedback_text || '',
          recommendation: autoRecommendation,
        },
      });

      // Create detailed feedback if provided
      if (interview_feedback) {
        await prisma.interview_feedback.create({
          data: {
            interview_room_id: roomId,
            candidate_id: candidateId,
            interviewer_id: interviewerId,
            code_review_score: interview_feedback.codeReviewScore || 0,
            problem_understanding_score:
              interview_feedback.problemUnderstandingScore || 0,
            approach_clarity_score:
              interview_feedback.approachClarityScore || 0,
            edge_case_handling_score:
              interview_feedback.edgeCaseHandlingScore || 0,
            code_review_comment:
              interview_feedback.codeReviewComment || '',
            problem_understanding_comment:
              interview_feedback.problemUnderstandingComment || '',
            approach_clarity_comment:
              interview_feedback.approachClarityComment || '',
            edge_case_handling_comment:
              interview_feedback.edgeCaseHandlingComment || '',
          },
        });
      }

      logger.info(`Scorecard created for room ${roomId}`);

      res.status(201).json({
        success: true,
        data: scorecard,
      });
    } catch (error) {
      logger.error('Create Scorecard Error', error);
      res.status(500).json({ error: 'Failed to create scorecard' });
    }
  }

  /**
   * Get scorecard by room
   */
  async getScorecardByRoom(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      const scorecard = await prisma.interview_scorecards.findUnique({
        where: { interview_room_id: roomId },
        include: {
          interview_feedback: true,
          auth_users_candidate: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          auth_users_interviewer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!scorecard) {
        res.status(404).json({ error: 'Scorecard not found' });
        return;
      }

      res.json({
        success: true,
        data: scorecard,
      });
    } catch (error) {
      logger.error('Get Scorecard Error', error);
      res.status(500).json({ error: 'Failed to fetch scorecard' });
    }
  }

  /**
   * Get scorecards for candidate
   */
  async getCandidateScorecards(req: Request, res: Response): Promise<void> {
    try {
      const { candidateId } = req.params;
      const { limit = 20, offset = 0, sortBy = 'created_at' } = req.query;

      const scorecards = await prisma.interview_scorecards.findMany({
        where: { candidate_id: candidateId },
        include: {
          auth_users_interviewer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          interview_rooms: {
            select: {
              id: true,
              coding_problems: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy as string]: 'desc',
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      // Calculate statistics
      const stats = await this.calculateCandidateStats(candidateId);

      res.json({
        success: true,
        data: scorecards,
        statistics: stats,
      });
    } catch (error) {
      logger.error('Get Candidate Scorecards Error', error);
      res.status(500).json({ error: 'Failed to fetch scorecards' });
    }
  }

  /**
   * Get interviewer's evaluations
   */
  async getInterviewerEvaluations(req: Request, res: Response): Promise<void> {
    try {
      const { interviewerId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const scorecards = await prisma.interview_scorecards.findMany({
        where: { interviewer_id: interviewerId },
        include: {
          auth_users_candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          interview_rooms: true,
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      // Count by recommendation
      const recommendationStats = await prisma.interview_scorecards.groupBy({
        by: ['recommendation'],
        where: { interviewer_id: interviewerId },
        _count: true,
      });

      res.json({
        success: true,
        data: scorecards,
        recommendationStats: Object.fromEntries(
          recommendationStats.map((r) => [r.recommendation, r._count])
        ),
      });
    } catch (error) {
      logger.error('Get Interviewer Evaluations Error', error);
      res.status(500).json({ error: 'Failed to fetch evaluations' });
    }
  }

  /**
   * Update scorecard
   */
  async updateScorecard(req: Request, res: Response): Promise<void> {
    try {
      const { scorecardId } = req.params;
      const {
        dsa_score,
        communication_score,
        code_quality_score,
        optimization_score,
        test_case_pass_score,
        feedback_text,
        recommendation,
      } = req.body;

      // Validate scores if provided
      if (
        (dsa_score !== undefined && (dsa_score < 0 || dsa_score > 10)) ||
        (communication_score !== undefined &&
          (communication_score < 0 || communication_score > 10)) ||
        (code_quality_score !== undefined &&
          (code_quality_score < 0 || code_quality_score > 10)) ||
        (optimization_score !== undefined &&
          (optimization_score < 0 || optimization_score > 10)) ||
        (test_case_pass_score !== undefined &&
          (test_case_pass_score < 0 || test_case_pass_score > 10))
      ) {
        res
          .status(400)
          .json({ error: 'All scores must be between 0 and 10' });
        return;
      }

      // Get current scorecard to calculate new overall_score
      const current = await prisma.interview_scorecards.findUnique({
        where: { id: scorecardId },
      });

      if (!current) {
        res.status(404).json({ error: 'Scorecard not found' });
        return;
      }

      // Calculate new overall score
      const newDSA = dsa_score !== undefined ? dsa_score : current.dsa_score;
      const newComm =
        communication_score !== undefined
          ? communication_score
          : current.communication_score;
      const newQuality =
        code_quality_score !== undefined
          ? code_quality_score
          : current.code_quality_score;
      const newOpt =
        optimization_score !== undefined
          ? optimization_score
          : current.optimization_score;
      const newTest =
        test_case_pass_score !== undefined
          ? test_case_pass_score
          : current.test_case_pass_score;

      const newOverallScore = (newDSA + newComm + newQuality + newOpt + newTest) / 5;

      const updatedScorecard = await prisma.interview_scorecards.update({
        where: { id: scorecardId },
        data: {
          ...(dsa_score !== undefined && { dsa_score }),
          ...(communication_score !== undefined && { communication_score }),
          ...(code_quality_score !== undefined && { code_quality_score }),
          ...(optimization_score !== undefined && { optimization_score }),
          ...(test_case_pass_score !== undefined && { test_case_pass_score }),
          overall_score: newOverallScore,
          ...(feedback_text !== undefined && { feedback_text }),
          ...(recommendation !== undefined && { recommendation }),
          updated_at: new Date(),
        },
      });

      logger.info(`Scorecard updated: ${scorecardId}`);

      res.json({
        success: true,
        data: updatedScorecard,
      });
    } catch (error) {
      logger.error('Update Scorecard Error', error);
      res.status(500).json({ error: 'Failed to update scorecard' });
    }
  }

  /**
   * Delete scorecard
   */
  async deleteScorecard(req: Request, res: Response): Promise<void> {
    try {
      const { scorecardId } = req.params;

      // Delete related feedback
      await prisma.interview_feedback.deleteMany({
        where: { interview_room_id: scorecardId }, // Assuming feedback is linked via room
      });

      // Delete scorecard
      await prisma.interview_scorecards.delete({
        where: { id: scorecardId },
      });

      logger.info(`Scorecard deleted: ${scorecardId}`);

      res.json({
        success: true,
        message: 'Scorecard deleted successfully',
      });
    } catch (error) {
      logger.error('Delete Scorecard Error', error);
      res.status(500).json({ error: 'Failed to delete scorecard' });
    }
  }

  /**
   * Generate scorecard report
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { roomId } = req.params;

      // Get scorecard with feedback
      const scorecard = await prisma.interview_scorecards.findUnique({
        where: { interview_room_id: roomId },
        include: {
          interview_feedback: true,
          auth_users_candidate: {
            select: {
              name: true,
              email: true,
            },
          },
          interview_rooms: {
            include: {
              coding_problems: true,
            },
          },
        },
      });

      if (!scorecard) {
        res.status(404).json({ error: 'Scorecard not found' });
        return;
      }

      // Get submissions
      const submissions = await prisma.submissions.findMany({
        where: {
          problem_id: scorecard.interview_rooms.problem_id,
          user_id: scorecard.candidate_id,
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      });

      // Get activity log
      const activities = await prisma.interview_activity_logs.findMany({
        where: { interview_room_id: roomId },
        orderBy: { timestamp: 'desc' },
      });

      // Generate report
      const report = {
        candidate: scorecard.auth_users_candidate,
        problem: scorecard.interview_rooms.coding_problems,
        scores: {
          dsa: scorecard.dsa_score,
          communication: scorecard.communication_score,
          codeQuality: scorecard.code_quality_score,
          optimization: scorecard.optimization_score,
          testCasePass: scorecard.test_case_pass_score,
          overall: scorecard.overall_score,
        },
        recommendation: scorecard.recommendation,
        feedback: scorecard.feedback_text,
        detailedFeedback: scorecard.interview_feedback,
        submissions,
        activities,
        generatedAt: new Date(),
      };

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Generate Report Error', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }

  /**
   * Calculate candidate statistics
   */
  private async calculateCandidateStats(candidateId: string) {
    const scorecards = await prisma.interview_scorecards.findMany({
      where: { candidate_id: candidateId },
    });

    if (scorecards.length === 0) {
      return {
        totalInterviews: 0,
        averageScore: 0,
        shortlisted: 0,
        rejected: 0,
      };
    }

    const shortlisted = scorecards.filter(
      (s) => s.recommendation === 'shortlist'
    ).length;
    const rejected = scorecards.filter(
      (s) => s.recommendation === 'reject'
    ).length;
    const averageScore =
      scorecards.reduce((sum, s) => sum + (s.overall_score || 0), 0) /
      scorecards.length;

    return {
      totalInterviews: scorecards.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      shortlisted,
      rejected,
    };
  }
}

export default new ScorecardController();

import { Request, Response } from 'express';
import { logger } from '@core/logger/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProblemController {
  /**
   * Get all problems with filters
   */
  async listProblems(req: Request, res: Response): Promise<void> {
    try {
      const {
        difficulty,
        category,
        search,
        limit = 20,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = req.query;

      const where: any = {};

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (category) {
        where.category = category;
      }

      if (search) {
        where.OR = [
          {
            title: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
        ];
      }

      // Get total count
      const total = await prisma.coding_problems.count({ where });

      // Get problems with pagination
      const problems = await prisma.coding_problems.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          category: true,
          tags: true,
          test_case_count: true,
          acceptance_rate: true,
          created_at: true,
        },
        orderBy: {
          [sortBy as string]: (sortOrder as string).toLowerCase(),
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      res.json({
        success: true,
        data: problems,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      });
    } catch (error) {
      logger.error('List Problems Error', error);
      res.status(500).json({ error: 'Failed to fetch problems' });
    }
  }

  /**
   * Get problem details with test cases
   */
  async getProblem(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;

      const problem = await prisma.coding_problems.findUnique({
        where: { id: problemId },
        include: {
          problem_test_cases: {
            select: {
              id: true,
              input_data: true,
              expected_output: true,
              is_hidden: false, // Don't include hidden test cases for client
            },
          },
        },
      });

      if (!problem) {
        res.status(404).json({ error: 'Problem not found' });
        return;
      }

      // Get statistics
      const stats = await prisma.problem_statistics.findUnique({
        where: { problem_id: problemId },
      });

      res.json({
        success: true,
        data: {
          ...problem,
          statistics: stats,
        },
      });
    } catch (error) {
      logger.error('Get Problem Error', error);
      res.status(500).json({ error: 'Failed to fetch problem' });
    }
  }

  /**
   * Create new problem (Admin only)
   */
  async createProblem(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        difficulty,
        category,
        tags,
        testCases,
        timeLimit = 2000, // milliseconds
        memoryLimit = 256, // MB
      } = req.body;

      if (!title || !description || !difficulty || !category || !testCases) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Create problem
      const problem = await prisma.coding_problems.create({
        data: {
          title,
          description,
          difficulty: difficulty.toLowerCase(),
          category,
          tags: tags || [],
          test_case_count: testCases.length,
          acceptance_rate: 0,
          time_limit_ms: timeLimit,
          memory_limit_mb: memoryLimit,
        },
      });

      // Create test cases
      const createdTestCases = await Promise.all(
        testCases.map((tc: any) =>
          prisma.problem_test_cases.create({
            data: {
              problem_id: problem.id,
              input_data: tc.input,
              expected_output: tc.expectedOutput,
              is_hidden: tc.isHidden || false,
            },
          })
        )
      );

      // Create statistics entry
      await prisma.problem_statistics.create({
        data: {
          problem_id: problem.id,
          total_submissions: 0,
          total_accepted: 0,
          average_runtime_ms: 0,
          average_memory_mb: 0,
          compilation_errors: 0,
          runtime_errors: 0,
          time_limit_exceeded: 0,
          wrong_answer: 0,
        },
      });

      logger.info(`Problem created: ${problem.id}`);

      res.status(201).json({
        success: true,
        data: {
          ...problem,
          testCases: createdTestCases,
        },
      });
    } catch (error) {
      logger.error('Create Problem Error', error);
      res.status(500).json({ error: 'Failed to create problem' });
    }
  }

  /**
   * Update problem (Admin only)
   */
  async updateProblem(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;
      const {
        title,
        description,
        difficulty,
        category,
        tags,
        timeLimit,
        memoryLimit,
      } = req.body;

      const problem = await prisma.coding_problems.update({
        where: { id: problemId },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(difficulty && { difficulty: difficulty.toLowerCase() }),
          ...(category && { category }),
          ...(tags && { tags }),
          ...(timeLimit && { time_limit_ms: timeLimit }),
          ...(memoryLimit && { memory_limit_mb: memoryLimit }),
        },
      });

      logger.info(`Problem updated: ${problemId}`);

      res.json({
        success: true,
        data: problem,
      });
    } catch (error) {
      logger.error('Update Problem Error', error);
      res.status(500).json({ error: 'Failed to update problem' });
    }
  }

  /**
   * Delete problem (Admin only)
   */
  async deleteProblem(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;

      // Delete related test cases and statistics
      await prisma.problem_test_cases.deleteMany({
        where: { problem_id: problemId },
      });

      await prisma.problem_statistics.delete({
        where: { problem_id: problemId },
      });

      // Delete problem
      await prisma.coding_problems.delete({
        where: { id: problemId },
      });

      logger.info(`Problem deleted: ${problemId}`);

      res.json({
        success: true,
        message: 'Problem deleted successfully',
      });
    } catch (error) {
      logger.error('Delete Problem Error', error);
      res.status(500).json({ error: 'Failed to delete problem' });
    }
  }

  /**
   * Get problem statistics
   */
  async getProblemStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;

      const stats = await prisma.problem_statistics.findUnique({
        where: { problem_id: problemId },
      });

      if (!stats) {
        res.status(404).json({ error: 'Statistics not found' });
        return;
      }

      // Calculate acceptance rate
      const acceptanceRate =
        stats.total_submissions > 0
          ? ((stats.total_accepted / stats.total_submissions) * 100).toFixed(2)
          : 0;

      res.json({
        success: true,
        data: {
          ...stats,
          acceptanceRate,
          errorDistribution: {
            compilationErrors: stats.compilation_errors,
            runtimeErrors: stats.runtime_errors,
            timeLimitExceeded: stats.time_limit_exceeded,
            wrongAnswer: stats.wrong_answer,
          },
        },
      });
    } catch (error) {
      logger.error('Get Problem Statistics Error', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Get category list
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.coding_problems.findMany({
        distinct: ['category'],
        select: { category: true },
      });

      const categoryList = categories.map((c) => c.category).filter(Boolean);

      res.json({
        success: true,
        data: categoryList,
      });
    } catch (error) {
      logger.error('Get Categories Error', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  /**
   * Search problems
   */
  async searchProblems(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit = 10 } = req.query;

      if (!query || (query as string).trim().length < 2) {
        res.status(400).json({ error: 'Query too short' });
        return;
      }

      const problems = await prisma.coding_problems.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query as string,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: query as string,
                mode: 'insensitive',
              },
            },
            {
              tags: {
                hasSome: [(query as string).toLowerCase()],
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: true,
          acceptance_rate: true,
        },
        take: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: problems,
      });
    } catch (error) {
      logger.error('Search Problems Error', error);
      res.status(500).json({ error: 'Failed to search problems' });
    }
  }
}

export default new ProblemController();

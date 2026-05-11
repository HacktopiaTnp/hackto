import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * DSA Tracker Controller
 * Handles DSA problem tracking and progress
 */
export class DsaTrackerController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/problems',
      asyncHandler((req, res) => this.getProblems(req, res))
    );

    this.router.get(
      '/user/:userId/progress',
      asyncHandler((req, res) => this.getUserProgress(req, res))
    );

    this.router.post(
      '/problems/:problemId/submit',
      asyncHandler((req, res) => this.submitSolution(req, res))
    );

    this.router.get(
      '/stats',
      asyncHandler((req, res) => this.getStats(req, res))
    );
  }

  private async getProblems(_req: Request, res: Response): Promise<void> {
    const problems = [
      {
        id: 1,
        title: 'Two Sum',
        category: 'Array',
        difficulty: 'Easy',
        acceptance: 48.3,
        solved: true,
        attempts: 2,
        bestTime: '00:15:32',
        companies: ['Google', 'Amazon', 'Facebook'],
      },
      {
        id: 2,
        title: 'Add Two Numbers',
        category: 'LinkedList',
        difficulty: 'Medium',
        acceptance: 31.4,
        solved: false,
        attempts: 1,
        companies: ['Google', 'Amazon'],
      },
      {
        id: 3,
        title: 'Longest Substring Without Repeating Characters',
        category: 'String',
        difficulty: 'Medium',
        acceptance: 33.0,
        solved: true,
        attempts: 3,
        bestTime: '00:25:14',
        companies: ['Google', 'Amazon', 'Microsoft'],
      },
      {
        id: 4,
        title: 'Median of Two Sorted Arrays',
        category: 'Array',
        difficulty: 'Hard',
        acceptance: 27.3,
        solved: false,
        attempts: 0,
        companies: ['Google', 'Amazon'],
      },
      {
        id: 5,
        title: 'Longest Palindromic Substring',
        category: 'String',
        difficulty: 'Medium',
        acceptance: 32.2,
        solved: false,
        attempts: 1,
        companies: ['Amazon', 'Microsoft'],
      },
    ];

    res.json({
      success: true,
      data: problems,
    });
  }

  private async getUserProgress(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const progress = {
      userId,
      totalSolved: 87,
      totalAttempts: 156,
      acceptanceRate: 55.8,
      consecutiveDays: 23,
      level: 'Intermediate',
      byCategory: {
        Array: { solved: 32, total: 58 },
        String: { solved: 28, total: 54 },
        LinkedList: { solved: 15, total: 39 },
        Tree: { solved: 12, total: 48 },
      },
      byDifficulty: {
        Easy: { solved: 45, total: 64 },
        Medium: { solved: 32, total: 78 },
        Hard: { solved: 10, total: 92 },
      },
      recentSolutions: [
        { id: 1, title: 'Two Sum', date: new Date().toISOString(), time: '00:15:32' },
        { id: 3, title: 'Longest Substring', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), time: '00:25:14' },
      ],
    };

    res.json({
      success: true,
      data: progress,
    });
  }

  private async submitSolution(req: Request, res: Response): Promise<void> {
    const { problemId } = req.params;
    const { code: _code, language } = req.body;

    const result = {
      submissionId: `sub-${Date.now()}`,
      problemId,
      language,
      status: 'Accepted',
      runtime: '32ms',
      memory: '16.2 MB',
      runtimePercentile: 76,
      memoryPercentile: 82,
      feedback: 'Great solution! Well optimized.',
    };

    res.json({
      success: true,
      data: result,
    });
  }

  private async getStats(_req: Request, res: Response): Promise<void> {
    const stats = {
      totalProblems: 234,
      totalSolved: 87,
      easySolved: 45,
      mediumSolved: 32,
      hardSolved: 10,
      acceptanceRate: 55.8,
      consecutiveDays: 23,
      bestStreak: 45,
      topCategories: [
        { name: 'Array', problemsSolved: 32 },
        { name: 'String', problemsSolved: 28 },
        { name: 'LinkedList', problemsSolved: 15 },
      ],
    };

    res.json({
      success: true,
      data: stats,
    });
  }
}

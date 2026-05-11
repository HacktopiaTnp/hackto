import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Dashboard Controller
 * Handles dashboard statistics and overview data
 */
export class DashboardController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  /**
   * Register routes
   */
  private registerRoutes(): void {
    // GET /api/v1/dashboard/stats
    this.router.get(
      '/stats',
      asyncHandler((req, res) => this.getStats(req, res))
    );

    // GET /api/v1/dashboard/overview
    this.router.get(
      '/overview',
      asyncHandler((req, res) => this.getOverview(req, res))
    );

    // GET /api/v1/dashboard/recent-activity
    this.router.get(
      '/recent-activity',
      asyncHandler((req, res) => this.getRecentActivity(req, res))
    );
  }

  /**
   * Get dashboard statistics
   */
  private async getStats(_req: Request, res: Response): Promise<void> {
    const stats = {
      totalInterviews: Math.floor(Math.random() * 50) + 10,
      averageScore: Math.floor(Math.random() * 40) + 60,
      completedApplications: Math.floor(Math.random() * 20) + 3,
      upcomingInterviews: Math.floor(Math.random() * 5) + 1,
      companiesFollowing: Math.floor(Math.random() * 15) + 5,
      resumeScores: Math.floor(Math.random() * 40) + 60,
      dsaProblemsSolved: Math.floor(Math.random() * 100) + 50,
      oaAttempts: Math.floor(Math.random() * 10) + 2,
    };

    res.json({
      success: true,
      data: stats,
    });
  }

  /**
   * Get dashboard overview
   */
  private async getOverview(_req: Request, res: Response): Promise<void> {
    const overview = {
      userName: 'John Doe',
      userRole: 'Software Engineer Aspirant',
      profileCompletion: 85,
      nextMilestone: 'Complete 50 DSA Problems',
      recentBadges: [
        { name: 'Problem Solver', date: '2026-04-10' },
        { name: 'Interview Master', date: '2026-04-08' },
        { name: 'Consistency Streak', date: '2026-04-05' },
      ],
      goals: [
        { id: 1, title: 'Master Arrays & Strings', progress: 75, target: 100 },
        { id: 2, title: 'System Design Basics', progress: 45, target: 100 },
        { id: 3, title: '50 Mock Interviews', progress: 32, target: 50 },
      ],
    };

    res.json({
      success: true,
      data: overview,
    });
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(_req: Request, res: Response): Promise<void> {
    const activities = [
      {
        id: 1,
        type: 'interview_completed',
        title: 'Completed Interview',
        description: 'Google - System Design Round',
        score: 87,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '🎯',
      },
      {
        id: 2,
        type: 'problem_solved',
        title: 'Problem Solved',
        description: 'LeetCode #1 - Two Sum',
        difficulty: 'Easy',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '✅',
      },
      {
        id: 3,
        type: 'resume_uploaded',
        title: 'Resume Updated',
        description: 'Resume uploaded and analyzed',
        score: 82,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '📄',
      },
      {
        id: 4,
        type: 'application_submitted',
        title: 'Application Submitted',
        description: 'Applied to Amazon SDE Role',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '📮',
      },
      {
        id: 5,
        type: 'blog_read',
        title: 'Blog Read',
        description: 'System Design Interview Tips',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        icon: '📚',
      },
    ];

    res.json({
      success: true,
      data: activities,
    });
  }
}

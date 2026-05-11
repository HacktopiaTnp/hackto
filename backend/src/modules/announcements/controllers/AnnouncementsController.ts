import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Announcements Controller
 * Handles announcements, notifications, and updates
 */
export class AnnouncementsController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/list',
      asyncHandler((req, res) => this.getAnnouncements(req, res))
    );

    this.router.get(
      '/:announcementId',
      asyncHandler((req, res) => this.getAnnouncementDetail(req, res))
    );

    this.router.post(
      '/:announcementId/read',
      asyncHandler((req, res) => this.markAsRead(req, res))
    );

    this.router.get(
      '/user/:userId/unread',
      asyncHandler((req, res) => this.getUnreadCount(req, res))
    );
  }

  private async getAnnouncements(_req: Request, res: Response): Promise<void> {
    const announcements = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Google is hiring for SDE roles!',
        description: 'Google is actively recruiting for Software Development Engineer positions across multiple locations.',
        date: new Date().toISOString(),
        priority: 'high',
        icon: '🔍',
        read: false,
        actionUrl: '/jobs?company=Google',
      },
      {
        id: 2,
        type: 'feature',
        title: 'New Mock Interview Feature Released',
        description: 'Practice live coding interviews with AI feedback and peer connections now available.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        icon: '✨',
        read: false,
        actionUrl: '/mock-interview',
      },
      {
        id: 3,
        type: 'event',
        title: 'System Design Workshop Tomorrow at 6 PM',
        description: 'Join our expert panel discussing real-world system design challenges.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        icon: '📅',
        read: true,
        actionUrl: '/events',
      },
      {
        id: 4,
        type: 'achievement',
        title: 'Congratulations! You reached Level 10 in DSA',
        description: 'Your hard work paid off! You have solved 100 problems.',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'low',
        icon: '🏆',
        read: true,
      },
      {
        id: 5,
        type: 'news',
        title: 'Tech Industry News: 5 New Startups to Watch',
        description: 'Check out the emerging companies that are changing the tech landscape.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        icon: '📰',
        read: true,
      },
    ];

    res.json({
      success: true,
      data: announcements,
    });
  }

  private async getAnnouncementDetail(req: Request, res: Response): Promise<void> {
    const { announcementId } = req.params;

    const announcement = {
      id: announcementId,
      type: 'opportunity',
      title: 'Google is hiring for SDE roles!',
      description:
        'Google is actively recruiting for Software Development Engineer positions across multiple locations.',
      fullContent: `
# Google is Hiring for SDE Roles!

Google is actively expanding its engineering team and is looking for talented Software Development Engineers.

## Positions Available:
- Senior Software Engineer
- Software Engineer
- Junior Software Engineer

## Locations:
- Mountain View, CA
- Chicago, IL
- New York, NY
- Seattle, WA

## Requirements:
- Bachelor's degree in Computer Science or related field
- Strong foundation in data structures and algorithms
- Experience with at least one programming language
- Problem-solving and communication skills

## Application Deadline:
May 15, 2026

Start your application today to join one of the world's leading tech companies!
      `,
      date: new Date().toISOString(),
      priority: 'high',
      icon: '🔍',
      read: false,
      category: 'Job Opportunity',
      author: 'Google Careers',
      actionUrl: '/jobs?company=Google',
      actionText: 'View All Google Jobs',
    };

    res.json({
      success: true,
      data: announcement,
    });
  }

  private async markAsRead(req: Request, res: Response): Promise<void> {
    const { announcementId } = req.params;
    const { userId } = req.body;

    const result = {
      announcementId,
      userId,
      readAt: new Date().toISOString(),
      success: true,
    };

    res.json({
      success: true,
      data: result,
    });
  }

  private async getUnreadCount(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const unreadData = {
      userId,
      unreadCount: 5,
      unreadByType: {
        opportunity: 2,
        feature: 1,
        event: 1,
        achievement: 0,
        news: 1,
      },
      hasHighPriority: true,
    };

    res.json({
      success: true,
      data: unreadData,
    });
  }
}

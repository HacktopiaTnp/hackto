import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Blogs Controller
 * Handles blog posts and articles
 */
export class BlogsController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/list',
      asyncHandler((req, res) => this.getBlogsList(req, res))
    );

    this.router.get(
      '/:blogId',
      asyncHandler((req, res) => this.getBlogDetail(req, res))
    );

    this.router.get(
      '/category/:category',
      asyncHandler((req, res) => this.getBlogsByCategory(req, res))
    );

    this.router.post(
      '/:blogId/like',
      asyncHandler((req, res) => this.likeBlog(req, res))
    );
  }

  private async getBlogsList(_req: Request, res: Response): Promise<void> {
    const blogs = [
      {
        id: 1,
        title: 'System Design Interview Tips',
        author: 'Raj Kumar',
        category: 'Interview Tips',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: '8 min',
        likes: 1243,
        views: 5231,
        excerpt: 'Learn key concepts and strategies for acing system design interviews at top tech companies.',
        thumbnail: '🏗️',
      },
      {
        id: 2,
        title: 'Dynamic Programming Guide for Beginners',
        author: 'Sofia Chen',
        category: 'DSA',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: '12 min',
        likes: 2134,
        views: 8923,
        excerpt: 'Master dynamic programming with practical examples and step-by-step explanations.',
        thumbnail: '📊',
      },
      {
        id: 3,
        title: 'Company Culture at FAANG',
        author: 'Priya Sharma',
        category: 'Company Insights',
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: '6 min',
        likes: 892,
        views: 4562,
        excerpt: 'Explore the work culture and team dynamics at leading tech companies.',
        thumbnail: '🏢',
      },
      {
        id: 4,
        title: 'Resume Tips That Get You Interviews',
        author: 'Alex Turner',
        category: 'Career',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: '5 min',
        likes: 3245,
        views: 12543,
        excerpt: 'Proven strategies to make your resume stand out and get noticed by recruiters.',
        thumbnail: '📄',
      },
    ];

    res.json({
      success: true,
      data: blogs,
    });
  }

  private async getBlogDetail(req: Request, res: Response): Promise<void> {
    const { blogId } = req.params;

    const blog = {
      id: blogId,
      title: 'System Design Interview Tips',
      author: 'Raj Kumar',
      authorRole: 'Senior Engineer at Google',
      category: 'Interview Tips',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: '8 min',
      likes: 1243,
      views: 5231,
      content: `
# System Design Interview Tips

System design interviews are crucial for landing senior engineering roles. Here are key strategies:

## 1. Clarify Requirements
Always start by asking clarifying questions about the problem scope, scale, and constraints.

## 2. Think About Trade-offs
Consider different architectural approaches and their trade-offs in terms of scalability, consistency, and latency.

## 3. Draw Diagrams
Visual representation helps communicate your ideas clearly. Use standard symbols for databases, caches, and services.

## 4. Discuss Bottlenecks
Identify potential bottlenecks and propose solutions to scale the system.

## 5. Practice Common Patterns
Study common patterns like load balancing, database sharding, and caching strategies.
      `,
      tags: ['System Design', 'Interview', 'FAANG', 'Backend'],
      relatedBlogs: [
        { id: 5, title: 'Microservices Architecture' },
        { id: 6, title: 'Database Design Patterns' },
      ],
      comments: 23,
    };

    res.json({
      success: true,
      data: blog,
    });
  }

  private async getBlogsByCategory(req: Request, res: Response): Promise<void> {
    const { category } = req.params;

    const blogs = [
      {
        id: 1,
        title: 'System Design Interview Tips',
        author: 'Raj Kumar',
        category,
        date: new Date().toISOString(),
        readTime: '8 min',
        likes: 1243,
      },
      {
        id: 2,
        title: 'Scalability Patterns',
        author: 'Sarah Lee',
        category,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        readTime: '10 min',
        likes: 856,
      },
    ];

    res.json({
      success: true,
      data: blogs,
    });
  }

  private async likeBlog(req: Request, res: Response): Promise<void> {
    const { blogId } = req.params;
    const { userId } = req.body;

    const like = {
      id: `like-${Date.now()}`,
      blogId,
      userId,
      likedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: like,
    });
  }
}

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Mock Interview Controller
 * Handles mock interview endpoints
 */
export class MockInterviewController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  /**
   * Register routes
   */
  private registerRoutes(): void {
    // GET /api/mock-interview/types
    this.router.get(
      '/types',
      asyncHandler((req, res) => this.getInterviewTypes(req, res))
    );

    // GET /api/mock-interview/companies
    this.router.get(
      '/companies',
      asyncHandler((req, res) => this.getCompanies(req, res))
    );

    // GET /api/mock-interview/questions
    this.router.get(
      '/questions',
      asyncHandler((req, res) => this.getQuestions(req, res))
    );

    // GET /api/mock-interview/plans
    this.router.get(
      '/plans',
      asyncHandler((req, res) => this.getPlans(req, res))
    );

    // GET /api/mock-interview/peers
    this.router.get(
      '/peers',
      asyncHandler((req, res) => this.getPeers(req, res))
    );

    // GET /api/mock-interview/user/:userId/progress
    this.router.get(
      '/user/:userId/progress',
      asyncHandler((req, res) => this.getUserProgress(req, res))
    );

    // POST /api/mock-interview/sessions - Create new session
    this.router.post(
      '/sessions',
      asyncHandler((req, res) => this.createSession(req, res))
    );

    // GET /api/mock-interview/sessions/:sessionId/questions - Get questions for session
    this.router.get(
      '/sessions/:sessionId/questions',
      asyncHandler((req, res) => this.getSessionQuestions(req, res))
    );

    // POST /api/mock-interview/sessions/:sessionId/response - Submit response
    this.router.post(
      '/sessions/:sessionId/response',
      asyncHandler((req, res) => this.submitResponse(req, res))
    );

    // POST /api/mock-interview/sessions/:sessionId/submit - Submit session
    this.router.post(
      '/sessions/:sessionId/submit',
      asyncHandler((req, res) => this.submitSession(req, res))
    );
  }

  /**
   * Get interview types
   */
  private async getInterviewTypes(_req: Request, res: Response): Promise<void> {
    const interviewTypes = [
      {
        id: 'dsa',
        name: '🎯 DSA / Coding Interview',
        icon: 'Code',
        description: 'Data Structures & Algorithms',
        color: 'from-blue-500 to-blue-600',
      },
      {
        id: 'system-design',
        name: '🏗️ System Design',
        icon: 'Target',
        description: 'Large-scale systems',
        color: 'from-purple-500 to-purple-600',
      },
      {
        id: 'behavioral',
        name: '🎙️ Behavioral / HR',
        icon: 'MessageSquare',
        description: 'HR & soft skills',
        color: 'from-green-500 to-green-600',
      },
      {
        id: 'cs-fundamentals',
        name: '📚 CS Fundamentals',
        icon: 'BookOpen',
        description: 'Core CS concepts',
        color: 'from-yellow-500 to-yellow-600',
      },
      {
        id: 'oop-lld',
        name: '🔧 OOP / LLD',
        icon: 'Zap',
        description: 'Design patterns',
        color: 'from-orange-500 to-orange-600',
      },
      {
        id: 'resume',
        name: '📄 Resume Based',
        icon: 'FileText',
        description: 'Project-based',
        color: 'from-red-500 to-red-600',
      },
    ];

    res.json({
      success: true,
      data: interviewTypes,
    });
  }

  /**
   * Get companies with rounds
   */
  private async getCompanies(_req: Request, res: Response): Promise<void> {
    const companies = [
      {
        id: 1,
        name: 'Google',
        icon: '🔍',
        rounds: [
          'Phone Screen',
          'DSA Round 1',
          'DSA Round 2',
          'System Design',
          'Behavioral',
        ],
      },
      {
        id: 2,
        name: 'Amazon',
        icon: '📦',
        rounds: [
          'OA',
          'DSA Round 1',
          'DSA Round 2',
          'System Design',
          'LP + Behavioral',
        ],
      },
      {
        id: 3,
        name: 'Microsoft',
        icon: '🪟',
        rounds: ['DSA Round 1', 'DSA Round 2', 'System Design', 'Behavioral'],
      },
      {
        id: 4,
        name: 'Apple',
        icon: '🍎',
        rounds: ['DSA Round 1', 'DSA Round 2', 'System Design'],
      },
      {
        id: 5,
        name: 'Meta',
        icon: 'f',
        rounds: ['Phone Screen', 'DSA Rounds', 'System Design', 'Behavioral'],
      },
      {
        id: 6,
        name: 'Netflix',
        icon: '🎬',
        rounds: ['DSA Challenge', 'System Design', 'Culture Fit'],
      },
    ];

    res.json({
      success: true,
      data: companies,
    });
  }

  /**
   * Get question bank categories
   */
  private async getQuestions(_req: Request, res: Response): Promise<void> {
    const questionBank = [
      { name: 'Arrays', problems: 145, easy: 32, medium: 78, hard: 35 },
      { name: 'Strings', problems: 98, easy: 24, medium: 52, hard: 22 },
      { name: 'Trees', problems: 112, easy: 28, medium: 62, hard: 22 },
      { name: 'Graphs', problems: 87, easy: 15, medium: 48, hard: 24 },
      { name: 'Dynamic Programming', problems: 154, easy: 12, medium: 89, hard: 53 },
      { name: 'Linked Lists', problems: 64, easy: 20, medium: 32, hard: 12 },
      { name: 'Stacks & Queues', problems: 73, easy: 18, medium: 42, hard: 13 },
      { name: 'Hash Tables', problems: 52, easy: 15, medium: 28, hard: 9 },
    ];

    res.json({
      success: true,
      data: questionBank,
    });
  }

  /**
   * Get subscription plans
   */
  private async getPlans(_req: Request, res: Response): Promise<void> {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        period: '/month',
        features: [
          '✓ 3 mocks/week',
          '✓ Basic feedback',
          '✓ DSA only',
          '✗ No AI features',
          '✗ Limited company rounds',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 9.99,
        period: '/month',
        features: [
          '✓ Unlimited mocks',
          '✓ AI voice feedback',
          '✓ All company rounds',
          '✓ Peer connections',
          '✓ Resume review',
        ],
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 19.99,
        period: '/month',
        features: [
          '✓ Everything in Pro',
          '✓ 1-on-1 mentoring',
          '✓ Priority support',
          '✓ Custom mock sessions',
          '✓ Career guidance',
        ],
      },
    ];

    res.json({
      success: true,
      data: plans,
    });
  }

  /**
   * Get peers available for mock interviews
   */
  private async getPeers(_req: Request, res: Response): Promise<void> {
    const peers = [
      {
        id: 1,
        name: 'Priya Sharma',
        title: 'Senior Software Engineer',
        experience: '5 years',
        specialization: 'DSA & System Design',
        rating: 4.9,
        available: true,
        avatar: '👩‍💻',
      },
      {
        id: 2,
        name: 'Rajesh Kumar',
        title: 'Software Engineer II',
        experience: '3 years',
        specialization: 'Full Stack Development',
        rating: 4.7,
        available: true,
        avatar: '👨‍💻',
      },
      {
        id: 3,
        name: 'Neha Patel',
        title: 'Product Engineer',
        experience: '4 years',
        specialization: 'System Design & Architecture',
        rating: 4.8,
        available: false,
        avatar: '👩‍🔬',
      },
      {
        id: 4,
        name: 'Arjun Singh',
        title: 'Backend Engineer',
        experience: '2 years',
        specialization: 'Database Design',
        rating: 4.6,
        available: true,
        avatar: '👨‍🎓',
      },
      {
        id: 5,
        name: 'Isha Verma',
        title: 'Frontend Engineer',
        experience: '3 years',
        specialization: 'React & Performance Optimization',
        rating: 4.7,
        available: true,
        avatar: '👩‍💼',
      },
    ];

    res.json({
      success: true,
      data: peers,
    });
  }

  /**
   * Get user's interview progress
   */
  private async getUserProgress(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const progressData = {
      userId,
      dailyStreak: Math.floor(Math.random() * 30) + 1,
      interviewsTaken: Math.floor(Math.random() * 100) + 5,
      averageScore: Math.floor(Math.random() * 40) + 60,
      topicsMastered: Math.floor(Math.random() * 15) + 3,
      companiesSolved: [
        'Google',
        'Amazon',
        'Microsoft',
        'Apple',
        'Meta',
      ].slice(0, Math.floor(Math.random() * 5) + 1),
      nextMockDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      recentScores: Array.from({ length: 10 }, () =>
        Math.floor(Math.random() * 40) + 60
      ),
      strengths: [
        'Problem Solving',
        'Code Quality',
        'Communication',
      ],
      improvements: [
        'Time Management',
        'Edge Cases',
        'Optimization',
      ],
    };

    res.json({
      success: true,
      data: progressData,
    });
  }

  /**
   * Create a new interview session
   */
  private async createSession(req: Request, res: Response): Promise<void> {
    const { userId, interviewType, companyId } = req.body;

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session = {
      id: sessionId,
      userId,
      interviewType,
      companyId,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      totalQuestions: Math.floor(Math.random() * 5) + 3,
      currentQuestion: 0,
      score: 0,
    };

    res.json({
      success: true,
      data: session,
    });
  }

  /**
   * Get questions for a specific session
   */
  private async getSessionQuestions(req: Request, res: Response): Promise<void> {
    // sessionId from req.params is not used since we return generic questions
    const { type } = req.query;

    const questions = [
      {
        id: 1,
        question: 'Design a parking lot system',
        category: type || 'system-design',
        difficulty: 'medium',
        timeLimit: 45,
        hints: ['Think about entities', 'Consider scalability'],
      },
      {
        id: 2,
        question: 'Implement a hashtable with collision handling',
        category: type || 'dsa',
        difficulty: 'medium',
        timeLimit: 30,
        hints: ['Linear probing', 'Chaining'],
      },
      {
        id: 3,
        question: 'Tell me about a challenging project',
        category: type || 'behavioral',
        difficulty: 'medium',
        timeLimit: 20,
        hints: ['Situation', 'Action', 'Result'],
      },
    ];

    res.json({
      success: true,
      data: questions,
    });
  }

  /**
   * Submit a response to a question
   */
  private async submitResponse(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    // answer is not used since we return mock feedback
    const { questionId, timeSpent } = req.body;

    const feedback = {
      responseId: `response-${Date.now()}`,
      sessionId,
      questionId,
      score: Math.floor(Math.random() * 40) + 60,
      feedback: 'Good approach! Consider optimizing the edge cases.',
      suggestedImprovements: [
        'Add error handling',
        'Consider time complexity',
      ],
      timeSpent,
      isCorrect: Math.random() > 0.3,
    };

    res.json({
      success: true,
      data: feedback,
    });
  }

  /**
   * Submit entire interview session
   */
  private async submitSession(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const finalFeedback = {
      sessionId,
      completedAt: new Date().toISOString(),
      totalScore: Math.floor(Math.random() * 40) + 60,
      rating: Math.floor(Math.random() * 2) + 4,
      summary: 'Great performance! You demonstrated strong problem-solving skills.',
      detailedFeedback: {
        technicalSkills: Math.floor(Math.random() * 40) + 60,
        communication: Math.floor(Math.random() * 40) + 60,
        codeQuality: Math.floor(Math.random() * 40) + 60,
      },
      nextSteps: [
        'Practice more on arrays and strings',
        'Improve system design knowledge',
      ],
      certificateUrl: 'https://example.com/certificate',
    };

    res.json({
      success: true,
      data: finalFeedback,
    });
  }
}

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * OA Practice Controller
 * Handles Online Assessment practice questions
 */
export class OaPracticeController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get(
      '/questions',
      asyncHandler((req, res) => this.getQuestions(req, res))
    );

    this.router.get(
      '/questions/:questionId',
      asyncHandler((req, res) => this.getQuestionDetail(req, res))
    );

    this.router.post(
      '/questions/:questionId/submit',
      asyncHandler((req, res) => this.submitAnswer(req, res))
    );

    this.router.get(
      '/user/:userId/results',
      asyncHandler((req, res) => this.getUserResults(req, res))
    );
  }

  private async getQuestions(_req: Request, res: Response): Promise<void> {
    const questions = [
      {
        id: 1,
        type: 'MCQ',
        difficulty: 'Easy',
        topic: 'Data Structures',
        title: 'What is the time complexity of Linear Search?',
        company: 'Google',
        attempts: 1245,
        accuracy: 87,
        solved: true,
      },
      {
        id: 2,
        type: 'Coding',
        difficulty: 'Medium',
        topic: 'Algorithms',
        title: 'Implement Merge Sort',
        company: 'Amazon',
        attempts: 892,
        accuracy: 62,
        solved: false,
      },
      {
        id: 3,
        type: 'MCQ',
        difficulty: 'Hard',
        topic: 'System Design',
        title: 'Design a URL Shortening Service',
        company: 'Microsoft',
        attempts: 456,
        accuracy: 51,
        solved: false,
      },
      {
        id: 4,
        type: 'Coding',
        difficulty: 'Medium',
        topic: 'Dynamic Programming',
        title: 'Longest Common Subsequence',
        company: 'Apple',
        attempts: 623,
        accuracy: 58,
        solved: true,
      },
    ];

    res.json({
      success: true,
      data: questions,
    });
  }

  private async getQuestionDetail(req: Request, res: Response): Promise<void> {
    const { questionId } = req.params;

    const question = {
      id: questionId,
      type: 'Coding',
      difficulty: 'Medium',
      topic: 'Algorithms',
      title: 'Implement Merge Sort',
      company: 'Amazon',
      description: 'Implement the merge sort algorithm and explain the approach',
      constraints: [
        'Array size: 1 to 10^5',
        'Element value: -10^9 to 10^9',
        'Time complexity: O(n log n)',
      ],
      examples: [
        {
          input: '[64, 34, 25, 12, 22, 11, 90]',
          output: '[11, 12, 22, 25, 34, 64, 90]',
        },
      ],
      hints: [
        'Divide the array into two halves',
        'Recursively sort both halves',
        'Merge the sorted halves',
      ],
      testCases: 15,
      timeLimit: '1 second',
      memoryLimit: '256 MB',
    };

    res.json({
      success: true,
      data: question,
    });
  }

  private async submitAnswer(req: Request, res: Response): Promise<void> {
    const { questionId } = req.params;
    const { answer: _answer, language } = req.body;

    const result = {
      submissionId: `oa-sub-${Date.now()}`,
      questionId,
      language,
      passed: Math.random() > 0.3,
      testsPassed: Math.floor(Math.random() * 15),
      totalTests: 15,
      runtime: `${Math.floor(Math.random() * 100) + 50}ms`,
      memory: `${Math.floor(Math.random() * 200) + 50}MB`,
      feedback: 'Solution looks good!',
    };

    res.json({
      success: true,
      data: result,
    });
  }

  private async getUserResults(req: Request, res: Response): Promise<void> {
    const { userId: _userId } = req.params;

    const results = [
      {
        id: 1,
        questionId: 1,
        title: 'What is the time complexity of Linear Search?',
        type: 'MCQ',
        solved: true,
        score: 100,
        attemptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        questionId: 4,
        title: 'Longest Common Subsequence',
        type: 'Coding',
        solved: true,
        score: 85,
        attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        questionId: 2,
        title: 'Implement Merge Sort',
        type: 'Coding',
        solved: false,
        score: 0,
        attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    res.json({
      success: true,
      data: results,
    });
  }
}

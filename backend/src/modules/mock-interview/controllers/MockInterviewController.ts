import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface MockInterview {
  id: string;
  studentName: string;
  studentRoll: string;
  interviewDate: string;
  interviewType: 'technical' | 'hr' | 'case-study' | 'behavioral';
  interviewer: string;
  duration: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendation: 'excellent' | 'good' | 'average' | 'needs-improvement';
  recordingAvailable: boolean;
}

/**
 * Mock Interviews Controller
 * Handles mock interview records and analytics
 */
export class MockInterviewController {
  public router: Router;
  private interviews: MockInterview[] = [
    {
      id: '1',
      studentName: 'Rahul Verma',
      studentRoll: 'CS21001',
      interviewDate: '2026-01-28',
      interviewType: 'technical',
      interviewer: 'Dr. Amit Kumar',
      duration: 45,
      overallScore: 88,
      technicalScore: 90,
      communicationScore: 85,
      problemSolvingScore: 92,
      confidenceScore: 85,
      feedback: 'Excellent problem-solving approach. Strong DSA knowledge. Communication clear.',
      strengths: ['Problem Solving', 'DSA Knowledge', 'Code Quality'],
      improvements: ['System Design', 'Time Complexity Analysis'],
      recommendation: 'excellent',
      recordingAvailable: true,
    },
    {
      id: '2',
      studentName: 'Ananya Singh',
      studentRoll: 'CS21002',
      interviewDate: '2026-01-30',
      interviewType: 'hr',
      interviewer: 'Ms. Priya Sharma',
      duration: 30,
      overallScore: 95,
      technicalScore: 0,
      communicationScore: 98,
      problemSolvingScore: 92,
      confidenceScore: 95,
      feedback: 'Outstanding communication. Very confident. Handled behavioral questions excellently.',
      strengths: ['Communication', 'Confidence', 'Professionalism', 'Body Language'],
      improvements: [],
      recommendation: 'excellent',
      recordingAvailable: true,
    },
    {
      id: '3',
      studentName: 'Vikram Mehta',
      studentRoll: 'EC21015',
      interviewDate: '2026-01-25',
      interviewType: 'technical',
      interviewer: 'Prof. Rajesh Patel',
      duration: 40,
      overallScore: 65,
      technicalScore: 68,
      communicationScore: 60,
      problemSolvingScore: 65,
      confidenceScore: 68,
      feedback: 'Good basics but struggled with advanced concepts. Needs more practice.',
      strengths: ['Basic Programming', 'Enthusiasm'],
      improvements: ['Advanced Algorithms', 'Communication', 'Code Optimization'],
      recommendation: 'average',
      recordingAvailable: false,
    },
    {
      id: '4',
      studentName: 'Kavya Reddy',
      studentRoll: 'IT21023',
      interviewDate: '2026-02-01',
      interviewType: 'behavioral',
      interviewer: 'Ms. Neha Verma',
      duration: 35,
      overallScore: 82,
      technicalScore: 0,
      communicationScore: 88,
      problemSolvingScore: 80,
      confidenceScore: 85,
      feedback: 'Strong leadership presence. Demonstrated good problem-solving with examples.',
      strengths: ['Leadership', 'Communication', 'Confidence'],
      improvements: ['Elaborating on failures'],
      recommendation: 'good',
      recordingAvailable: true,
    },
    {
      id: '5',
      studentName: 'Arjun Kumar',
      studentRoll: 'ME21045',
      interviewDate: '2026-01-22',
      interviewType: 'technical',
      interviewer: 'Dr. Suresh Kumar',
      duration: 40,
      overallScore: 55,
      technicalScore: 50,
      communicationScore: 52,
      problemSolvingScore: 58,
      confidenceScore: 50,
      feedback: 'Basics are weak. Needs significant improvement in technical concepts and communication.',
      strengths: ['Enthusiasm'],
      improvements: ['Core Concepts', 'Communication', 'Problem Solving', 'Technical Depth'],
      recommendation: 'needs-improvement',
      recordingAvailable: false,
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    // More specific routes first
    this.router.get('/questions', asyncHandler((req, res) => this.getQuestions(req, res)));
    this.router.get('/plans', asyncHandler((req, res) => this.getPlans(req, res)));
    this.router.get('/peers', asyncHandler((req, res) => this.getPeers(req, res)));
    this.router.get('/companies', asyncHandler((req, res) => this.getCompanies(req, res)));
    this.router.get('/analytics/summary', asyncHandler((req, res) => this.getAnalyticsSummary(req, res)));
    this.router.get('/user/:userId/progress', asyncHandler((req, res) => this.getUserProgress(req, res)));
    this.router.get('/student/:studentRoll', asyncHandler((req, res) => this.getByStudentRoll(req, res)));
    
    // Generic routes last
    this.router.get('/', asyncHandler((req, res) => this.listInterviews(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.createInterview(req, res)));
    this.router.get('/:id', asyncHandler((req, res) => this.getInterviewById(req, res)));
    this.router.put('/:id', asyncHandler((req, res) => this.updateInterview(req, res)));
    this.router.delete('/:id', asyncHandler((req, res) => this.deleteInterview(req, res)));
  }

  private async listInterviews(req: Request, res: Response): Promise<void> {
    const { type, recommendation, student } = req.query;
    let filtered = this.interviews;

    if (type) {
      filtered = filtered.filter(i => i.interviewType === type);
    }
    if (recommendation) {
      filtered = filtered.filter(i => i.recommendation === recommendation);
    }
    if (student) {
      filtered = filtered.filter(i =>
        i.studentName.toLowerCase().includes((student as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  }

  private async createInterview(req: Request, res: Response): Promise<void> {
    const newInterview: MockInterview = {
      id: `${Date.now()}`,
      ...req.body,
    };
    this.interviews.push(newInterview);
    res.status(201).json({ success: true, data: newInterview });
  }

  private async getInterviewById(req: Request, res: Response): Promise<void> {
    const interview = this.interviews.find(i => i.id === req.params.id);
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    res.json({ success: true, data: interview });
  }

  private async updateInterview(req: Request, res: Response): Promise<void> {
    const interview = this.interviews.find(i => i.id === req.params.id);
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    Object.assign(interview, req.body);
    res.json({ success: true, data: interview });
  }

  private async deleteInterview(req: Request, res: Response): Promise<void> {
    const index = this.interviews.findIndex(i => i.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }
    const deleted = this.interviews.splice(index, 1)[0];
    res.json({ success: true, data: deleted });
  }

  private async getByStudentRoll(req: Request, res: Response): Promise<void> {
    const { studentRoll } = req.params;
    const filtered = this.interviews.filter(i => i.studentRoll === studentRoll);
    res.json({ success: true, data: filtered, total: filtered.length });
  }

  private async getAnalyticsSummary(_req: Request, res: Response): Promise<void> {
    const excellent = this.interviews.filter(i => i.recommendation === 'excellent').length;
    const good = this.interviews.filter(i => i.recommendation === 'good').length;
    const average = this.interviews.filter(i => i.recommendation === 'average').length;
    const needsImprovement = this.interviews.filter(i => i.recommendation === 'needs-improvement').length;

    res.json({
      success: true,
      data: {
        totalInterviews: this.interviews.length,
        excellentCount: excellent,
        goodCount: good,
        averageCount: average,
        needsImprovementCount: needsImprovement,
        averageScore: (this.interviews.reduce((sum, i) => sum + i.overallScore, 0) / this.interviews.length).toFixed(2),
        avgTechnicalScore: (this.interviews.reduce((sum, i) => sum + i.technicalScore, 0) / this.interviews.length).toFixed(2),
        avgCommunicationScore: (this.interviews.reduce((sum, i) => sum + i.communicationScore, 0) / this.interviews.length).toFixed(2),
        typeBreakdown: {
          technical: this.interviews.filter(i => i.interviewType === 'technical').length,
          hr: this.interviews.filter(i => i.interviewType === 'hr').length,
          caseStudy: this.interviews.filter(i => i.interviewType === 'case-study').length,
          behavioral: this.interviews.filter(i => i.interviewType === 'behavioral').length,
        },
      },
    });
  }

  private async getQuestions(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [
        { id: '1', title: 'Two Sum', difficulty: 'Easy', category: 'Array' },
        { id: '2', title: 'Longest Substring', difficulty: 'Medium', category: 'String' },
        { id: '3', title: 'Merge K Sorted Lists', difficulty: 'Hard', category: 'Linked List' },
      ],
    });
  }

  private async getPlans(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [
        { id: '1', name: 'Week 1-2: DSA Fundamentals', status: 'active' },
        { id: '2', name: 'Week 3-4: Advanced Algorithms', status: 'pending' },
        { id: '3', name: 'Week 5-6: System Design Basics', status: 'pending' },
      ],
    });
  }

  private async getPeers(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [
        { id: '1', name: 'Peer 1', role: 'Coding Buddy', status: 'active' },
        { id: '2', name: 'Peer 2', role: 'Mock Interviewer', status: 'active' },
      ],
    });
  }

  private async getCompanies(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: [
        { id: '1', name: 'Tech Company A', status: 'recruiting' },
        { id: '2', name: 'Tech Company B', status: 'recruiting' },
      ],
    });
  }

  private async getUserProgress(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    res.json({
      success: true,
      data: {
        userId,
        mockInterviewsCompleted: 5,
        averageScore: 82,
        lastInterview: '2026-04-10',
        progress: 60,
      },
    });
  }
}

export default MockInterviewController;

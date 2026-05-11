import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface StudentReadiness {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  resumeScore: number;
  technicalSkills: number;
  aptitudeScore: number;
  communicationScore: number;
  mockInterviewsAttended: number;
  averageMockScore: number;
  placementReadiness: 'high' | 'medium' | 'low';
  areasOfImprovement: string[];
  lastAssessment: string;
  companiesApplied: number;
  interviewsScheduled: number;
}

/**
 * Student Readiness Monitoring Controller
 */
export class StudentReadinessController {
  public router: Router;
  private students: StudentReadiness[] = [
    {
      id: '1',
      name: 'Rahul Verma',
      rollNumber: 'CS21001',
      branch: 'Computer Science',
      cgpa: 8.5,
      backlogs: 0,
      resumeScore: 85,
      technicalSkills: 90,
      aptitudeScore: 88,
      communicationScore: 82,
      mockInterviewsAttended: 5,
      averageMockScore: 86,
      placementReadiness: 'high',
      areasOfImprovement: ['System Design'],
      lastAssessment: '2026-01-28',
      companiesApplied: 12,
      interviewsScheduled: 3,
    },
    {
      id: '2',
      name: 'Ananya Singh',
      rollNumber: 'CS21002',
      branch: 'Computer Science',
      cgpa: 9.2,
      backlogs: 0,
      resumeScore: 92,
      technicalSkills: 95,
      aptitudeScore: 94,
      communicationScore: 90,
      mockInterviewsAttended: 7,
      averageMockScore: 93,
      placementReadiness: 'high',
      areasOfImprovement: [],
      lastAssessment: '2026-01-30',
      companiesApplied: 15,
      interviewsScheduled: 5,
    },
    {
      id: '3',
      name: 'Vikram Mehta',
      rollNumber: 'EC21015',
      branch: 'Electronics',
      cgpa: 7.2,
      backlogs: 1,
      resumeScore: 65,
      technicalSkills: 70,
      aptitudeScore: 68,
      communicationScore: 60,
      mockInterviewsAttended: 2,
      averageMockScore: 64,
      placementReadiness: 'medium',
      areasOfImprovement: ['Resume Quality', 'Communication', 'Technical Depth'],
      lastAssessment: '2026-01-25',
      companiesApplied: 5,
      interviewsScheduled: 1,
    },
    {
      id: '4',
      name: 'Kavya Reddy',
      rollNumber: 'IT21023',
      branch: 'IT',
      cgpa: 8.8,
      backlogs: 0,
      resumeScore: 88,
      technicalSkills: 92,
      aptitudeScore: 90,
      communicationScore: 88,
      mockInterviewsAttended: 6,
      averageMockScore: 89,
      placementReadiness: 'high',
      areasOfImprovement: ['Leadership Skills'],
      lastAssessment: '2026-01-29',
      companiesApplied: 14,
      interviewsScheduled: 4,
    },
    {
      id: '5',
      name: 'Arjun Kumar',
      rollNumber: 'ME21045',
      branch: 'Mechanical',
      cgpa: 6.8,
      backlogs: 2,
      resumeScore: 55,
      technicalSkills: 60,
      aptitudeScore: 58,
      communicationScore: 50,
      mockInterviewsAttended: 1,
      averageMockScore: 52,
      placementReadiness: 'low',
      areasOfImprovement: ['Resume Building', 'Technical Skills', 'Soft Skills', 'Backlogs Clearing'],
      lastAssessment: '2026-01-20',
      companiesApplied: 2,
      interviewsScheduled: 0,
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.listStudents(req, res)));
    this.router.get('/:id', asyncHandler((req, res) => this.getStudentById(req, res)));
    this.router.put('/:id', asyncHandler((req, res) => this.updateStudent(req, res)));
    this.router.delete('/:id', asyncHandler((req, res) => this.deleteStudent(req, res)));
    this.router.get('/readiness/:level', asyncHandler((req, res) => this.getByReadinessLevel(req, res)));
    this.router.get('/analytics/summary', asyncHandler((req, res) => this.getAnalyticsSummary(req, res)));
  }

  private async listStudents(req: Request, res: Response): Promise<void> {
    const { readiness, branch } = req.query;
    let filtered = this.students;

    if (readiness) {
      filtered = filtered.filter(s => s.placementReadiness === readiness);
    }
    if (branch) {
      filtered = filtered.filter(s => s.branch === branch);
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  }

  private async getStudentById(req: Request, res: Response): Promise<void> {
    const student = this.students.find(s => s.id === req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    res.json({ success: true, data: student });
  }

  private async updateStudent(req: Request, res: Response): Promise<void> {
    const student = this.students.find(s => s.id === req.params.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    Object.assign(student, req.body);
    res.json({ success: true, data: student });
  }

  private async deleteStudent(req: Request, res: Response): Promise<void> {
    const index = this.students.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    const deleted = this.students.splice(index, 1)[0];
    res.json({ success: true, data: deleted });
  }

  private async getByReadinessLevel(req: Request, res: Response): Promise<void> {
    const { level } = req.params;
    const filtered = this.students.filter(s => s.placementReadiness === level);
    res.json({ success: true, data: filtered, total: filtered.length });
  }

  private async getAnalyticsSummary(_req: Request, res: Response): Promise<void> {
    const high = this.students.filter(s => s.placementReadiness === 'high').length;
    const medium = this.students.filter(s => s.placementReadiness === 'medium').length;
    const low = this.students.filter(s => s.placementReadiness === 'low').length;

    res.json({
      success: true,
      data: {
        totalStudents: this.students.length,
        highReadiness: high,
        mediumReadiness: medium,
        lowReadiness: low,
        averageCGPA: (this.students.reduce((sum, s) => sum + s.cgpa, 0) / this.students.length).toFixed(2),
        averageResumeScore: (this.students.reduce((sum, s) => sum + s.resumeScore, 0) / this.students.length).toFixed(2),
        totalMockInterviews: this.students.reduce((sum, s) => sum + s.mockInterviewsAttended, 0),
        averageMockScore: (this.students.reduce((sum, s) => sum + s.averageMockScore, 0) / this.students.length).toFixed(2),
      },
    });
  }
}

export default StudentReadinessController;

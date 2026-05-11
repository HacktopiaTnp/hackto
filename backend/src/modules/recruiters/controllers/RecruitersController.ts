import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Recruiters Controller
 * Handles recruiter listings and management
 */
export class RecruitersController {
  public router: Router;
  private static recruiters: any[] = [
    {
      id: 1,
      companyId: 1,
      name: 'Sundar Pichai',
      email: 'sundar@google.com',
      phone: '+1-650-253-0000',
      position: 'CEO',
      department: 'Executive',
      company: 'Google',
      hiringFor: ['Senior Software Engineer', 'Product Manager', 'Data Scientist'],
      yearsOfExperience: 20,
      linkedIn: 'linkedin.com/in/sundar-pichai',
    },
    {
      id: 2,
      companyId: 1,
      name: 'Ruth Porat',
      email: 'ruth@google.com',
      phone: '+1-650-253-0001',
      position: 'CFO',
      department: 'Finance',
      company: 'Google',
      hiringFor: ['Finance Analyst', 'Accountant'],
      yearsOfExperience: 18,
      linkedIn: 'linkedin.com/in/ruth-porat',
    },
    {
      id: 3,
      companyId: 2,
      name: 'Andy Jassy',
      email: 'andy@amazon.com',
      phone: '+1-206-266-1000',
      position: 'CEO',
      department: 'Executive',
      company: 'Amazon',
      hiringFor: ['Backend Engineer', 'Cloud Architect', 'DevOps Engineer'],
      yearsOfExperience: 25,
      linkedIn: 'linkedin.com/in/andy-jassy',
    },
    {
      id: 4,
      companyId: 3,
      name: 'Satya Nadella',
      email: 'satya@microsoft.com',
      phone: '+1-425-882-8080',
      position: 'CEO',
      department: 'Executive',
      company: 'Microsoft',
      hiringFor: ['Software Engineer', 'AI/ML Engineer', 'Cloud Solutions Architect'],
      yearsOfExperience: 22,
      linkedIn: 'linkedin.com/in/satya-nadella',
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  /**
   * Register routes
   */
  private registerRoutes(): void {
    // GET /api/v1/recruiters - List all recruiters (with optional companyId filter)
    this.router.get(
      '/',
      asyncHandler((req, res) => this.listRecruiters(req, res))
    );

    // POST /api/v1/recruiters - Create new recruiter
    this.router.post(
      '/',
      asyncHandler((req, res) => this.createRecruiter(req, res))
    );

    // GET /api/v1/recruiters/:recruiterId - Get recruiter detail
    this.router.get(
      '/:recruiterId',
      asyncHandler((req, res) => this.getRecruiterDetail(req, res))
    );

    // PUT /api/v1/recruiters/:recruiterId - Update recruiter
    this.router.put(
      '/:recruiterId',
      asyncHandler((req, res) => this.updateRecruiter(req, res))
    );

    // DELETE /api/v1/recruiters/:recruiterId - Delete recruiter
    this.router.delete(
      '/:recruiterId',
      asyncHandler((req, res) => this.deleteRecruiter(req, res))
    );
  }

  /**
   * List all recruiters (with optional companyId filter)
   */
  private async listRecruiters(req: Request, res: Response): Promise<void> {
    const { companyId } = req.query;

    let recruiters = RecruitersController.recruiters;

    if (companyId) {
      recruiters = recruiters.filter(r => r.companyId === parseInt(companyId as string));
    }

    res.json({
      success: true,
      recruiters: recruiters,
      total: recruiters.length,
      data: recruiters,
    });
  }

  /**
   * Get recruiter detail
   */
  private async getRecruiterDetail(req: Request, res: Response): Promise<void> {
    const { recruiterId } = req.params;

    const recruiter = RecruitersController.recruiters.find(r => r.id === parseInt(recruiterId));

    if (!recruiter) {
      res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
      return;
    }

    res.json({
      success: true,
      data: recruiter,
    });
  }

  /**
   * Create new recruiter
   */
  private async createRecruiter(req: Request, res: Response): Promise<void> {
    const { name, email, phone, position, companyId, department, company, hiringFor, yearsOfExperience, linkedIn } = req.body;

    // Validation
    if (!name || !email || !companyId || !company) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, companyId, company',
      });
      return;
    }

    const newRecruiter = {
      id: Math.max(...RecruitersController.recruiters.map(r => r.id), 0) + 1,
      companyId: parseInt(companyId),
      name,
      email,
      phone: phone || '',
      position: position || 'Recruiter',
      department: department || 'HR',
      company,
      hiringFor: Array.isArray(hiringFor) ? hiringFor : [],
      yearsOfExperience: yearsOfExperience || 0,
      linkedIn: linkedIn || '',
    };

    RecruitersController.recruiters.push(newRecruiter);

    res.status(201).json({
      success: true,
      data: newRecruiter,
      message: 'Recruiter created successfully',
    });
  }

  /**
   * Update recruiter
   */
  private async updateRecruiter(req: Request, res: Response): Promise<void> {
    const { recruiterId } = req.params;
    const updates = req.body;

    const recruiter = RecruitersController.recruiters.find(r => r.id === parseInt(recruiterId));

    if (!recruiter) {
      res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
      return;
    }

    Object.assign(recruiter, updates);

    res.json({
      success: true,
      data: recruiter,
      message: 'Recruiter updated successfully',
    });
  }

  /**
   * Delete recruiter
   */
  private async deleteRecruiter(req: Request, res: Response): Promise<void> {
    const { recruiterId } = req.params;
    const index = RecruitersController.recruiters.findIndex(r => r.id === parseInt(recruiterId));

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Recruiter not found',
      });
      return;
    }

    const deletedRecruiter = RecruitersController.recruiters.splice(index, 1);

    res.json({
      success: true,
      data: deletedRecruiter[0],
      message: 'Recruiter deleted successfully',
    });
  }
}

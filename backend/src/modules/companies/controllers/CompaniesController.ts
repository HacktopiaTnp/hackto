import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';
import { JobsController } from '../../jobs/controllers/JobsController';

/**
 * Companies Controller
 * Handles company listings and company details
 */
export class CompaniesController {
  public router: Router;
  private static createdJobs: any[] = [];
  private static companies: any[] = [
    {
      id: 1,
      name: 'Google',
      logo: '🔍',
      location: 'Mountain View, CA',
      industry: 'Technology',
      size: '190K+ employees',
      founded: 1998,
      rating: 4.5,
      reviews: 2847,
      openPositions: 234,
      salary: '$150K - $300K',
      interviewDifficulty: 'Hard',
      description: 'Search engine and tech giant',
      website: 'google.com',
      contactPerson: 'Sundar Pichai',
      email: 'careers@google.com',
      phone: '+1-650-253-0000',
    },
    {
      id: 2,
      name: 'Amazon',
      logo: '📦',
      location: 'Seattle, WA',
      industry: 'Technology & Retail',
      size: '1.6M+ employees',
      founded: 1994,
      rating: 4.1,
      reviews: 3201,
      openPositions: 512,
      salary: '$140K - $280K',
      interviewDifficulty: 'Hard',
      description: 'E-commerce and cloud computing leader',
      website: 'amazon.com',
      contactPerson: 'Andy Jassy',
      email: 'careers@amazon.com',
      phone: '+1-206-266-1000',
    },
    {
      id: 3,
      name: 'Microsoft',
      logo: '🪟',
      location: 'Redmond, WA',
      industry: 'Technology',
      size: '221K+ employees',
      founded: 1975,
      rating: 4.4,
      reviews: 2654,
      openPositions: 189,
      salary: '$140K - $270K',
      interviewDifficulty: 'Medium',
      description: 'Software and cloud services provider',
      website: 'microsoft.com',
      contactPerson: 'Satya Nadella',
      email: 'careers@microsoft.com',
      phone: '+1-425-882-8080',
    },
    {
      id: 4,
      name: 'Meta',
      logo: '👤',
      location: 'Menlo Park, CA',
      industry: 'Technology & Social Media',
      size: '67K+ employees',
      founded: 2004,
      rating: 3.9,
      reviews: 1823,
      openPositions: 156,
      salary: '$160K - $320K',
      interviewDifficulty: 'Hard',
      description: 'Social media and metaverse platform',
      website: 'meta.com',
      contactPerson: 'Mark Zuckerberg',
      email: 'careers@meta.com',
      phone: '+1-650-308-7300',
    },
    {
      id: 5,
      name: 'Apple',
      logo: '🍎',
      location: 'Cupertino, CA',
      industry: 'Technology & Hardware',
      size: '164K+ employees',
      founded: 1976,
      rating: 4.3,
      reviews: 2215,
      openPositions: 98,
      salary: '$130K - $280K',
      interviewDifficulty: 'Medium',
      description: 'Hardware and software innovator',
      website: 'apple.com',
      contactPerson: 'Tim Cook',
      email: 'careers@apple.com',
      phone: '+1-408-996-1010',
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
    // GET /api/v1/companies (default list)
    this.router.get(
      '/',
      asyncHandler((req, res) => this.getCompaniesList(req, res))
    );

    // GET /api/v1/companies/list
    this.router.get(
      '/list',
      asyncHandler((req, res) => this.getCompaniesList(req, res))
    );

    // POST /api/v1/companies (Create new company)
    this.router.post(
      '/',
      asyncHandler((req, res) => this.createCompany(req, res))
    );

    // GET /api/v1/companies/:companyId
    this.router.get(
      '/:companyId',
      asyncHandler((req, res) => this.getCompanyDetail(req, res))
    );

    // PUT /api/v1/companies/:companyId (Update company)
    this.router.put(
      '/:companyId',
      asyncHandler((req, res) => this.updateCompany(req, res))
    );

    // DELETE /api/v1/companies/:companyId (Delete company)
    this.router.delete(
      '/:companyId',
      asyncHandler((req, res) => this.deleteCompany(req, res))
    );

    // GET /api/v1/companies/:companyId/jobs
    this.router.get(
      '/:companyId/jobs',
      asyncHandler((req, res) => this.getCompanyJobs(req, res))
    );

    // POST /api/v1/companies/:companyId/jobs (Add new job)
    this.router.post(
      '/:companyId/jobs',
      asyncHandler((req, res) => this.addCompanyJob(req, res))
    );

    // POST /api/v1/companies/:companyId/follow
    this.router.post(
      '/:companyId/follow',
      asyncHandler((req, res) => this.followCompany(req, res))
    );
  }

  /**
   * Get companies list
   */
  private async getCompaniesList(_req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      companies: CompaniesController.companies,
      total: CompaniesController.companies.length,
      data: CompaniesController.companies,
    });
  }

  /**
   * Create new company
   */
  private async createCompany(req: Request, res: Response): Promise<void> {
    const { name, location, industry, website, contactPerson, email, phone, description, logo } = req.body;

    // Validation
    if (!name || !location || !industry) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, location, industry',
      });
      return;
    }

    const newCompany = {
      id: Math.max(...CompaniesController.companies.map(c => c.id), 0) + 1,
      name,
      logo: logo || '🏢',
      location,
      industry,
      size: '0+ employees',
      founded: new Date().getFullYear(),
      rating: 5.0,
      reviews: 0,
      openPositions: 0,
      salary: 'TBD',
      interviewDifficulty: 'Not Rated',
      description: description || '',
      website: website || '',
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
    };

    CompaniesController.companies.push(newCompany);

    res.status(201).json({
      success: true,
      data: newCompany,
      message: 'Company created successfully',
    });
  }

  /**
   * Update company
   */
  private async updateCompany(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;
    const updates = req.body;

    const company = CompaniesController.companies.find(c => c.id === parseInt(companyId));

    if (!company) {
      res.status(404).json({
        success: false,
        error: 'Company not found',
      });
      return;
    }

    // Update company fields
    Object.assign(company, updates);

    res.json({
      success: true,
      data: company,
      message: 'Company updated successfully',
    });
  }

  /**
   * Delete company
   */
  private async deleteCompany(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;
    const index = CompaniesController.companies.findIndex(c => c.id === parseInt(companyId));

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Company not found',
      });
      return;
    }

    const deletedCompany = CompaniesController.companies.splice(index, 1);

    res.json({
      success: true,
      data: deletedCompany[0],
      message: 'Company deleted successfully',
    });
  }

  /**
   * Get company detail
   */
  private async getCompanyDetail(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;

    const companyDetail = {
      id: companyId,
      name: 'Google',
      logo: '🔍',
      location: 'Mountain View, CA',
      headquarters: 'Googleplex, 1600 Amphitheatre Parkway, Mountain View, CA 94043',
      industry: 'Technology',
      size: '190K+ employees',
      founded: 1998,
      publiclyTraded: true,
      stock: 'GOOGL',
      marketCap: '$1.8T',
      revenue: '$283.8B',
      rating: 4.5,
      reviews: 2847,
      description:
        'Google is an American multinational technology company that specializes in Internet-related services and products.',
      website: 'google.com',
      careers: 'google.com/careers',
      
      culture: {
        values: ['Innovation', 'User Focus', 'Integrity', 'Collaboration'],
        benefits: [
          'Unlimited vacation',
          'Health insurance',
          'Stock options',
          'Free food & beverages',
          '$12K professional development budget',
          'Free gym membership',
        ],
        workplaceType: 'Hybrid',
      },

      interviewProcess: {
        rounds: 5,
        duration: '6-8 weeks',
        stages: [
          'Phone Screen',
          'Coding Interview',
          'System Design',
          'Behavioral',
          'Team Match',
        ],
      },

      companyCulture: {
        description: 'Innovation-driven culture focused on solving world problems',
        diversity: 'Strong focus on diversity and inclusion',
        teamWork: 'Collaborative environment with flat hierarchy',
      },

      openPositions: 234,
      recentHires: 1248,
      employees: [
        { name: 'Sundar Pichai', title: 'CEO', department: 'Executive' },
        { name: 'Ruth Porat', title: 'CFO', department: 'Finance' },
      ],
    };

    res.json({
      success: true,
      data: companyDetail,
    });
  }

  /**
   * Get company jobs
   */
  private async getCompanyJobs(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;

    const jobs = [
      {
        id: 1,
        title: 'Senior Software Engineer',
        location: 'Mountain View, CA',
        type: 'Full-time',
        level: 'Senior',
        salary: '$180K - $220K',
        posted: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Senior Product Manager',
        location: 'Mountain View, CA',
        type: 'Full-time',
        level: 'Senior',
        salary: '$200K - $250K',
        posted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        title: 'UX Designer',
        location: 'Mountain View, CA',
        type: 'Full-time',
        level: 'Mid',
        salary: '$130K - $170K',
        posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add any newly created jobs for this company
    if (CompaniesController.createdJobs && CompaniesController.createdJobs.length > 0) {
      const createdJobsForCompany = CompaniesController.createdJobs.filter(
        (job: any) => job.companyId === companyId
      );
      jobs.push(...createdJobsForCompany);
    }

    res.json({
      success: true,
      data: jobs,
    });
  }

  /**
   * Add new job to company
   */
  private async addCompanyJob(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;
    const { roleTitle, type, ctc, location, description } = req.body;

    // Validation
    if (!roleTitle || !type || !ctc || !location) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: roleTitle, type, ctc, location',
      });
      return;
    }

    const newJob = {
      id: `job_${Date.now()}`,
      companyId,
      title: roleTitle,
      roleTitle,
      type,
      ctc,
      location,
      description: description || '',
      level: 'Entry',
      salary: ctc,
      company: companyId,
      posted: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    // Store in in-memory storage (in production, this would be the database)
    if (!CompaniesController.createdJobs) {
      CompaniesController.createdJobs = [];
    }
    CompaniesController.createdJobs.push(newJob);

    // Also add to global jobs list in JobsController
    JobsController.addCreatedJob(newJob);

    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job created successfully',
    });
  }

  /**
   * Follow company
   */
  private async followCompany(req: Request, res: Response): Promise<void> {
    const { companyId } = req.params;
    const { userId } = req.body;

    const follow = {
      id: `follow-${Date.now()}`,
      companyId,
      userId,
      followedAt: new Date().toISOString(),
      notifications: true,
    };

    res.json({
      success: true,
      data: follow,
    });
  }
}

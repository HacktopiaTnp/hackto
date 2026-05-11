import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface BlockedOffer {
  companyName: string;
  position: string;
  salary: number;
  ctc: number;
  offeredDate: string;
  blockReason: string;
}

interface EnforcedPolicy {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  branch: string;
  batch: string;
  currentOffer: {
    companyName: string;
    position: string;
    salary: number;
    ctc: number;
    acceptedDate: string;
    joiningDate: string;
  };
  blockedOffers: BlockedOffer[];
  status: 'active' | 'completed' | 'appeal-pending' | 'exception-approved';
  appealDetails?: {
    reason: string;
    submittedDate: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  impact?: {
    studentBenefit: string;
    reasonForException?: string;
  };
}

/**
 * One-Offer Policy Controller
 * Enforces single offer per student policy
 */
export class OneOfferPolicyController {
  public router: Router;
  private policies: EnforcedPolicy[] = [
    {
      id: '1',
      studentId: 'STU00145',
      studentName: 'Rahul Kumar',
      email: 'rahul.kumar@college.edu',
      branch: 'CSE',
      batch: '2026',
      currentOffer: {
        companyName: 'Google',
        position: 'Senior Software Engineer',
        salary: 1000000,
        ctc: 1200000,
        acceptedDate: '2026-02-15',
        joiningDate: '2026-07-01',
      },
      blockedOffers: [
        {
          companyName: 'Microsoft',
          position: 'Senior Software Engineer',
          salary: 1050000,
          ctc: 1250000,
          offeredDate: '2026-02-18',
          blockReason: 'Student already accepted offer from Google on 2026-02-15. One-Offer Policy enforced.',
        },
        {
          companyName: 'Amazon',
          position: 'SDE-2',
          salary: 980000,
          ctc: 1180000,
          offeredDate: '2026-02-20',
          blockReason: 'Offer blocked as per One-Offer Policy. Student already committed to Google.',
        },
      ],
      status: 'active',
    },
    {
      id: '2',
      studentId: 'STU00287',
      studentName: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      branch: 'IT',
      batch: '2026',
      currentOffer: {
        companyName: 'Microsoft',
        position: 'Software Engineer',
        salary: 900000,
        ctc: 1080000,
        acceptedDate: '2026-03-01',
        joiningDate: '2026-07-15',
      },
      blockedOffers: [
        {
          companyName: 'Adobe',
          position: 'Software Engineer',
          salary: 920000,
          ctc: 1100000,
          offeredDate: '2026-03-05',
          blockReason: 'Blocked under One-Offer Policy. Student accepted Microsoft offer.',
        },
      ],
      status: 'active',
    },
    {
      id: '3',
      studentId: 'STU00156',
      studentName: 'Amit Patel',
      email: 'amit.patel@college.edu',
      branch: 'ECE',
      batch: '2026',
      currentOffer: {
        companyName: 'TCS',
        position: 'Systems Engineer',
        salary: 600000,
        ctc: 720000,
        acceptedDate: '2026-01-20',
        joiningDate: '2026-06-01',
      },
      blockedOffers: [
        {
          companyName: 'Infosys',
          position: 'Systems Engineer',
          salary: 610000,
          ctc: 732000,
          offeredDate: '2026-01-25',
          blockReason: 'One-Offer Policy prevents acceptance. Student committed to TCS.',
        },
      ],
      status: 'completed',
    },
    {
      id: '4',
      studentId: 'STU00203',
      studentName: 'Deepak Verma',
      email: 'deepak.verma@college.edu',
      branch: 'CSE',
      batch: '2026',
      currentOffer: {
        companyName: 'Goldman Sachs',
        position: 'Analyst',
        salary: 1400000,
        ctc: 1680000,
        acceptedDate: '2026-02-10',
        joiningDate: '2026-08-01',
      },
      blockedOffers: [
        {
          companyName: 'Morgan Stanley',
          position: 'Senior Analyst',
          salary: 1500000,
          ctc: 1800000,
          offeredDate: '2026-02-12',
          blockReason: 'Blocked by One-Offer Policy. Student has Goldman Sachs offer.',
        },
      ],
      status: 'appeal-pending',
      appealDetails: {
        reason: 'Requesting exception for significantly higher package (25% increase) and better career growth at Morgan Stanley.',
        submittedDate: '2026-02-13',
        status: 'pending',
      },
    },
    {
      id: '5',
      studentId: 'STU00312',
      studentName: 'Sneha Gupta',
      email: 'sneha.gupta@college.edu',
      branch: 'CSE',
      batch: '2026',
      currentOffer: {
        companyName: 'Google',
        position: 'Software Engineer',
        salary: 950000,
        ctc: 1140000,
        acceptedDate: '2026-02-20',
        joiningDate: '2026-07-01',
      },
      blockedOffers: [
        {
          companyName: 'Meta',
          position: 'Software Engineer',
          salary: 1200000,
          ctc: 1440000,
          offeredDate: '2026-02-22',
          blockReason: 'Meta offer rejected under One-Offer Policy. Student accepted Google offer.',
        },
      ],
      status: 'exception-approved',
      impact: {
        studentBenefit: 'Exception approved for Meta offer (26.3% higher CTC than Google offer). Student provided with opportunity to accept better career option with mutual consent from Google.',
        reasonForException: '50%+ package increase with clear career advancement opportunity.',
      },
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.getAllPolicies(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.createPolicy(req, res)));
    this.router.get('/:policyId', asyncHandler((req, res) => this.getPolicyById(req, res)));
    this.router.put('/:policyId', asyncHandler((req, res) => this.updatePolicy(req, res)));
    this.router.delete('/:policyId', asyncHandler((req, res) => this.deletePolicy(req, res)));
    this.router.get('/status/:status', asyncHandler((req, res) => this.getByStatus(req, res)));
    this.router.post('/:policyId/appeal', asyncHandler((req, res) => this.submitAppeal(req, res)));
    this.router.patch('/:policyId/appeal/:appealStatus', asyncHandler((req, res) => this.resolveAppeal(req, res)));
    this.router.get('/analytics/summary', asyncHandler((req, res) => this.getAnalytics(req, res)));
  }

  private async getAllPolicies(req: Request, res: Response): Promise<void> {
    const { status, search } = req.query;

    let filtered = [...this.policies];

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    if (search) {
      const searchStr = (search as string).toLowerCase();
      filtered = filtered.filter(
        p =>
          p.studentName.toLowerCase().includes(searchStr) ||
          p.currentOffer.companyName.toLowerCase().includes(searchStr) ||
          p.studentId.toLowerCase().includes(searchStr)
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      policies: filtered,
    });
  }

  private async createPolicy(req: Request, res: Response): Promise<void> {
    const {
      studentId,
      studentName,
      email,
      branch,
      batch,
      companyName,
      position,
      salary,
      ctc,
    } = req.body;

    if (!studentName || !companyName || !position) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
      return;
    }

    const newPolicy: EnforcedPolicy = {
      id: Date.now().toString(),
      studentId: studentId || 'STU' + Math.floor(Math.random() * 10000),
      studentName,
      email: email || 'student@college.edu',
      branch: branch || 'CS',
      batch: batch || '2026',
      currentOffer: {
        companyName,
        position,
        salary: salary || 0,
        ctc: ctc || 0,
        acceptedDate: new Date().toISOString().split('T')[0],
        joiningDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      blockedOffers: [],
      status: 'active',
    };

    this.policies.push(newPolicy);

    res.status(201).json({
      success: true,
      data: newPolicy,
      message: 'One-Offer Policy created successfully',
    });
  }

  private async getPolicyById(req: Request, res: Response): Promise<void> {
    const { policyId } = req.params;
    const policy = this.policies.find(p => p.id === policyId);

    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    res.json({
      success: true,
      data: policy,
    });
  }

  private async updatePolicy(req: Request, res: Response): Promise<void> {
    const { policyId } = req.params;
    const policyIdx = this.policies.findIndex(p => p.id === policyId);

    if (policyIdx === -1) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    const updated = { ...this.policies[policyIdx], ...req.body, id: policyId };
    this.policies[policyIdx] = updated;

    res.json({
      success: true,
      data: updated,
      message: 'Policy updated successfully',
    });
  }

  private async deletePolicy(req: Request, res: Response): Promise<void> {
    const { policyId } = req.params;
    const initialLength = this.policies.length;
    this.policies = this.policies.filter(p => p.id !== policyId);

    if (this.policies.length === initialLength) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Policy deleted successfully',
    });
  }

  private async getByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;
    const filtered = this.policies.filter(p => p.status === status);

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      status,
    });
  }

  private async submitAppeal(req: Request, res: Response): Promise<void> {
    const { policyId } = req.params;
    const { reason } = req.body;
    const policy = this.policies.find(p => p.id === policyId);

    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    policy.appealDetails = {
      reason,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    policy.status = 'appeal-pending';

    res.json({
      success: true,
      data: policy,
      message: 'Appeal submitted successfully. Admin will review within 24 hours.',
    });
  }

  private async resolveAppeal(req: Request, res: Response): Promise<void> {
    const { policyId, appealStatus } = req.params;
    const policy = this.policies.find(p => p.id === policyId);

    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    if (!policy.appealDetails) {
      res.status(400).json({
        success: false,
        error: 'No appeal found for this policy',
      });
      return;
    }

    policy.appealDetails.status = appealStatus as 'pending' | 'approved' | 'rejected';

    if (appealStatus === 'approved') {
      policy.status = 'exception-approved';
      policy.impact = {
        studentBenefit: 'Exception approved by admin. Student can now accept alternative offer.',
        reasonForException: 'Appeal reviewed and approved by placement coordinator.',
      };
    } else if (appealStatus === 'rejected') {
      policy.status = 'active';
      policy.impact = undefined;
    }

    res.json({
      success: true,
      data: policy,
      message: `Appeal ${appealStatus} successfully`,
    });
  }

  private async getAnalytics(_req: Request, res: Response): Promise<void> {
    const active = this.policies.filter(p => p.status === 'active').length;
    const completed = this.policies.filter(p => p.status === 'completed').length;
    const appealPending = this.policies.filter(p => p.status === 'appeal-pending').length;
    const exceptionApproved = this.policies.filter(p => p.status === 'exception-approved').length;

    const totalBlocked = this.policies.reduce((sum, p) => sum + p.blockedOffers.length, 0);
    const totalOffers = this.policies.length;

    const topCompaniesBlocked = this.policies
      .flatMap(p => p.blockedOffers)
      .reduce(
        (acc, offer) => {
          const existing = acc.find(c => c.company === offer.companyName);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ company: offer.companyName, count: 1 });
          }
          return acc;
        },
        [] as { company: string; count: number }[]
      )
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgPackagesAccepted = this.policies.reduce((sum, p) => sum + p.currentOffer.ctc, 0) / this.policies.length;

    res.json({
      success: true,
      data: {
        totalPoliciesEnforced: this.policies.length,
        activeEnforcement: active,
        completedEnforcement: completed,
        appealsSubmitted: appealPending,
        exceptionsApproved: exceptionApproved,
        totalOffersBlocked: totalBlocked,
        offersPerStudent: (totalBlocked / totalOffers).toFixed(2),
        averagePackageAccepted: Math.round(avgPackagesAccepted),
        topCompaniesAffected: topCompaniesBlocked,
        policyEffectiveness: `${((totalBlocked / (totalBlocked + totalOffers)) * 100).toFixed(1)}% of potential offers were managed under policy`,
      },
    });
  }
}

export default OneOfferPolicyController;

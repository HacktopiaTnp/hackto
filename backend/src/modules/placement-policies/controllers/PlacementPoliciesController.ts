import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface PolicyRule {
  id: string;
  name: string;
  type: 'one-offer' | 'branch-rule' | 'cgpa-rule' | 'blacklist' | 'bonus-points' | 'custom';
  enabled: boolean;
  description: string;
  conditions: string[];
  action: string;
  priority: number;
  appliedTo: string;
  startDate: string;
  endDate: string;
  createdDate: string;
  createdBy: string;
  impact?: {
    applicableStudents: number;
    affectedPolicies: string[];
  };
}

/**
 * Placement Policies Controller
 * Manages placement rules & regulations for TnP process
 */
export class PlacementPoliciesController {
  public router: Router;
  private policies: PolicyRule[] = [
    {
      id: '1',
      name: 'One Offer Policy 2026',
      type: 'one-offer',
      enabled: true,
      description: 'Students can accept only one offer per academic year. Once a student accepts an offer, they cannot accept another offer during the same placement cycle.',
      conditions: ['Student has accepted an offer', 'Another offer received', 'Same academic year'],
      action: 'Block second offer acceptance and notify recruiter',
      priority: 1,
      appliedTo: 'all',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      createdDate: '2026-03-15',
      createdBy: 'Admin',
      impact: {
        applicableStudents: 420,
        affectedPolicies: ['one-offer-exception', 'higher-package-override'],
      },
    },
    {
      id: '2',
      name: 'CSE Branch Premium Package',
      type: 'bonus-points',
      enabled: true,
      description: 'CSE students get 5% bonus scoring points for packages >= 15 LPA to encourage high-value placements. This incentivizes top companies to recruit from CSE branch.',
      conditions: ['Branch = CSE', 'Package >= 15 LPA', 'CGPA >= 8.0'],
      action: 'Add 5% bonus to interview score and ranking priority',
      priority: 2,
      appliedTo: 'CSE',
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      createdDate: '2026-04-01',
      createdBy: 'Admin',
      impact: {
        applicableStudents: 145,
        affectedPolicies: ['branch-performance', 'scoring-matrix'],
      },
    },
    {
      id: '3',
      name: 'Minimum CGPA Requirement',
      type: 'cgpa-rule',
      enabled: true,
      description: 'Students must maintain a minimum CGPA of 7.0 to be eligible for campus placements. This ensures quality candidates for recruiters and maintains placement statistics.',
      conditions: ['CGPA >= 7.0', 'No active backlog', 'Attendance >= 75%'],
      action: 'Allow placement registration and interview participation',
      priority: 1,
      appliedTo: 'all',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      createdDate: '2026-02-01',
      createdBy: 'Admin',
      impact: {
        applicableStudents: 380,
        affectedPolicies: ['eligibility-check', 'tier-classification'],
      },
    },
    {
      id: '4',
      name: 'Backlog Student Restriction',
      type: 'blacklist',
      enabled: true,
      description: 'Students with active backlogs are restricted from participating in campus placements until they clear all failed courses. This maintains academic standards.',
      conditions: ['Active backlog present', 'Not yet cleared'],
      action: 'Block from placement registration and mark as ineligible',
      priority: 1,
      appliedTo: 'all',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      createdDate: '2026-01-15',
      createdBy: 'Admin',
      impact: {
        applicableStudents: 45,
        affectedPolicies: ['eligibility-check'],
      },
    },
    {
      id: '5',
      name: 'Tier-2 Company CGPA Flexibility',
      type: 'branch-rule',
      enabled: true,
      description: 'For Tier-2 and emerging companies, CGPA requirement is relaxed to 6.5 to provide more placement opportunities for average-performing students.',
      conditions: ['Company category = Tier-2', 'CGPA >= 6.5', 'Interview cleared'],
      action: 'Allow interview participation with relaxed CGPA criteria',
      priority: 3,
      appliedTo: 'all',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      createdDate: '2026-05-20',
      createdBy: 'Coordinator',
      impact: {
        applicableStudents: 120,
        affectedPolicies: ['eligibility-check', 'tier-classification'],
      },
    },
    {
      id: '6',
      name: 'Higher Package Override',
      type: 'custom',
      enabled: false,
      description: 'Students who receive an offer with 50% higher package than their initial offer can accept the second offer (exception to one-offer policy).',
      conditions: ['Higher package >= 150% of first offer', 'Within 30 days', 'Mutual agreement'],
      action: 'Allow second offer acceptance with policy override',
      priority: 2,
      appliedTo: 'all',
      startDate: '2026-07-01',
      endDate: '2026-12-31',
      createdDate: '2026-06-10',
      createdBy: 'Admin',
      impact: {
        applicableStudents: 25,
        affectedPolicies: ['one-offer-policy'],
      },
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.getPolicies(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.createPolicy(req, res)));
    this.router.get('/:policyId', asyncHandler((req, res) => this.getPolicyById(req, res)));
    this.router.put('/:policyId', asyncHandler((req, res) => this.updatePolicy(req, res)));
    this.router.delete('/:policyId', asyncHandler((req, res) => this.deletePolicy(req, res)));
    this.router.patch('/:policyId/status', asyncHandler((req, res) => this.togglePolicy(req, res)));
    this.router.get('/type/:type', asyncHandler((req, res) => this.getPoliciesByType(req, res)));
    this.router.get('/scope/:scope', asyncHandler((req, res) => this.getPoliciesByScope(req, res)));
  }

  private async getPolicies(req: Request, res: Response): Promise<void> {
    const { enabled, type, search } = req.query;

    let filtered = [...this.policies];

    if (enabled !== undefined) {
      filtered = filtered.filter(p => p.enabled === (enabled === 'true'));
    }

    if (type) {
      filtered = filtered.filter(p => p.type === type);
    }

    if (search) {
      const searchStr = (search as string).toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchStr) ||
          p.description.toLowerCase().includes(searchStr)
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
    const { name, type, description, conditions, action, priority, appliedTo, startDate, endDate } = req.body;

    if (!name || !type || !action) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: name, type, action',
      });
      return;
    }

    const newPolicy: PolicyRule = {
      id: Date.now().toString(),
      name,
      type,
      description,
      conditions: conditions || [],
      action,
      priority: priority || 3,
      enabled: true,
      appliedTo: appliedTo || 'all',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-12-31',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
    };

    this.policies.push(newPolicy);

    res.status(201).json({
      success: true,
      data: newPolicy,
      message: 'Policy created successfully',
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

  private async togglePolicy(req: Request, res: Response): Promise<void> {
    const { policyId } = req.params;
    const { enabled } = req.body;
    const policy = this.policies.find(p => p.id === policyId);

    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Policy not found',
      });
      return;
    }

    policy.enabled = enabled;

    res.json({
      success: true,
      data: policy,
      message: 'Policy status updated successfully',
    });
  }

  private async getPoliciesByType(req: Request, res: Response): Promise<void> {
    const { type } = req.params;
    const filtered = this.policies.filter(p => p.type === type);

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      type,
    });
  }

  private async getPoliciesByScope(req: Request, res: Response): Promise<void> {
    const { scope } = req.params;
    const filtered = this.policies.filter(p => p.appliedTo === scope || p.appliedTo === 'all');

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      scope,
    });
  }
}

export default PlacementPoliciesController;

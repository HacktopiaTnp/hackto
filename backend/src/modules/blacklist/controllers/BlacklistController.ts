import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface BlacklistEntry {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  companyName: string;
  reason: string;
  details?: string;
  dateBlacklisted: string;
  expiryDate: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blacklistedBy: string;
  status: 'active' | 'expired' | 'appealed' | 'removed';
  appealDetails?: {
    appealDate: string;
    appealReason: string;
    appealStatus: 'pending' | 'approved' | 'rejected';
  };
}

/**
 * Blacklist Management Controller
 * Manages blocked candidates and blacklist entries
 */
export class BlacklistController {
  public router: Router;
  private blacklist: BlacklistEntry[] = [
    {
      id: '1',
      studentId: 'STU00145',
      studentName: 'Rajesh Kumar Singh',
      email: 'rajesh.singh@college.edu',
      companyName: 'Google',
      reason: 'Accepted offer & didn\'t report on joining date',
      details: 'Student accepted the offer but failed to report on the stipulated joining date without prior communication. This caused significant operational disruption as the company had planned resources accordingly.',
      severity: 'critical',
      dateBlacklisted: '2026-02-10',
      expiryDate: '2028-02-10',
      blacklistedBy: 'Admin',
      status: 'active',
    },
    {
      id: '2',
      studentId: 'STU00287',
      studentName: 'Priya Sharma',
      email: 'priya.sharma@college.edu',
      companyName: 'Microsoft',
      reason: 'Declined offer after verbal commitment',
      details: 'Student verbally committed to the offer during the final round interview, but declined in writing 24 hours before the official offer letter. This violated the placement agreement and caused significant recruiting delays.',
      severity: 'high',
      dateBlacklisted: '2026-01-15',
      expiryDate: '2027-01-15',
      blacklistedBy: 'Coordinator',
      status: 'active',
    },
    {
      id: '3',
      studentId: 'STU00156',
      studentName: 'Amit Patel',
      email: 'amit.patel@college.edu',
      companyName: 'Amazon',
      reason: 'No-show for final round interview',
      details: 'Student didn\'t appear for the scheduled final round interview despite confirming his availability. This wasted company time and delayed hiring process for that position.',
      severity: 'high',
      dateBlacklisted: '2026-03-05',
      expiryDate: '2027-03-05',
      blacklistedBy: 'Admin',
      status: 'active',
    },
    {
      id: '4',
      studentId: 'STU00203',
      studentName: 'Deepak Verma',
      email: 'deepak.verma@college.edu',
      companyName: 'TCS',
      reason: 'Misbehavior during interview process',
      details: 'Student demonstrated unprofessional conduct during the interview process, including disrespectful behavior towards recruiters and violation of code of conduct during company visit.',
      severity: 'medium',
      dateBlacklisted: '2026-02-25',
      expiryDate: '2026-08-25',
      blacklistedBy: 'Admin',
      status: 'active',
    },
    {
      id: '5',
      studentId: 'STU00312',
      studentName: 'Sneha Gupta',
      email: 'sneha.gupta@college.edu',
      companyName: 'Flipkart',
      reason: 'Plagiarism in assessment test',
      details: 'Student was caught using unauthorized resources during online assessment, violating academic integrity and placement process ethics. This undermines fair evaluation for all candidates.',
      severity: 'critical',
      dateBlacklisted: '2026-01-20',
      expiryDate: '2027-01-20',
      blacklistedBy: 'Admin',
      status: 'active',
    },
    {
      id: '6',
      studentId: 'STU00089',
      studentName: 'Vikas Reddy',
      email: 'vikas.reddy@college.edu',
      companyName: 'Adobe',
      reason: 'Absconded after verbal commitment',
      details: 'Student made verbal commitment to the offer but went completely unreachable, causing significant coordination issues and delay in recruiting alternative candidates.',
      severity: 'high',
      dateBlacklisted: '2025-12-10',
      expiryDate: '2026-12-10',
      blacklistedBy: 'Coordinator',
      status: 'expired',
    },
    {
      id: '7',
      studentId: 'STU00198',
      studentName: 'Neha Singh',
      email: 'neha.singh@college.edu',
      companyName: 'Goldman Sachs',
      reason: 'Submitted false documents',
      details: 'Student submitted forged academic certificates and employment verification documents during the application process, which is a serious violation of institutional and legal standards.',
      severity: 'critical',
      dateBlacklisted: '2026-02-01',
      expiryDate: '2029-02-01',
      blacklistedBy: 'Admin',
      status: 'active',
    },
    {
      id: '8',
      studentId: 'STU00267',
      studentName: 'Rohan Kapoor',
      email: 'rohan.kapoor@college.edu',
      companyName: 'Deloitte',
      reason: 'Breach of confidentiality',
      details: 'Student disclosed confidential information about interview questions and company hiring strategy to other candidates, violating confidentiality agreements.',
      severity: 'medium',
      dateBlacklisted: '2026-03-20',
      expiryDate: '2026-09-20',
      blacklistedBy: 'Admin',
      status: 'active',
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.getBlacklist(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.addToBlacklist(req, res)));
    this.router.get('/:entryId', asyncHandler((req, res) => this.getBlacklistById(req, res)));
    this.router.put('/:entryId', asyncHandler((req, res) => this.updateBlacklistEntry(req, res)));
    this.router.delete('/:entryId', asyncHandler((req, res) => this.removeFromBlacklist(req, res)));
    this.router.patch('/:entryId/status', asyncHandler((req, res) => this.updateStatus(req, res)));
    this.router.get('/severity/:severity', asyncHandler((req, res) => this.getBysSeverity(req, res)));
    this.router.get('/company/:companyName', asyncHandler((req, res) => this.getByCompany(req, res)));
    this.router.post('/:entryId/appeal', asyncHandler((req, res) => this.submitAppeal(req, res)));
    this.router.get('/analytics/summary', asyncHandler((req, res) => this.getAnalytics(req, res)));
  }

  private async getBlacklist(req: Request, res: Response): Promise<void> {
    const { status, severity, search } = req.query;

    let filtered = [...this.blacklist];

    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    if (severity) {
      filtered = filtered.filter(e => e.severity === severity);
    }

    if (search) {
      const searchStr = (search as string).toLowerCase();
      filtered = filtered.filter(
        e =>
          e.studentName.toLowerCase().includes(searchStr) ||
          e.companyName.toLowerCase().includes(searchStr) ||
          e.reason.toLowerCase().includes(searchStr)
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      blacklist: filtered,
    });
  }

  private async addToBlacklist(req: Request, res: Response): Promise<void> {
    const {
      studentName,
      email,
      companyName,
      reason,
      details,
      severity,
      studentId,
    } = req.body;

    if (!studentName || !companyName || !reason) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentName, companyName, reason',
      });
      return;
    }

    const newEntry: BlacklistEntry = {
      id: Date.now().toString(),
      studentId: studentId || 'STU' + Math.floor(Math.random() * 10000),
      studentName,
      email: email || 'student@college.edu',
      companyName,
      reason,
      details,
      severity: severity || 'medium',
      dateBlacklisted: new Date().toISOString().split('T')[0],
      expiryDate:
        new Date(Date.now() + (severity === 'critical' ? 3 * 365 : severity === 'high' ? 2 * 365 : severity === 'medium' ? 1 * 365 : 180) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      blacklistedBy: 'Admin',
      status: 'active',
    };

    this.blacklist.push(newEntry);

    res.status(201).json({
      success: true,
      data: newEntry,
      message: 'Student added to blacklist successfully',
    });
  }

  private async getBlacklistById(req: Request, res: Response): Promise<void> {
    const { entryId } = req.params;
    const entry = this.blacklist.find(e => e.id === entryId);

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'Blacklist entry not found',
      });
      return;
    }

    res.json({
      success: true,
      data: entry,
    });
  }

  private async updateBlacklistEntry(req: Request, res: Response): Promise<void> {
    const { entryId } = req.params;
    const entryIdx = this.blacklist.findIndex(e => e.id === entryId);

    if (entryIdx === -1) {
      res.status(404).json({
        success: false,
        error: 'Blacklist entry not found',
      });
      return;
    }

    const updated = { ...this.blacklist[entryIdx], ...req.body, id: entryId };
    this.blacklist[entryIdx] = updated;

    res.json({
      success: true,
      data: updated,
      message: 'Blacklist entry updated successfully',
    });
  }

  private async removeFromBlacklist(req: Request, res: Response): Promise<void> {
    const { entryId } = req.params;
    const initialLength = this.blacklist.length;
    this.blacklist = this.blacklist.filter(e => e.id !== entryId);

    if (this.blacklist.length === initialLength) {
      res.status(404).json({
        success: false,
        error: 'Blacklist entry not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Student removed from blacklist successfully',
    });
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    const { entryId } = req.params;
    const { status } = req.body;
    const entry = this.blacklist.find(e => e.id === entryId);

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'Blacklist entry not found',
      });
      return;
    }

    entry.status = status;

    res.json({
      success: true,
      data: entry,
      message: 'Status updated successfully',
    });
  }

  private async getBysSeverity(req: Request, res: Response): Promise<void> {
    const { severity } = req.params;
    const filtered = this.blacklist.filter(e => e.severity === severity);

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      severity,
    });
  }

  private async getByCompany(req: Request, res: Response): Promise<void> {
    const { companyName } = req.params;
    const filtered = this.blacklist.filter(e => e.companyName.toLowerCase() === companyName.toLowerCase());

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
      company: companyName,
    });
  }

  private async submitAppeal(req: Request, res: Response): Promise<void> {
    const { entryId } = req.params;
    const { appealReason } = req.body;
    const entry = this.blacklist.find(e => e.id === entryId);

    if (!entry) {
      res.status(404).json({
        success: false,
        error: 'Blacklist entry not found',
      });
      return;
    }

    entry.appealDetails = {
      appealDate: new Date().toISOString().split('T')[0],
      appealReason,
      appealStatus: 'pending',
    };
    entry.status = 'appealed';

    res.json({
      success: true,
      data: entry,
      message: 'Appeal submitted successfully. Admin will review it shortly.',
    });
  }

  private async getAnalytics(_req: Request, res: Response): Promise<void> {
    const active = this.blacklist.filter(e => e.status === 'active').length;
    const expired = this.blacklist.filter(e => e.status === 'expired').length;
    const appealed = this.blacklist.filter(e => e.status === 'appealed').length;
    const critical = this.blacklist.filter(e => e.severity === 'critical').length;

    const recentBlacklist = this.blacklist
      .sort((a, b) => new Date(b.dateBlacklisted).getTime() - new Date(a.dateBlacklisted).getTime())
      .slice(0, 5);

    const byCompany = this.blacklist.reduce(
      (acc, entry) => {
        const existing = acc.find(c => c.company === entry.companyName);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ company: entry.companyName, count: 1 });
        }
        return acc;
      },
      [] as { company: string; count: number }[]
    );

    res.json({
      success: true,
      data: {
        totalBlacklisted: this.blacklist.length,
        activeBlacklist: active,
        expiredBlacklist: expired,
        appealedBlacklist: appealed,
        criticalCases: critical,
        recentBlacklist,
        blacklistByCompany: byCompany.sort((a, b) => b.count - a.count),
      },
    });
  }
}

export default BlacklistController;

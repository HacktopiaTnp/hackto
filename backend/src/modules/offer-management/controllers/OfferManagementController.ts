import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Offer Management Controller
 * Handles offer letter creation, tracking, and management
 */
export class OfferManagementController {
  public router: Router;

  private static offers: any[] = [
    {
      id: '1',
      studentName: 'Rahul Kumar',
      studentEmail: 'rahul@college.edu',
      companyName: 'Google',
      position: 'Software Engineer',
      salary: 800000,
      ctc: 1000000,
      joiningDate: '2026-07-15',
      offerDate: '2026-04-10',
      expiryDate: '2026-04-20',
      status: 'pending',
      benefits: ['Health Insurance', '5 weeks leave', 'Stock Options'],
      terms: 'Full-time, Permanent',
      responseDeadline: '2026-04-20',
      createdAt: '2026-04-10',
    },
    {
      id: '2',
      studentName: 'Priya Singh',
      studentEmail: 'priya@college.edu',
      companyName: 'Microsoft',
      position: 'SDE Intern',
      salary: 50000,
      ctc: 0,
      joiningDate: '2026-05-01',
      offerDate: '2026-03-15',
      expiryDate: '2026-04-15',
      status: 'accepted',
      benefits: ['Stipend', 'Accommodation', 'Meals'],
      terms: '3-month internship',
      responseDeadline: '2026-04-15',
      createdAt: '2026-03-15',
    },
    {
      id: '3',
      studentName: 'Vikram Patel',
      studentEmail: 'vikram@college.edu',
      companyName: 'Amazon',
      position: 'Data Engineer',
      salary: 700000,
      ctc: 900000,
      joiningDate: '2026-08-01',
      offerDate: '2026-04-05',
      expiryDate: '2026-04-18',
      status: 'pending',
      benefits: ['Health Insurance', '4 weeks leave', 'Career Growth'],
      terms: 'Full-time, Permanent',
      responseDeadline: '2026-04-18',
      createdAt: '2026-04-05',
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
    // GET /api/v1/offers - List all offers
    this.router.get(
      '/',
      asyncHandler((req, res) => this.listOffers(req, res))
    );

    // POST /api/v1/offers - Create new offer
    this.router.post(
      '/',
      asyncHandler((req, res) => this.createOffer(req, res))
    );

    // GET /api/v1/offers/:offerId - Get offer detail
    this.router.get(
      '/:offerId',
      asyncHandler((req, res) => this.getOfferDetail(req, res))
    );

    // PUT /api/v1/offers/:offerId - Update offer
    this.router.put(
      '/:offerId',
      asyncHandler((req, res) => this.updateOffer(req, res))
    );

    // DELETE /api/v1/offers/:offerId - Delete offer
    this.router.delete(
      '/:offerId',
      asyncHandler((req, res) => this.deleteOffer(req, res))
    );

    // PATCH /api/v1/offers/:offerId/status - Update offer status
    this.router.patch(
      '/:offerId/status',
      asyncHandler((req, res) => this.updateOfferStatus(req, res))
    );

    // GET /api/v1/offers/status/:status - Filter offers by status
    this.router.get(
      '/status/:status',
      asyncHandler((req, res) => this.getOffersByStatus(req, res))
    );

    // GET /api/v1/offers/company/:companyName - Get offers by company
    this.router.get(
      '/company/:companyName',
      asyncHandler((req, res) => this.getOffersByCompany(req, res))
    );

    // GET /api/v1/offers/analytics/summary - Get analytics summary
    this.router.get(
      '/analytics/summary',
      asyncHandler((req, res) => this.getOffersSummary(req, res))
    );
  }

  /**
   * List all offers with filtering
   */
  private async listOffers(req: Request, res: Response): Promise<void> {
    const { status, company, student } = req.query;

    let offers = OfferManagementController.offers;

    if (status) {
      offers = offers.filter(o => o.status === status);
    }
    if (company) {
      offers = offers.filter(o => 
        o.companyName.toLowerCase().includes((company as string).toLowerCase())
      );
    }
    if (student) {
      offers = offers.filter(o => 
        o.studentName.toLowerCase().includes((student as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      offers: offers,
      total: offers.length,
      data: offers,
    });
  }

  /**
   * Get offer detail
   */
  private async getOfferDetail(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;

    const offer = OfferManagementController.offers.find(o => o.id === offerId);

    if (!offer) {
      res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
      return;
    }

    res.json({
      success: true,
      data: offer,
    });
  }

  /**
   * Create new offer
   */
  private async createOffer(req: Request, res: Response): Promise<void> {
    const {
      studentName,
      studentEmail,
      companyName,
      position,
      salary,
      ctc,
      joiningDate,
      expiryDate,
      terms,
      benefits,
      responseDeadline,
    } = req.body;

    // Validation
    if (!studentName || !companyName || !position || !joiningDate) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentName, companyName, position, joiningDate',
      });
      return;
    }

    const newOffer = {
      id: Date.now().toString(),
      studentName,
      studentEmail: studentEmail || '',
      companyName,
      position,
      salary: salary || 0,
      ctc: ctc || 0,
      joiningDate,
      offerDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      benefits: benefits || [],
      terms: terms || '',
      responseDeadline: responseDeadline || expiryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    OfferManagementController.offers.push(newOffer);

    res.status(201).json({
      success: true,
      data: newOffer,
    });
  }

  /**
   * Update offer
   */
  private async updateOffer(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const updateData = req.body;

    const offer = OfferManagementController.offers.find(o => o.id === offerId);

    if (!offer) {
      res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
      return;
    }

    const updated = {
      ...offer,
      ...updateData,
      id: offer.id,
      offerDate: offer.offerDate,
      createdAt: offer.createdAt,
    };

    const index = OfferManagementController.offers.findIndex(o => o.id === offerId);
    OfferManagementController.offers[index] = updated;

    res.json({
      success: true,
      data: updated,
    });
  }

  /**
   * Delete offer
   */
  private async deleteOffer(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;

    const index = OfferManagementController.offers.findIndex(o => o.id === offerId);

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
      return;
    }

    const deleted = OfferManagementController.offers.splice(index, 1)[0];

    res.json({
      success: true,
      message: 'Offer deleted successfully',
      data: deleted,
    });
  }

  /**
   * Update offer status
   */
  private async updateOfferStatus(req: Request, res: Response): Promise<void> {
    const { offerId } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: status',
      });
      return;
    }

    const offer = OfferManagementController.offers.find(o => o.id === offerId);

    if (!offer) {
      res.status(404).json({
        success: false,
        error: 'Offer not found',
      });
      return;
    }

    offer.status = status;

    res.json({
      success: true,
      message: 'Offer status updated successfully',
      data: offer,
    });
  }

  /**
   * Get offers by status
   */
  private async getOffersByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;

    const offers = OfferManagementController.offers.filter(o => o.status === status);

    res.json({
      success: true,
      status,
      offers,
      total: offers.length,
    });
  }

  /**
   * Get offers by company
   */
  private async getOffersByCompany(req: Request, res: Response): Promise<void> {
    const { companyName } = req.params;

    const offers = OfferManagementController.offers.filter(o =>
      o.companyName.toLowerCase().includes(companyName.toLowerCase())
    );

    res.json({
      success: true,
      company: companyName,
      offers,
      total: offers.length,
    });
  }

  /**
   * Get offers summary with analytics
   */
  private async getOffersSummary(_req: Request, res: Response): Promise<void> {
    const offers = OfferManagementController.offers;

    const summary = {
      totalOffers: offers.length,
      pending: offers.filter(o => o.status === 'pending').length,
      accepted: offers.filter(o => o.status === 'accepted').length,
      rejected: offers.filter(o => o.status === 'rejected').length,
      expired: offers.filter(o => o.status === 'expired').length,
      revoked: offers.filter(o => o.status === 'revoked').length,
      totalPackage: offers.reduce((sum, o) => sum + (o.ctc || o.salary || 0), 0),
      averagePackage: offers.length > 0 ? Math.round(offers.reduce((sum, o) => sum + (o.ctc || o.salary || 0), 0) / offers.length) : 0,
      byCompany: [...new Set(offers.map(o => o.companyName))].map(company => ({
        company,
        count: offers.filter(o => o.companyName === company).length,
        accepted: offers.filter(o => o.companyName === company && o.status === 'accepted').length,
      })),
    };

    res.json({
      success: true,
      data: summary,
    });
  }
}

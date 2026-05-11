import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * TnP Members Controller
 * Manages TnP cell members and their roles
 */
export class TnPMembersController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.getMembers(req, res)));
    this.router.get('/:id', asyncHandler((req, res) => this.getMemberById(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.createMember(req, res)));
    this.router.put('/:id', asyncHandler((req, res) => this.updateMember(req, res)));
    this.router.delete('/:id', asyncHandler((req, res) => this.deleteMember(req, res)));
    this.router.patch('/:id/role', asyncHandler((req, res) => this.updateRole(req, res)));
  }

  private async getMembers(_req: Request, res: Response): Promise<void> {
    res.json({
      status: 'success',
      data: [
        { id: '1', name: 'Prof. Kumar', role: 'Coordinator', email: 'kumar@college.edu', department: 'CSE', phone: '9876543210' },
        { id: '2', name: 'Prof. Singh', role: 'Advisor', email: 'singh@college.edu', department: 'IT', phone: '9876543211' },
      ],
      message: 'TnP members retrieved',
    });
  }

  private async getMemberById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    res.json({
      status: 'success',
      data: { id, name: 'Prof. Kumar', role: 'Coordinator' },
      message: 'TnP member retrieved',
    });
  }

  private async createMember(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      status: 'success',
      data: { id: 'new-id', ...req.body },
      message: 'TnP member created',
    });
  }

  private async updateMember(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'success',
      data: { id: req.params.id, ...req.body },
      message: 'TnP member updated',
    });
  }

  private async deleteMember(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'success',
      data: { id: req.params.id },
      message: 'TnP member deleted',
    });
  }

  private async updateRole(req: Request, res: Response): Promise<void> {
    const { role } = req.body;
    res.json({
      status: 'success',
      data: { id: req.params.id, role },
      message: 'Role updated',
    });
  }
}

export default TnPMembersController;

import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

/**
 * Drive Management Controller
 * Handles campus recruitment drive scheduling and management
 */
export class DriveManagementController {
  public router: Router;
  
  private static drives: any[] = [
    {
      id: '1',
      companyName: 'Google',
      driveDate: '2026-05-15',
      location: 'College Campus, Auditorium A',
      jobTitle: 'Software Engineer Intern',
      totalPositions: 20,
      registeredStudents: 156,
      attendees: 142,
      status: 'upcoming',
      description: 'On-campus recruitment drive for internship positions',
      hostContact: 'John Doe',
      hostPhone: '+91-9876543210',
      roundDetails: [
        {
          roundNumber: 1,
          roundName: 'Online Assessment',
          date: '2026-05-15',
          time: '10:00 AM',
          location: 'Online',
          capacity: 156,
        },
        {
          roundNumber: 2,
          roundName: 'Technical Interview',
          date: '2026-05-16',
          time: '02:00 PM',
          location: 'College Campus',
          capacity: 40,
        },
      ],
      eligibility: {
        cgpa: 7.0,
        branches: ['CSE', 'IT', 'ECE'],
        batch: '2024-2025',
      },
      postedDate: '2026-04-01',
      createdBy: 'Admin',
    },
    {
      id: '2',
      companyName: 'Microsoft',
      driveDate: '2026-05-20',
      location: 'Virtual - Online',
      jobTitle: 'Senior Software Engineer',
      totalPositions: 15,
      registeredStudents: 124,
      attendees: 98,
      status: 'upcoming',
      description: 'Microsoft is hiring talented engineers for their cloud division',
      hostContact: 'Sarah Smith',
      hostPhone: '+91-9876543211',
      roundDetails: [
        {
          roundNumber: 1,
          roundName: 'Code Round',
          date: '2026-05-20',
          time: '09:00 AM',
          location: 'Online',
          capacity: 124,
        },
        {
          roundNumber: 2,
          roundName: 'System Design',
          date: '2026-05-21',
          time: '03:00 PM',
          location: 'Online',
          capacity: 30,
        },
      ],
      eligibility: {
        cgpa: 6.5,
        branches: ['CSE', 'IT'],
        batch: '2024-2025',
      },
      postedDate: '2026-04-02',
      createdBy: 'Admin',
    },
    {
      id: '3',
      companyName: 'Amazon',
      driveDate: '2026-05-25',
      location: 'College Campus, Auditorium B',
      jobTitle: 'Data Engineer',
      totalPositions: 18,
      registeredStudents: 87,
      attendees: 65,
      status: 'ongoing',
      description: 'Amazon is recruiting data engineers for AWS platform',
      hostContact: 'Mike Johnson',
      hostPhone: '+91-9876543212',
      roundDetails: [
        {
          roundNumber: 1,
          roundName: 'Technical Assessment',
          date: '2026-05-25',
          time: '11:00 AM',
          location: 'College Campus',
          capacity: 87,
        },
      ],
      eligibility: {
        cgpa: 7.2,
        branches: ['CSE', 'IT', 'ECE'],
        batch: '2024-2025',
      },
      postedDate: '2026-04-03',
      createdBy: 'Admin',
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
    // GET /api/v1/drive-management - List all drives
    this.router.get(
      '/',
      asyncHandler((req, res) => this.listDrives(req, res))
    );

    // POST /api/v1/drive-management - Create new drive
    this.router.post(
      '/',
      asyncHandler((req, res) => this.createDrive(req, res))
    );

    // GET /api/v1/drive-management/:driveId - Get drive detail
    this.router.get(
      '/:driveId',
      asyncHandler((req, res) => this.getDriveDetail(req, res))
    );

    // PUT /api/v1/drive-management/:driveId - Update drive
    this.router.put(
      '/:driveId',
      asyncHandler((req, res) => this.updateDrive(req, res))
    );

    // DELETE /api/v1/drive-management/:driveId - Delete drive
    this.router.delete(
      '/:driveId',
      asyncHandler((req, res) => this.deleteDrive(req, res))
    );

    // GET /api/v1/drive-management/status/:status - Filter drives by status
    this.router.get(
      '/status/:status',
      asyncHandler((req, res) => this.getDrivesByStatus(req, res))
    );

    // GET /api/v1/drive-management/company/:companyName - Get drives by company
    this.router.get(
      '/company/:companyName',
      asyncHandler((req, res) => this.getDrivesByCompany(req, res))
    );

    // POST /api/v1/drive-management/:driveId/register - Register student in drive
    this.router.post(
      '/:driveId/register',
      asyncHandler((req, res) => this.registerStudent(req, res))
    );

    // POST /api/v1/drive-management/:driveId/attendance - Mark attendance
    this.router.post(
      '/:driveId/attendance',
      asyncHandler((req, res) => this.markAttendance(req, res))
    );
  }

  /**
   * List all drives with filtering
   */
  private async listDrives(req: Request, res: Response): Promise<void> {
    const { status, company } = req.query;

    let drives = DriveManagementController.drives;

    if (status) {
      drives = drives.filter(d => d.status === status);
    }
    if (company) {
      drives = drives.filter(d => 
        d.companyName.toLowerCase().includes((company as string).toLowerCase())
      );
    }

    res.json({
      success: true,
      drives: drives,
      total: drives.length,
      data: drives,
    });
  }

  /**
   * Get drive detail
   */
  private async getDriveDetail(req: Request, res: Response): Promise<void> {
    const { driveId } = req.params;

    const drive = DriveManagementController.drives.find(d => d.id === driveId);

    if (!drive) {
      res.status(404).json({
        success: false,
        error: 'Drive not found',
      });
      return;
    }

    res.json({
      success: true,
      data: drive,
    });
  }

  /**
   * Create new drive
   */
  private async createDrive(req: Request, res: Response): Promise<void> {
    const {
      companyName,
      driveDate,
      location,
      jobTitle,
      totalPositions,
      status,
      description,
      hostContact,
      hostPhone,
      eligibility,
      roundDetails,
    } = req.body;

    // Validation
    if (!companyName || !driveDate || !jobTitle) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: companyName, driveDate, jobTitle',
      });
      return;
    }

    const newDrive = {
      id: Date.now().toString(),
      companyName,
      driveDate,
      location: location || '',
      jobTitle,
      totalPositions: totalPositions || 0,
      registeredStudents: 0,
      attendees: 0,
      status: status || 'upcoming',
      description: description || '',
      hostContact: hostContact || '',
      hostPhone: hostPhone || '',
      eligibility: eligibility || { cgpa: 6.0, branches: [], batch: '' },
      roundDetails: roundDetails || [],
      postedDate: new Date().toISOString().split('T')[0],
      createdBy: 'Admin',
    };

    DriveManagementController.drives.push(newDrive);

    res.status(201).json({
      success: true,
      data: newDrive,
    });
  }

  /**
   * Update drive
   */
  private async updateDrive(req: Request, res: Response): Promise<void> {
    const { driveId } = req.params;
    const updateData = req.body;

    const drive = DriveManagementController.drives.find(d => d.id === driveId);

    if (!drive) {
      res.status(404).json({
        success: false,
        error: 'Drive not found',
      });
      return;
    }

    const updated = {
      ...drive,
      ...updateData,
      id: drive.id,
      postedDate: drive.postedDate,
      createdBy: drive.createdBy,
      registeredStudents: updateData.registeredStudents || drive.registeredStudents,
      attendees: updateData.attendees || drive.attendees,
    };

    const index = DriveManagementController.drives.findIndex(d => d.id === driveId);
    DriveManagementController.drives[index] = updated;

    res.json({
      success: true,
      data: updated,
    });
  }

  /**
   * Delete drive
   */
  private async deleteDrive(req: Request, res: Response): Promise<void> {
    const { driveId } = req.params;

    const index = DriveManagementController.drives.findIndex(d => d.id === driveId);

    if (index === -1) {
      res.status(404).json({
        success: false,
        error: 'Drive not found',
      });
      return;
    }

    const deleted = DriveManagementController.drives.splice(index, 1)[0];

    res.json({
      success: true,
      message: 'Drive deleted successfully',
      data: deleted,
    });
  }

  /**
   * Get drives by status
   */
  private async getDrivesByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;

    const drives = DriveManagementController.drives.filter(d => d.status === status);

    res.json({
      success: true,
      status,
      drives,
      total: drives.length,
    });
  }

  /**
   * Get drives by company
   */
  private async getDrivesByCompany(req: Request, res: Response): Promise<void> {
    const { companyName } = req.params;

    const drives = DriveManagementController.drives.filter(d =>
      d.companyName.toLowerCase().includes(companyName.toLowerCase())
    );

    res.json({
      success: true,
      company: companyName,
      drives,
      total: drives.length,
    });
  }

  /**
   * Register student in drive
   */
  private async registerStudent(req: Request, res: Response): Promise<void> {
    const { driveId } = req.params;
    const { studentRoll, studentName } = req.body;

    if (!studentRoll || !studentName) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentRoll, studentName',
      });
      return;
    }

    const drive = DriveManagementController.drives.find(d => d.id === driveId);

    if (!drive) {
      res.status(404).json({
        success: false,
        error: 'Drive not found',
      });
      return;
    }

    // Increment registration count (simplified - in real app would store actual registrations)
    drive.registeredStudents = (drive.registeredStudents || 0) + 1;

    res.json({
      success: true,
      message: `Student ${studentName} registered for ${drive.companyName} drive`,
      data: drive,
    });
  }

  /**
   * Mark attendance
   */
  private async markAttendance(req: Request, res: Response): Promise<void> {
    const { driveId } = req.params;
    const { studentRoll, present } = req.body;

    if (!studentRoll || present === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: studentRoll, present',
      });
      return;
    }

    const drive = DriveManagementController.drives.find(d => d.id === driveId);

    if (!drive) {
      res.status(404).json({
        success: false,
        error: 'Drive not found',
      });
      return;
    }

    // Update attendance (simplified)
    if (present) {
      drive.attendees = (drive.attendees || 0) + 1;
    }

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: drive,
    });
  }
}

export default DriveManagementController;

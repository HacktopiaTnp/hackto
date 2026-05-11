import { Router, Request, Response } from 'express';
import { asyncHandler } from '@api/middleware/error.middleware';

interface ResumeBatch {
  id: string;
  name: string;
  batch: string;
  branch: string;
  year: number;
  resumeCount: number;
  status: 'active' | 'archived';
  createdDate: string;
  updatedDate: string;
  resumes: Array<{
    id: string;
    studentId: string;
    studentName: string;
    cgpa: number;
    branch: string;
    skills: string[];
    appliedCompanies: number;
  }>;
}

/**
 * Resume Books Controller
 */
export class ResumeBooksController {
  public router: Router;
  private resumeBooks: ResumeBatch[] = [
    {
      id: '1',
      name: '2026 CSE Branch Resume Book',
      batch: '2026',
      branch: 'CSE',
      year: 2026,
      resumeCount: 142,
      status: 'active',
      createdDate: '2026-01-15',
      updatedDate: '2026-04-10',
      resumes: [
        { id: 'r1', studentId: 'STU00145', studentName: 'Rahul Kumar', cgpa: 8.9, branch: 'CSE', skills: ['Python', 'JavaScript', 'React', 'AWS'], appliedCompanies: 12 },
        { id: 'r2', studentId: 'STU00146', studentName: 'Priya Sharma', cgpa: 9.1, branch: 'CSE', skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'], appliedCompanies: 15 },
        { id: 'r3', studentId: 'STU00147', studentName: 'Amit Patel', cgpa: 8.5, branch: 'CSE', skills: ['C++', 'Data Structures', 'System Design'], appliedCompanies: 10 },
      ],
    },
    {
      id: '2',
      name: '2026 IT Branch Resume Book',
      batch: '2026',
      branch: 'IT',
      year: 2026,
      resumeCount: 98,
      status: 'active',
      createdDate: '2026-01-15',
      updatedDate: '2026-04-08',
      resumes: [
        { id: 'r4', studentId: 'STU00200', studentName: 'Deepak Verma', cgpa: 8.7, branch: 'IT', skills: ['Python', 'Django', 'PostgreSQL', 'Linux'], appliedCompanies: 11 },
        { id: 'r5', studentId: 'STU00201', studentName: 'Sneha Gupta', cgpa: 9.2, branch: 'IT', skills: ['Full Stack', 'MERN', 'Cloud Computing'], appliedCompanies: 14 },
      ],
    },
    {
      id: '3',
      name: '2026 ECE Branch Resume Book',
      batch: '2026',
      branch: 'ECE',
      year: 2026,
      resumeCount: 76,
      status: 'active',
      createdDate: '2026-01-15',
      updatedDate: '2026-04-05',
      resumes: [
        { id: 'r6', studentId: 'STU00300', studentName: 'Vikas Reddy', cgpa: 8.3, branch: 'ECE', skills: ['Signal Processing', 'VLSI', 'Embedded Systems'], appliedCompanies: 8 },
      ],
    },
    {
      id: '4',
      name: '2025 CSE Branch Resume Book',
      batch: '2025',
      branch: 'CSE',
      year: 2025,
      resumeCount: 156,
      status: 'archived',
      createdDate: '2025-01-10',
      updatedDate: '2025-12-20',
      resumes: [],
    },
    {
      id: '5',
      name: '2025 IT Branch Resume Book',
      batch: '2025',
      branch: 'IT',
      year: 2025,
      resumeCount: 112,
      status: 'archived',
      createdDate: '2025-01-10',
      updatedDate: '2025-12-15',
      resumes: [],
    },
    {
      id: '6',
      name: '2024 CSE Branch Resume Book',
      batch: '2024',
      branch: 'CSE',
      year: 2024,
      resumeCount: 189,
      status: 'archived',
      createdDate: '2024-01-08',
      updatedDate: '2024-12-10',
      resumes: [],
    },
  ];

  constructor() {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.get('/', asyncHandler((req, res) => this.getBooks(req, res)));
    this.router.get('/:id', asyncHandler((req, res) => this.getBookById(req, res)));
    this.router.post('/', asyncHandler((req, res) => this.createBook(req, res)));
    this.router.put('/:id', asyncHandler((req, res) => this.updateBook(req, res)));
    this.router.delete('/:id', asyncHandler((req, res) => this.deleteBook(req, res)));
    this.router.patch('/:id/status', asyncHandler((req, res) => this.updateStatus(req, res)));
    this.router.get('/:id/export', asyncHandler((req, res) => this.exportBook(req, res)));
    this.router.get('/status/:status', asyncHandler((req, res) => this.getBooksByStatus(req, res)));
  }

  private async getBooks(req: Request, res: Response): Promise<void> {
    const { status, branch, year } = req.query;
    let filtered = this.resumeBooks;

    if (status) filtered = filtered.filter(b => b.status === status);
    if (branch) filtered = filtered.filter(b => b.branch === branch);
    if (year) filtered = filtered.filter(b => b.year === parseInt(year as string));

    res.json({
      success: true,
      data: filtered.map(b => ({
        id: b.id,
        name: b.name,
        batch: b.batch,
        branch: b.branch,
        year: b.year,
        resumeCount: b.resumeCount,
        status: b.status,
        createdDate: b.createdDate,
        updatedDate: b.updatedDate,
      })),
      total: filtered.length,
    });
  }

  private async getBookById(req: Request, res: Response): Promise<void> {
    const book = this.resumeBooks.find(b => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Resume book not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: book.id,
        name: book.name,
        batch: book.batch,
        branch: book.branch,
        year: book.year,
        resumeCount: book.resumeCount,
        status: book.status,
        createdDate: book.createdDate,
        updatedDate: book.updatedDate,
        resumes: book.resumes,
      },
    });
  }

  private async createBook(req: Request, res: Response): Promise<void> {
    const { name, batch, branch, year } = req.body;
    const newBook: ResumeBatch = {
      id: `rb${Date.now()}`,
      name,
      batch,
      branch,
      year,
      resumeCount: 0,
      status: 'active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      resumes: [],
    };

    this.resumeBooks.push(newBook);
    res.status(201).json({
      success: true,
      data: newBook,
    });
  }

  private async updateBook(req: Request, res: Response): Promise<void> {
    const book = this.resumeBooks.find(b => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Resume book not found' });
      return;
    }

    Object.assign(book, { ...req.body, updatedDate: new Date().toISOString() });
    res.json({ success: true, data: book });
  }

  private async deleteBook(req: Request, res: Response): Promise<void> {
    const index = this.resumeBooks.findIndex(b => b.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Resume book not found' });
      return;
    }

    const deleted = this.resumeBooks.splice(index, 1)[0];
    res.json({ success: true, data: deleted, message: 'Resume book deleted' });
  }

  private async updateStatus(req: Request, res: Response): Promise<void> {
    const book = this.resumeBooks.find(b => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Resume book not found' });
      return;
    }

    const { status } = req.body;
    if (!['active', 'archived'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    book.status = status;
    book.updatedDate = new Date().toISOString();
    res.json({ success: true, data: book });
  }

  private async exportBook(req: Request, res: Response): Promise<void> {
    const book = this.resumeBooks.find(b => b.id === req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Resume book not found' });
      return;
    }

    // Simulate export (in real app, generate CSV/PDF)
    res.json({
      success: true,
      data: {
        bookName: book.name,
        totalResumes: book.resumeCount,
        resumes: book.resumes,
        exportDate: new Date().toISOString(),
      },
      message: 'Resume book exported successfully',
    });
  }

  private async getBooksByStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.params;
    const filtered = this.resumeBooks.filter(b => b.status === status);

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  }
}

export default ResumeBooksController;

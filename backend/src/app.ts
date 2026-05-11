import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { createServer } from 'http';
//import { Server as SocketIOServer } from 'socket.io';
//import { Redis } from 'ioredis';
import { env } from '@config/env';
import { logger } from '@core/logger/logger';
import { DatabaseService } from '@core/database/DatabaseService';
import { CacheService } from '@core/cache/CacheService';

// Middleware
import {
  requestLogger,
  corsMiddleware,
  securityHeaders,
  bodySizeLimit,
} from '@api/middleware/logging.middleware';
import { errorHandler, notFoundHandler } from '@api/middleware/error.middleware';

// Controllers
import AuthController from '@modules/auth/controllers/AuthController';
import userProfileRouter from '@modules/user/controllers/UserProfileController';
import { MockInterviewController } from '@modules/mock-interview/controllers/MockInterviewController';
import { DashboardController } from '@modules/dashboard/controllers/DashboardController';
import { JobsController } from '@modules/jobs/controllers/JobsController';
import { CompaniesController } from '@modules/companies/controllers/CompaniesController';
import { RecruitersController } from '@modules/recruiters/controllers/RecruitersController';
import { ResumeAtsController } from '@modules/resume-ats/controllers/ResumeAtsController';
import { DsaTrackerController } from '@modules/dsa-tracker/controllers/DsaTrackerController';
import { OaPracticeController } from '@modules/oa-practice/controllers/OaPracticeController';
import { BlogsController } from '@modules/blogs/controllers/BlogsController';
import { AnnouncementsController } from '@modules/announcements/controllers/AnnouncementsController';

// Admin Controllers
import RecruiterNotesController from '@modules/recruiter-notes/controllers/RecruiterNotesController';
import TnPMembersController from '@modules/tnp-members/controllers/TnPMembersController';
import StudentReadinessController from '@modules/student-readiness/controllers/StudentReadinessController';
import { DriveManagementController } from '@modules/drive-management/controllers/DriveManagementController';
import { OfferManagementController } from '@modules/offer-management/controllers/OfferManagementController';
import PlacementPoliciesController from '@modules/placement-policies/controllers/PlacementPoliciesController';
import BlacklistController from '@modules/blacklist/controllers/BlacklistController';
import OneOfferPolicyController from '@modules/one-offer-policy/controllers/OneOfferPolicyController';
import ResumeBooksController from '@modules/resume-books/controllers/ResumeBooksController';
import ImageController from '@modules/images/controllers/ImageController';

//import { problemsRouter, roomsRouter, submissionsRouter, scorecardsRouter } from '@api/routes/live-coding.routes';

/**
 * Application Setup
 * Initializes Express app with middleware, services, and routes
 */
export class App {
  private app: Express;
  private httpServer: any;
  private port: number;
  private servicesInitialized = false;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = env.PORT;
    
    // Initialize Socket.IO
    // io = new SocketIOServer(this.httpServer, {
    //   cors: {
    //     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    //     methods: ['GET', 'POST'],
    //     credentials: true,
    //   },
    //   transports: ['websocket', 'polling'],
    // });

    // Make globally available
    //(global as any).io = io;

    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    this.app.use(corsMiddleware);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
    this.app.use(cookieParser());

    // Compression
    this.app.use(compression());

    // Request logging
    this.app.use(requestLogger);

    // Body size limits
    this.app.use(bodySizeLimit(10));

    // Security headers
    this.app.use(securityHeaders);

    logger.info('Middleware setup complete');
  }

  /**
   * Setup services
   */
  private async setupServices(): Promise<void> {
    try {
      // Initialize Redis for live coding
      //const skipRedisInit = process.env.SKIP_REDIS_INIT === 'true';
      // if (!skipRedisInit) {
      //   try {
      //     redis = new Redis({
      //       host: process.env.REDIS_HOST || 'localhost',
      //       port: parseInt(process.env.REDIS_PORT || '6379'),
      //       password: process.env.REDIS_PASSWORD,
      //       db: 1, // Separate DB for live coding
      //     });
      //     (global as any).redis = redis;
      //     logger.info('✅ Redis initialized for live coding');
      //   } catch (redisError) {
      //     if (env.NODE_ENV === 'development') {
      //       logger.warn('Redis connection failed (development mode, continuing)', redisError);
      //     } else {
      //       throw redisError;
      //     }
      //   }
      // }

      // Initialize database (skip if not required in development)
      const skipDbInit = process.env.SKIP_DATABASE_INIT === 'true';
      if (!skipDbInit) {
        try {
          await DatabaseService.getConnection();
          logger.info('Database initialized');
        } catch (dbError) {
          // In development, warn but continue without database
          if (env.NODE_ENV === 'development') {
            logger.warn('Database connection failed (development mode, continuing without database)', dbError);
          } else {
            throw dbError;
          }
        }
      } else {
        logger.info('Database initialization skipped (SKIP_DATABASE_INIT=true)');
      }

      // Initialize cache
      const skipCacheInit = process.env.SKIP_REDIS_INIT === 'true';
      if (skipCacheInit) {
        CacheService.disableCache();
        logger.info('Cache initialization skipped (SKIP_REDIS_INIT=true)');
      } else {
        try {
          await CacheService.initialize();
          logger.info('Cache initialized');
        } catch (cacheError) {
          // In development, warn but continue without cache
          if (env.NODE_ENV === 'development') {
            logger.warn('Cache connection failed (development mode, continuing without cache)', cacheError);
            CacheService.disableCache();
          } else {
            throw cacheError;
          }
        }
      }

      logger.info('All services initialized');
    } catch (error) {
      logger.fatal('Service initialization failed', error);
      throw error;
    }
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Version info
    this.app.get('/info', (_req: Request, res: Response) => {
      res.json({
        name: env.APP_NAME,
        version: env.APP_VERSION,
        environment: env.NODE_ENV,
      });
    });

    // Live Coding health check
    // this.app.get('/api/v1/health/live-coding', (_req: Request, res: Response) => {
    //   res.json({
    //     status: 'ok',
    //     service: 'live-coding',
    //     socketIO: io ? 'connected' : 'not initialized',
    //     timestamp: new Date().toISOString(),
    //   });
    // });

    // API v1 routes
    const apiV1Router = express.Router();

    // Auth routes
    const authController = new AuthController();
    apiV1Router.use('/auth', authController.router);

    // User profile routes
    apiV1Router.use('/user', userProfileRouter);

    // Mock Interview routes
    const mockInterviewController = new MockInterviewController();
    apiV1Router.use('/mock-interview', mockInterviewController.router);

    // Dashboard routes
    const dashboardController = new DashboardController();
    apiV1Router.use('/dashboard', dashboardController.router);

    // Jobs routes
    const jobsController = new JobsController();
    apiV1Router.use('/jobs', jobsController.router);

    // Companies routes
    const companiesController = new CompaniesController();
    apiV1Router.use('/companies', companiesController.router);

    // Recruiters routes
    const recruitersController = new RecruitersController();
    apiV1Router.use('/recruiters', recruitersController.router);

    // Resume ATS routes
    const resumeAtsController = new ResumeAtsController();
    apiV1Router.use('/resume-ats', resumeAtsController.router);

    // DSA Tracker routes
    const dsaTrackerController = new DsaTrackerController();
    apiV1Router.use('/dsa-tracker', dsaTrackerController.router);

    // OA Practice routes
    const oaPracticeController = new OaPracticeController();
    apiV1Router.use('/oa-practice', oaPracticeController.router);

    // Blogs routes
    const blogsController = new BlogsController();
    apiV1Router.use('/blogs', blogsController.router);

    // Announcements routes
    const announcementsController = new AnnouncementsController();
    apiV1Router.use('/announcements', announcementsController.router);

    // Admin Routes
    const recruiterNotesController = new RecruiterNotesController();
    apiV1Router.use('/recruiter-notes', recruiterNotesController.router);

    const tnpMembersController = new TnPMembersController();
    apiV1Router.use('/tnp-members', tnpMembersController.router);

    const studentReadinessController = new StudentReadinessController();
    apiV1Router.use('/student-readiness', studentReadinessController.router);

    const driveManagementController = new DriveManagementController();
    apiV1Router.use('/drives', driveManagementController.router);

    const offerManagementController = new OfferManagementController();
    apiV1Router.use('/offers', offerManagementController.router);

    const placementPoliciesController = new PlacementPoliciesController();
    apiV1Router.use('/placement-policies', placementPoliciesController.router);

    const blacklistController = new BlacklistController();
    apiV1Router.use('/blacklist', blacklistController.router);

    const oneOfferPolicyController = new OneOfferPolicyController();
    apiV1Router.use('/one-offer-policy', oneOfferPolicyController.router);

    const resumeBooksController = new ResumeBooksController();
    apiV1Router.use('/resume-books', resumeBooksController.router);

    // Image Upload routes
    const imageController = new ImageController();
    apiV1Router.use('/images', imageController.router);

    // Live Coding routes (if available)
    try {
      const { problemsRouter, roomsRouter, submissionsRouter, scorecardsRouter } = require('./api/routes/live-coding.routes');
      apiV1Router.use('/problems', problemsRouter);
      apiV1Router.use('/rooms', roomsRouter);
      apiV1Router.use('/submissions', submissionsRouter);
      apiV1Router.use('/scorecards', scorecardsRouter);
      logger.info('✅ Live Coding routes registered successfully');
    } catch (err) {
      logger.warn('⚠️ Live Coding routes error:', err);
    }

    // TODO: Add other module routes here
    // apiV1Router.use('/users', usersController.router);
    // apiV1Router.use('/students', studentsController.router);
    // apiV1Router.use('/jobs', jobsController.router);
    // apiV1Router.use('/applications', applicationsController.router);
    // ... etc

    // Mount both versioned and unversioned routes
    this.app.use('/api/v1', apiV1Router);
    this.app.use('/api', apiV1Router); // Unversioned API for client compatibility

    // GraphQL endpoint (TODO: implement)
    // this.app.use('/graphql', graphqlMiddleware);

    logger.info('Routes setup complete');
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);

    logger.info('Error handling setup complete');
  }

  /**
   * Start server
   */
  async start(): Promise<void> {
    try {
      // Initialize services before starting server
      if (!this.servicesInitialized) {
        await this.setupServices();
        this.servicesInitialized = true;
      }

      // Try to start server with retry logic
      await this.startServerWithRetry();
    } catch (error) {
      logger.fatal('Failed to start server', error);
      throw error;
    }
  }

  /**
   * Start server with retry logic for port binding
   */
  private async startServerWithRetry(attempt: number = 1, maxAttempts: number = 3): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = this.httpServer.listen(this.port, () => {
        logger.info(`🎮 Server running on port ${this.port}`);
        logger.info(`📡 Socket.IO listening on ws://localhost:${this.port}`);
        logger.info(`Environment: ${env.NODE_ENV}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
        logger.info(`Live Coding Health: http://localhost:${this.port}/api/v1/health/live-coding`);
        resolve();
      });

      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
          logger.warn(`Port ${this.port} is in use, retrying in 2 seconds... (attempt ${attempt}/${maxAttempts})`);
          setTimeout(() => {
            this.startServerWithRetry(attempt + 1, maxAttempts).then(resolve).catch(reject);
          }, 2000);
        } else if (err.code === 'EADDRINUSE') {
          logger.error(`Port ${this.port} is still in use after ${maxAttempts} attempts`);
          logger.info('Try one of the following:');
          logger.info(`  1. Kill the process using port ${this.port}:`);
          logger.info(`     Windows: netstat -ano | findstr :${this.port} && taskkill /PID <PID> /F`);
          logger.info(`     macOS/Linux: lsof -ti :${this.port} | xargs kill -9`);
          logger.info(`  2. Change the PORT environment variable`);
          reject(err);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   * Get Express app instance
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      logger.info('Shutting down gracefully...');

      // Close database connection
      await DatabaseService.closeConnection();

      // Close cache connection
      await CacheService.close();

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.fatal('Graceful shutdown failed', error);
      process.exit(1);
    }
  }
}

/**
 * Create and export app instance
 */
export const createApp = async (): Promise<App> => {
  return new App();
};

export default App;

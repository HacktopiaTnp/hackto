import { Router, Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { authMiddleware } from '@api/middleware/auth.middleware';
import { authRateLimiter, resetAuthAttempts } from '@api/middleware/logging.middleware';
import { asyncHandler } from '@api/middleware/error.middleware';
import { handleValidationErrors, validateEmail, validatePassword, validateString } from '@api/middleware/validation.middleware';

/**
 * Auth Controller
 * Handles user authentication endpoints
 */
export class AuthController {
  private authService: AuthService;
  public router: Router;

  constructor() {
    this.authService = new AuthService();
    this.router = Router();
    this.registerRoutes();
  }

  /**
   * Register routes
   */
  private registerRoutes(): void {
    // Public routes
    this.router.post(
      '/register',
      authRateLimiter,
      validateEmail(),
      validatePassword(),
      validateString('first_name', { min: 2, max: 100 }),
      validateString('last_name', { min: 2, max: 100 }),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.register(req, res, next)),
    );

    this.router.post(
      '/login',
      authRateLimiter,
      validateEmail(),
      body('password').notEmpty().withMessage('Password is required'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.login(req, res, next)),
    );

    this.router.post(
      '/refresh-token',
      body('refreshToken').notEmpty().withMessage('Refresh token is required'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.refreshToken(req, res, next)),
    );

    this.router.post(
      '/password-reset-request',
      authRateLimiter,
      validateEmail(),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.requestPasswordReset(req, res, next)),
    );

    this.router.post(
      '/password-reset',
      authRateLimiter,
      body('code').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Invalid reset code'),
      validatePassword(),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.resetPassword(req, res, next)),
    );

    // Protected routes
    this.router.post(
      '/logout',
      authMiddleware,
      asyncHandler((req, res, next) => this.logout(req, res, next)),
    );

    this.router.post(
      '/change-password',
      authMiddleware,
      body('currentPassword').notEmpty().withMessage('Current password is required'),
      validatePassword('newPassword'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.changePassword(req, res, next)),
    );

    // MFA routes
    this.router.post(
      '/mfa/enable',
      authMiddleware,
      asyncHandler((req, res, next) => this.enableMFA(req, res, next)),
    );

    this.router.post(
      '/mfa/verify',
      authMiddleware,
      body('code').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Invalid MFA code'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.verifyMFA(req, res, next)),
    );

    this.router.post(
      '/mfa/disable',
      authMiddleware,
      body('password').notEmpty().withMessage('Password is required'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.disableMFA(req, res, next)),
    );

    // Verify email
    this.router.post(
      '/verify-email',
      authMiddleware,
      body('code').notEmpty().isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
      handleValidationErrors,
      asyncHandler((req, res, next) => this.verifyEmail(req, res, next)),
    );
  }

  /**
   * Register
   */
  private async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.body.tenant_id || req.headers['x-tenant-id'];

      if (!tenantId) {
        res.status(400).json({
          error: {
            message: 'Tenant ID is required',
            code: 'MISSING_TENANT_ID',
            statusCode: 400,
          },
        });
        return;
      }

      await this.authService.initialize();

      const { user, accessToken, refreshToken } = await this.authService.register({
        email: req.body.email,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        role: req.body.role || 'student',
        tenant_id: tenantId,
      });

      res.status(201).json({
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login
   */
  private async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'];

      if (!tenantId) {
        res.status(400).json({
          error: {
            message: 'Tenant ID is required',
            code: 'MISSING_TENANT_ID',
            statusCode: 400,
          },
        });
        return;
      }

      await this.authService.initialize();

      const { user, accessToken, refreshToken } = await this.authService.login(
        req.body.email,
        req.body.password,
        tenantId as string,
      );

      // Reset auth attempts on successful login
      await resetAuthAttempts(req.body.email);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      const responseData: any = {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status,
        },
        accessToken,
      };

      // Include MFA requirement if enabled
      if (user.mfa_enabled) {
        responseData.mfaRequired = true;
        responseData.message = 'MFA code required';
      }

      res.status(200).json({
        message: 'Logged in successfully',
        data: responseData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh Token
   */
  private async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      const newAccessToken = await this.authService.refreshToken(req.body.refreshToken, req.body.userId);

      res.status(200).json({
        message: 'Token refreshed',
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout
   */
  private async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      await this.authService.logout(req.user!.id);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change Password
   */
  private async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      await this.authService.changePassword(req.user!.id, req.user!.tenant_id, req.body.currentPassword, req.body.newPassword);

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request Password Reset
   */
  private async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.headers['x-tenant-id'];

      if (!tenantId) {
        res.status(400).json({
          error: {
            message: 'Tenant ID is required',
            code: 'MISSING_TENANT_ID',
            statusCode: 400,
          },
        });
        return;
      }

      await this.authService.initialize();

      await this.authService.requestPasswordReset(req.body.email, tenantId as string);

      res.status(200).json({
        message: 'Password reset code sent to email',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset Password
   */
  private async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      await this.authService.resetPassword(req.body.userId, req.user?.tenant_id || req.body.tenant_id, req.body.code, req.body.newPassword);

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable MFA
   */
  private async enableMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      const { secret, qrCode } = await this.authService.enableMFA(req.user!.id, req.user!.tenant_id);

      res.status(200).json({
        message: 'MFA setup initiated',
        data: {
          secret,
          qrCode,
          instructions: 'Scan the QR code with authenticator app and verify with 6-digit code',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify MFA
   */
  private async verifyMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      const { backupCodes } = await this.authService.verifyMFA(req.user!.id, req.user!.tenant_id, req.body.code);

      res.status(200).json({
        message: 'MFA enabled successfully',
        data: {
          backupCodes,
          warning: 'Save these backup codes in a safe place. You can use them to login if you lose access to authenticator.',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable MFA
   */
  private async disableMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.authService.initialize();

      await this.authService.disableMFA(req.user!.id, req.user!.tenant_id, req.body.password);

      res.status(200).json({
        message: 'MFA disabled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Email
   */
  private async verifyEmail(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // TODO: Implement email verification logic
      res.status(200).json({
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;

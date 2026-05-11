import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '@config/env';
import { logger } from '@core/logger/logger';
import { UnauthorizedError } from '@utils/errors';

/**
 * Extend Express Request to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenant_id: string;
        email: string;
        role: string;
        permissions: string[];
      };
      token?: string;
    }
  }
}

/**
 * JWT Payload Interface
 */
export interface JWTPayload {
  id: string;
  tenant_id: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

/**
 * Authentication Middleware
 * Validates JWT token and attaches user to request
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET as any) as JWTPayload;

    // Ensure token is access token
    if (decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    req.user = {
      id: decoded.id,
      tenant_id: decoded.tenant_id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };

    req.token = token;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired', { message: error.message });
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token', { message: error.message });
      res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof UnauthorizedError) {
      res.status(401).json({ error: error.message });
    } else {
      logger.error('Auth middleware error', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

/**
 * Optional Authentication Middleware
 * Attempts to validate token but doesn't fail if missing
 */
export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractToken(req);

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET as any) as JWTPayload;

      if (decoded.type === 'access') {
        req.user = {
          id: decoded.id,
          tenant_id: decoded.tenant_id,
          email: decoded.email,
          role: decoded.role,
          permissions: decoded.permissions || [],
        };
        req.token = token;
      }
    }
  } catch (error) {
    logger.debug('Optional auth failed', error);
    // Continue even if auth fails
  }

  next();
};

/**
 * Role-Based Access Control (RBAC)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Role check failed', {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
      });

      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Permission-Based Access Control
 */
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const hasPermission = permissions.some((perm) => req.user!.permissions.includes(perm));

    if (!hasPermission) {
      logger.warn('Permission check failed', {
        userId: req.user.id,
        userPermissions: req.user.permissions,
        requiredPermissions: permissions,
      });

      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Tenant Isolation Middleware
 * Ensures user can only access their own tenant data
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const tenantId = req.params.tenant_id || req.query.tenant_id;

  if (tenantId && tenantId !== req.user.tenant_id) {
    logger.warn('Tenant isolation violation', {
      userId: req.user.id,
      userTenant: req.user.tenant_id,
      requestedTenant: tenantId,
    });

    res.status(403).json({ error: 'Access denied to this tenant' });
    return;
  }

  // Set tenant_id for downstream middleware
  req.user.tenant_id = req.user.tenant_id || tenantId || '';

  next();
};

/**
 * Extract JWT token from request
 */
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie (for web clients)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Generate Access Token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRY,
      issuer: 'tnp-backend',
      audience: 'tnp-frontend',
    } as any,
  );
}

/**
 * Generate Refresh Token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>): string {
  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRY,
      issuer: 'tnp-backend',
      audience: 'tnp-frontend',
    } as any,
  );
}

/**
 * Verify Refresh Token and return payload
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as any) as JWTPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

export default authMiddleware;

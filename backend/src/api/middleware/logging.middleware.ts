import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '@core/logger/logger';
import { CacheService } from '@core/cache/CacheService';

/**
 * Request Logging Middleware
 * Logs HTTP requests with request ID, method, path, status, and duration
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID if not present
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.headers['x-request-id'] = requestId;

  // Record start time
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Capture original send method
  const originalSend = res.send.bind(res);

  res.send = function (data) {
    // Log response
    const duration = Date.now() - startTime;
    logger.info('Outgoing response', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });

    // Call original send
    return originalSend(data);
  };

  next();
};

/**
 * Rate Limiter Middleware
 * Limits requests per IP/user to prevent abuse
 */
export const rateLimiter = (
  windowSeconds: number = 60,
  maxRequests: number = 100,
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Use user ID if authenticated, otherwise use IP
      const identifier = req.user?.id || req.ip || req.socket.remoteAddress || 'unknown';
      const key = `rate-limit:${identifier}`;

      // Check if limit exceeded
      const isAllowed = await CacheService.checkRateLimit(key, maxRequests, windowSeconds);

      if (isAllowed) {
        next();
      } else {
        logger.warn('Rate limit exceeded', {
          identifier,
          path: req.path,
          method: req.method,
        });

        res.status(429).json({
          error: {
            message: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            timestamp: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      logger.error('Rate limiter error', error);
      next(); // Allow request on error
    }
  };
};

/**
 * Strict Rate Limiter
 * Tighter rate limiting for sensitive endpoints
 */
export const strictRateLimiter = (
  windowSeconds: number = 60,
  maxRequests: number = 5,
) => {
  return rateLimiter(windowSeconds, maxRequests);
};

/**
 * Auth Rate Limiter
 * Special rate limiter for authentication endpoints (login, register, etc.)
 * More restrictive and tracks failed attempts
 */
export const authRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identifier = req.body?.email || req.ip || 'unknown';
    const key = `auth-attempts:${identifier}`;
    const maxAttempts = 5;
    const windowSeconds = 900; // 15 minutes

    const attempts = await CacheService.increment(key, 1, windowSeconds);

    if (attempts > maxAttempts) {
      logger.warn('Auth rate limit exceeded', {
        identifier,
        path: req.path,
        attempts,
      });

      res.status(429).json({
        error: {
          message: 'Too many authentication attempts. Please try again later.',
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          statusCode: 429,
          timestamp: new Date().toISOString(),
          retryAfter: await CacheService.getTTL(key),
        },
      });

      return;
    }

    // Store attempts count for response
    (req as any).authAttempts = attempts;
    next();
  } catch (error) {
    logger.error('Auth rate limiter error', error);
    next();
  }
};

/**
 * Reset Auth Attempts (call this on successful login)
 */
export const resetAuthAttempts = async (email: string): Promise<void> => {
  try {
    const key = `auth-attempts:${email}`;
    await CacheService.delete(key);
  } catch (error) {
    logger.error('Failed to reset auth attempts', { email, error });
  }
};

/**
 * CORS Middleware
 * Handle Cross-Origin requests
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

  const origin = req.headers.origin as string;

  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
};

/**
 * Security Headers Middleware
 * Add security headers to responses
 */
export const securityHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // MIME type sniffing protection
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Request Size Limiter
 * Prevent payload bombs
 */
export const bodySizeLimit = (maxSizeMB: number = 10) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (contentLength > maxBytes) {
      logger.warn('Request body too large', {
        contentLength,
        maxBytes,
        path: req.path,
      });

      res.status(413).json({
        error: {
          message: `Request body too large (max ${maxSizeMB}MB)`,
          code: 'PAYLOAD_TOO_LARGE',
          statusCode: 413,
          timestamp: new Date().toISOString(),
        },
      });

      return;
    }

    next();
  };
};

/**
 * Response Compression Middleware
 * Compress responses above certain size
 */
export const compressionMiddleware = (_req: Request, _res: Response, next: NextFunction): void => {
  // This is typically handled by express.compress() middleware
  // But we can add custom logic here if needed
  next();
};

/**
 * User Agent Parser Middleware
 * Parse and validate user agent
 */
export const userAgentMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const userAgent = req.headers['user-agent'];

  if (!userAgent) {
    logger.warn('Missing user agent', {
      ip: req.ip,
      path: req.path,
    });
  }

  next();
};

export default {
  requestLogger,
  rateLimiter,
  strictRateLimiter,
  authRateLimiter,
  resetAuthAttempts,
  corsMiddleware,
  securityHeaders,
  bodySizeLimit,
  compressionMiddleware,
  userAgentMiddleware,
};

import { Request, Response, NextFunction } from 'express';
import { logger } from '@core/logger/logger';
import { AppError } from '@utils/errors';

/**
 * Error Response Interface
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    requestId?: string;
    details?: any;
  };
}

/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent error response
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] as string;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    logError('AppError', err, { requestId, userId: req.user?.id });

    const errorResponse: ErrorResponse = {
      error: {
        message: err.message,
        code: String(err.statusCode || 500),
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    if (process.env.NODE_ENV === 'development' && err.statusCode >= 500) {
      errorResponse.error.details = {
        stack: err.stack,
      };
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle Validation errors (e.g., from express-validator)
  if (err.array && typeof err.array === 'function') {
    logError('ValidationError', err, { requestId, userId: req.user?.id });

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        requestId,
        details: err.array(),
      },
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logError('JWTError', err, { requestId, userId: req.user?.id });

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(401).json(errorResponse);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    logError('TokenExpiredError', err, { requestId, userId: req.user?.id });

    const errorResponse: ErrorResponse = {
      error: {
        message: 'Token expired',
        code: 'TOKEN_EXPIRED',
        statusCode: 401,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(401).json(errorResponse);
    return;
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    handleDatabaseError(err, req, res, requestId);
    return;
  }

  // Handle Multer file upload errors
  if (err.name === 'MulterError') {
    logError('MulterError', err, { requestId, userId: req.user?.id });

    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large' : 'File upload error';

    const errorResponse: ErrorResponse = {
      error: {
        message,
        code: 'FILE_UPLOAD_ERROR',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Default: Internal Server Error
  logError('UnhandledError', err, { requestId, userId: req.user?.id });

  const errorResponse: ErrorResponse = {
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
  }

  res.status(500).json(errorResponse);
};

/**
 * Not Found Handler
 * Returns 404 for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = req.headers['x-request-id'] as string;

  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    requestId,
  });

  const errorResponse: ErrorResponse = {
    error: {
      message: `Route ${req.path} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  res.status(404).json(errorResponse);
};

/**
 * Async Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle Database Errors
 */
function handleDatabaseError(err: any, req: Request, res: Response, requestId: string): void {
  logError('DatabaseError', err, { requestId, userId: req.user?.id });

  // Duplicate key error
  if (err.code === '23505') {
    const errorResponse: ErrorResponse = {
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_ENTRY',
        statusCode: 409,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(409).json(errorResponse);
    return;
  }

  // Foreign key violation
  if (err.code === '23503') {
    const errorResponse: ErrorResponse = {
      error: {
        message: 'Referenced resource not found',
        code: 'FOREIGN_KEY_VIOLATION',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };

    res.status(400).json(errorResponse);
    return;
  }

  // Default database error
  const errorResponse: ErrorResponse = {
    error: {
      message: 'Database operation failed',
      code: 'DATABASE_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      requestId,
    },
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.details = {
      message: err.message,
      code: err.code,
    };
  }

  res.status(500).json(errorResponse);
}

/**
 * Log Error
 */
function logError(errorType: string, error: any, context?: any): void {
  if (error.statusCode && error.statusCode < 500) {
    logger.warn(errorType, {
      ...context,
      message: error.message,
      code: error.code || error.name,
    });
  } else {
    logger.error(errorType, error, context);
  }
}

export default errorHandler;

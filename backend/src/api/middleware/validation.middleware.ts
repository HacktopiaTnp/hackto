import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { logger } from '@core/logger/logger';

/**
 * Validation Middleware
 * Provides reusable validation chains for common fields
 */

/**
 * Validate email format
 */
export const validateEmail = (): ValidationChain => {
  return body('email').trim().toLowerCase().isEmail().withMessage('Invalid email format').normalizeEmail();
};

/**
 * Validate email in query or params
 */
export const validateEmailParam = (field: string = 'email'): ValidationChain => {
  return param(field).trim().toLowerCase().isEmail().withMessage('Invalid email format').normalizeEmail();
};

/**
 * Validate password strength
 * Requirements: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (field: string = 'password'): ValidationChain => {
  return body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character');
};

/**
 * Validate phone number
 */
export const validatePhone = (field: string = 'phone'): ValidationChain => {
  return body(field)
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format');
};

/**
 * Validate URL
 */
export const validateUrl = (field: string = 'url'): ValidationChain => {
  return body(field)
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid URL format');
};

/**
 * Validate UUID
 */
export const validateUUID = (field: string = 'id'): ValidationChain => {
  return param(field)
    .isUUID()
    .withMessage(`Invalid ${field} format`);
};

/**
 * Validate UUID in body
 */
export const validateUUIDBody = (field: string = 'id'): ValidationChain => {
  return body(field)
    .isUUID()
    .withMessage(`Invalid ${field} format`);
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (): ValidationChain[] => {
  return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    query('sort')
      .optional()
      .matches(/^[a-zA-Z_]+$/)
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc'),
  ];
};

/**
 * Validate string field
 */
export const validateString = (field: string, length?: { min?: number; max?: number }): ValidationChain => {
  let chain = body(field).trim().isString().withMessage(`${field} must be a string`);

  if (length?.min) {
    chain = chain.isLength({ min: length.min }).withMessage(`${field} must be at least ${length.min} characters`);
  }

  if (length?.max) {
    chain = chain.isLength({ max: length.max }).withMessage(`${field} must not exceed ${length.max} characters`);
  }

  return chain;
};

/**
 * Validate number field
 */
export const validateNumber = (field: string, min?: number, max?: number): ValidationChain => {
  let chain = body(field).isNumeric().withMessage(`${field} must be a number`);

  if (min !== undefined) {
    chain = chain.custom((value: any) => {
      if (Number(value) < min) {
        throw new Error(`${field} must be at least ${min}`);
      }
      return true;
    });
  }

  if (max !== undefined) {
    chain = chain.custom((value: any) => {
      if (Number(value) > max) {
        throw new Error(`${field} must not exceed ${max}`);
      }
      return true;
    });
  }

  return chain;
};

/**
 * Validate boolean field
 */
export const validateBoolean = (field: string): ValidationChain => {
  return body(field)
    .isBoolean()
    .withMessage(`${field} must be a boolean`)
    .toBoolean();
};

/**
 * Validate date field
 */
export const validateDate = (field: string): ValidationChain => {
  return body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`)
    .toDate();
};

/**
 * Validate enum field
 */
export const validateEnum = (field: string, allowedValues: string[]): ValidationChain => {
  return body(field)
    .isIn(allowedValues)
    .withMessage(`${field} must be one of: ${allowedValues.join(', ')}`);
};

/**
 * Validate array field
 */
export const validateArray = (field: string, minLength?: number, maxLength?: number): ValidationChain => {
  let chain = body(field)
    .isArray()
    .withMessage(`${field} must be an array`);

  if (minLength !== undefined) {
    chain = chain.custom((value) => {
      if (!Array.isArray(value) || value.length < minLength) {
        throw new Error(`${field} must have at least ${minLength} items`);
      }
      return true;
    });
  }

  if (maxLength !== undefined) {
    chain = chain.custom((value) => {
      if (!Array.isArray(value) || value.length > maxLength) {
        throw new Error(`${field} must not have more than ${maxLength} items`);
      }
      return true;
    });
  }

  return chain;
};

/**
 * Validation Result Handler Middleware
 * Must be called after all validators
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation errors', {
      path: req.path,
      method: req.method,
      errors: errors.array(),
    });

    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        details: errors.array(),
      },
    });

    return;
  }

  next();
};

/**
 * Combined validation chain wrapper
 * Usage: validate(validateEmail(), validatePassword(), ...)(req, res, next)
 */
export const validate = (...validators: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const validator of validators) {
      await validator.run(req);
    }
    handleValidationErrors(req, res, next);
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validateUUID,
  validatePagination,
  validateString,
  validateNumber,
  validateBoolean,
  validateDate,
  validateEnum,
  validateArray,
  handleValidationErrors,
  validate,
};

import { randomUUID } from 'crypto';

/**
 * UUID utilities
 */
export function generateUUID(): string {
  return randomUUID();
}

export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Device ID generation
 */
export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Session ID generation
 */
export function generateSessionId(): string {
  return `session_${randomUUID()}`;
}

/**
 * Token generation
 */
export function generateToken(length: number = 32): string {
  const { randomBytes } = require('crypto');
  return randomBytes(length).toString('hex');
}

/**
 * Pagination helpers
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export function parsePagination(query: any): PaginationParams {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 20;

  // Validate
  page = Math.max(1, page);
  limit = Math.min(100, Math.max(1, limit));

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * String utilities
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Date utilities
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function isExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Type guards
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

export function isStrongPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

/**
 * Object utilities
 */
export function omit<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result = {} as Partial<T>;
  keys.forEach(key => {
    if (key in obj) {
      result[key as keyof T] = obj[key];
    }
  });
  return result;
}

/**
 * Array utilities
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Validation utilities
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validatePhone(phone: string): boolean {
  const regex = /^[0-9\s\-\+\(\)]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

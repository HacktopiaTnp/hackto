# Security Implementation Guide

## RBAC (Role-Based Access Control)

```typescript
// src/security/rbac.service.ts
import { User } from '@modules/users/entities/User.entity';

export enum Role {
  STUDENT = 'STUDENT',
  RECRUITER = 'RECRUITER',
  TnP_ADMIN = 'TnP_ADMIN',
  TnP_COORDINATOR = 'TnP_COORDINATOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

// Permission matrix
export const PERMISSIONS_BY_ROLE: Record<Role, Set<string>> = {
  [Role.STUDENT]: new Set([
    'read:own_profile',
    'edit:own_profile',
    'read:own_applications',
    'create:application',
    'withdraw:application',
    'read:own_offers',
    'accept:offer',
    'reject:offer',
    'read:jobs',
    'search:jobs',
    'read:own_resume',
    'upload:resume',
    'read:recommendations',
    'view:interview_feedback',
  ]),

  [Role.RECRUITER]: new Set([
    'read:profile',
    'edit:profile',
    'create:job',
    'edit:own_jobs',
    'close:own_jobs',
    'read:own_applications',
    'shortlist:application',
    'reject:application',
    'schedule:interview',
    'submit:feedback',
    'create:offer',
    'read:company_stats',
  ]),

  [Role.TnP_COORDINATOR]: new Set([
    'read:students',
    'edit:students',
    'read:jobs',
    'read:applications',
    'read:offers',
    'verify:documents',
    'update:eligibility',
    'read:reports',
    'export:data',
  ]),

  [Role.TnP_ADMIN]: new Set([
    // All basic permissions
    ...new Set([...Array.from(new Set(['read:*', 'edit:*', 'delete:*']))]),
    'create:policy',
    'edit:policies',
    'delete:policies',
    'manage:drives',
    'manage:roles',
    'create:user',
    'edit:user',
    'block:user',
    'unblock:user',
    'view:audit_logs',
    'export:analytics',
    'configure:system',
  ]),

  [Role.SUPER_ADMIN]: new Set(['*']),
};

export class RBACService {
  hasPermission(user: User, permission: string): boolean {
    const role = user.role as Role;
    const permissions = PERMISSIONS_BY_ROLE[role];

    if (!permissions) return false;
    if (permissions.has('*')) return true;
    if (permissions.has(permission)) return true;

    // Wildcard matching (e.g., read:* matches read:profile)
    const parts = permission.split(':');
    if (permissions.has(`${parts[0]}:*`)) return true;

    return false;
  }

  hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(user, perm));
  }

  hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(perm => this.hasPermission(user, perm));
  }

  getPermissions(user: User): string[] {
    const role = user.role as Role;
    return Array.from(PERMISSIONS_BY_ROLE[role] || []);
  }
}
```

## ABAC (Attribute-Based Access Control)

```typescript
// src/security/abac.service.ts
export interface AccessContext {
  user: User;
  resource: any;
  action: string;
  environment: {
    ipAddress: string;
    timestamp: Date;
    deviceId: string;
  };
}

export interface ABACPolicy {
  id: string;
  name: string;
  rules: ABACRule[];
  effect: 'ALLOW' | 'DENY';
}

export interface ABACRule {
  attribute: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in' | 'matches';
  value: any;
}

export class ABACService {
  private policies: Map<string, ABACPolicy> = new Map();

  // Initialize TNP-specific policies
  initializePolicies() {
    this.addPolicy({
      id: 'tnp_admin_full_access',
      name: 'T&P Admin Full Access',
      effect: 'ALLOW',
      rules: [
        { attribute: 'user.role', operator: 'equals', value: 'TnP_ADMIN' },
      ],
    });

    this.addPolicy({
      id: 'recruiter_company_view',
      name: 'Recruiter can only view own company',
      effect: 'ALLOW',
      rules: [
        { attribute: 'user.role', operator: 'equals', value: 'RECRUITER' },
        { attribute: 'resource.company_id', operator: 'equals', value: 'user.company_id' },
      ],
    });

    this.addPolicy({
      id: 'student_access_own_profile',
      name: 'Student can only access own profile',
      effect: 'ALLOW',
      rules: [
        { attribute: 'user.role', operator: 'equals', value: 'STUDENT' },
        { attribute: 'resource.user_id', operator: 'equals', value: 'user.id' },
        { attribute: 'action', operator: 'in', value: ['read', 'edit'] },
      ],
    });

    this.addPolicy({
      id: 'office_hours_restriction',
      name: 'Admins can only modify during office hours',
      effect: 'ALLOW',
      rules: [
        { attribute: 'user.role', operator: 'equals', value: 'TnP_COORDINATOR' },
        { attribute: 'action', operator: 'equals', value: 'edit' },
        { attribute: 'environment.timestamp', operator: 'matches', value: 'office_hours' },
      ],
    });

    this.addPolicy({
      id: 'ip_allowlist',
      name: 'Admin access only from allowlisted IPs',
      effect: 'DENY',
      rules: [
        { attribute: 'user.role', operator: 'in', value: ['TnP_ADMIN', 'TnP_COORDINATOR'] },
        { attribute: 'environment.ipAddress', operator: 'matches', value: 'allowlist' },
      ],
    });
  }

  private addPolicy(policy: ABACPolicy) {
    this.policies.set(policy.id, policy);
  }

  async evaluate(context: AccessContext): Promise<boolean> {
    for (const [, policy] of this.policies) {
      const matches = this.evaluateRules(context, policy.rules);
      
      if (matches) {
        if (policy.effect === 'DENY') return false;
        if (policy.effect === 'ALLOW') return true;
      }
    }

    // Default deny
    return false;
  }

  private evaluateRules(context: AccessContext, rules: ABACRule[]): boolean {
    return rules.every(rule => this.evaluateRule(context, rule));
  }

  private evaluateRule(context: AccessContext, rule: ABACRule): boolean {
    const value = this.resolveAttribute(context, rule.attribute);

    switch (rule.operator) {
      case 'equals':
        return value === rule.value;
      case 'contains':
        return Array.isArray(value) && value.includes(rule.value);
      case 'greaterThan':
        return value > rule.value;
      case 'lessThan':
        return value < rule.value;
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(value);
      case 'matches':
        return this.matchPattern(value, rule.value);
      default:
        return false;
    }
  }

  private resolveAttribute(context: AccessContext, attribute: string): any {
    const [subject, ...path] = attribute.split('.');
    let value: any;

    if (subject === 'user') {
      value = context.user;
    } else if (subject === 'resource') {
      value = context.resource;
    } else if (subject === 'action') {
      value = context.action;
    } else if (subject === 'environment') {
      value = context.environment;
    }

    for (const key of path) {
      value = value?.[key];
    }

    return value;
  }

  private matchPattern(value: any, pattern: string): boolean {
    // Check office hours
    if (pattern === 'office_hours') {
      const hour = value.getHours();
      return hour >= 9 && hour <= 18;
    }

    // Check IP allowlist
    if (pattern === 'allowlist') {
      const whitelist = process.env.ADMIN_IP_ALLOWLIST?.split(',') || [];
      return whitelist.includes(value);
    }

    // Regex matching
    try {
      const regex = new RegExp(pattern);
      return regex.test(String(value));
    } catch {
      return false;
    }
  }
}
```

## Device & Session Management

```typescript
// src/security/session.service.ts
export interface DeviceSession {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  lastActiveAt: Date;
  createdAt: Date;
}

export class SessionService {
  async trackDevice(userId: string, deviceInfo: any): Promise<DeviceSession> {
    const session: DeviceSession = {
      sessionId: generateUUID(),
      deviceId: deviceInfo.id || generateDeviceId(),
      deviceName: deviceInfo.name || 'Unknown Device',
      userAgent: deviceInfo.userAgent,
      ipAddress: deviceInfo.ipAddress,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };

    // Store in Redis (7-day TTL)
    await redisClient.setex(
      `device:${userId}:${session.deviceId}`,
      7 * 24 * 60 * 60,
      JSON.stringify(session),
    );

    // Track in DB for audit
    await DeviceAuditLog.create({
      userId,
      ...session,
    });

    return session;
  }

  async validateSession(
    userId: string,
    sessionId: string,
    deviceId: string,
  ): Promise<boolean> {
    const session = await redisClient.get(`device:${userId}:${deviceId}`);
    if (!session) return false;

    const parsed = JSON.parse(session);
    return parsed.sessionId === sessionId;
  }

  async revokeSession(userId: string, deviceId: string): Promise<void> {
    await redisClient.del(`device:${userId}:${deviceId}`);
  }

  async revokeAllSessions(userId: string): Promise<void> {
    const keys = await redisClient.keys(`device:${userId}:*`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }

  async getActiveSessions(userId: string): Promise<DeviceSession[]> {
    const keys = await redisClient.keys(`device:${userId}:*`);
    const sessions = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      if (data) sessions.push(JSON.parse(data));
    }

    return sessions;
  }
}
```

## Encryption & Hashing

```typescript
// src/security/encryption.service.ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export class EncryptionService {
  // Password hashing
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Symmetric encryption for sensitive data
  encryptField(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
      iv,
    );

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
  }

  decryptField(encrypted: string): string {
    const [ivHex, cipher, authTagHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
      iv,
    );

    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(cipher, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Generate secure tokens
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash for comparisons (non-reversible)
  hashValue(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }
}
```

## Audit Logging

```typescript
// src/security/audit.service.ts
export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, { before: any; after: any }>;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILURE';
  errorMessage?: string;
  timestamp: Date;
}

export class AuditService {
  async log(
    userId: string,
    action: string,
    resource: { type: string; id: string },
    changes?: Record<string, { before: any; after: any }>,
    context?: { ipAddress: string; userAgent: string; status: string; error?: string },
  ): Promise<void> {
    const auditLog: AuditLog = {
      id: generateUUID(),
      tenantId: getCurrentTenantContext(),
      userId,
      action,
      resourceType: resource.type,
      resourceId: resource.id,
      changes: changes || {},
      ipAddress: context?.ipAddress || '',
      userAgent: context?.userAgent || '',
      status: (context?.status || 'SUCCESS') as 'SUCCESS' | 'FAILURE',
      errorMessage: context?.error,
      timestamp: new Date(),
    };

    // Store in database
    await AuditLogEntity.create(auditLog);

    // Also log to centralized logging (Loki/Sentry)
    logger.info(auditLog, 'Audit log');

    // Publish event for real-time alerting
    if (auditLog.status === 'FAILURE') {
      await publishEvent({
        type: 'audit.failure',
        payload: auditLog,
        tenantId: auditLog.tenantId,
      });
    }
  }

  async getAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: { page: number; limit: number },
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const query = AuditLogEntity.buildQuery(filters);
    const [logs, total] = await query
      .offset((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .getManyAndCount();

    return { logs, total };
  }
}
```

## CSRF Protection

```typescript
// src/api/rest/middleware/csrf.ts
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

const csrfProtection = csrf({ cookie: false });

export function csrfMiddleware(req, res, next) {
  csrfProtection(req, res, (error) => {
    if (error) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }

    // Generate token if not exists
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    next();
  });
}

export function verifyCsrf(req, res, next) {
  csrfProtection(req, res, (error) => {
    if (error) {
      return res.status(403).json({ error: 'Invalid CSRF token' });
    }
    next();
  });
}
```

## CORS Configuration

```typescript
// src/api/rest/middleware/cors.ts
export const corsConfig = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};
```

## Security Headers

```typescript
// src/api/rest/middleware/securityHeaders.ts
import helmet from 'helmet';

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});
```

## MFA Setup (TOTP)

```typescript
// src/security/mfa.service.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  async generateSecret(userEmail: string): Promise<{ secret: string; qrCode: string }> {
    const secret = speakeasy.generateSecret({
      name: `TnP Portal (${userEmail})`,
      issuer: 'TnP Portal',
      length: 32,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time windows
    });
  }

  async generateBackupCodes(count: number = 10): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }
}
```

## Rate Limiting for Security

```typescript
// src/security/rate-limit.service.ts
export class RateLimitService {
  // Brute force protection
  async checkLoginAttempts(
    email: string,
    ipAddress: string,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `login_attempts:${email}:${ipAddress}`;
    const attempts = await redisClient.incr(key);

    if (attempts === 1) {
      // Set 15-minute expiry on first attempt
      await redisClient.expire(key, 15 * 60);
    }

    const allowed = attempts <= 5;
    const remaining = Math.max(0, 5 - attempts);

    if (!allowed) {
      // Log failed attempt
      await auditService.log(
        'unknown',
        'failed_login_attempts',
        { type: 'user', id: email },
        undefined,
        { ipAddress, userAgent: '', status: 'FAILURE', error: 'Too many attempts' },
      );
    }

    return { allowed, remaining };
  }

  async clearLoginAttempts(email: string, ipAddress: string): Promise<void> {
    const key = `login_attempts:${email}:${ipAddress}`;
    await redisClient.del(key);
  }
}
```

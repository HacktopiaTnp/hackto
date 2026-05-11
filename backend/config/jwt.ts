import jwt from 'jsonwebtoken';
import env from './env';

/**
 * JWT Configuration & Token Management
 * - Access tokens (15 minutes)
 * - Refresh tokens (7 days)
 * - Token rotation & device tracking
 */

export interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  email: string;
  type: 'access' | 'refresh';
  sessionId: string;
  deviceId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate JWT Access Token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  const tokenPayload: JWTPayload = {
    ...payload,
    type: 'access',
  };

  return jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
    issuer: 'tnp-backend',
    audience: 'tnp-frontend',
  });
}

/**
 * Generate JWT Refresh Token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  const tokenPayload: JWTPayload = {
    ...payload,
    type: 'refresh',
  };

  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
    issuer: 'tnp-backend',
    audience: 'tnp-frontend',
  });
}

/**
 * Generate Both Tokens (for login)
 */
export function generateTokenPair(payload: Omit<JWTPayload, 'type'>): TokenPair {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Extract expiry from token
  const decoded = jwt.decode(accessToken) as any;

  return {
    accessToken,
    refreshToken,
    expiresIn: decoded.exp * 1000 - Date.now(),
  };
}

/**
 * Verify Access Token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'tnp-backend',
      audience: 'tnp-frontend',
    });

    if ((decoded as JWTPayload).type !== 'access') {
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'tnp-backend',
      audience: 'tnp-frontend',
    });

    if ((decoded as JWTPayload).type !== 'refresh') {
      return null;
    }

    return decoded as JWTPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

/**
 * Decode Token Without Verification
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  return decoded.exp * 1000 < Date.now();
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Device & Session Management
 */
export interface DeviceSession {
  sessionId: string;
  deviceId: string;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  lastActiveSessoin: Date;
  createdAt: Date;
}

/**
 * Refresh token rotation (exchange old refresh token for new pair)
 * Mark old refresh token as revoked
 */
export async function rotateRefreshToken(
  oldRefreshToken: string,
  redisClient: any
): Promise<TokenPair | null> {
  const payload = verifyRefreshToken(oldRefreshToken);
  if (!payload) return null;

  // Mark old token as revoked
  const tokenKey = `revoked_token:${payload.sessionId}`;
  await redisClient.setex(tokenKey, 86400 * 7, '1'); // Keep for 7 days

  // Generate new pair
  return generateTokenPair({
    userId: payload.userId,
    tenantId: payload.tenantId,
    role: payload.role,
    permissions: payload.permissions,
    email: payload.email,
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
  });
}

/**
 * Check if token is revoked
 */
export async function isTokenRevoked(sessionId: string, redisClient: any): Promise<boolean> {
  const tokenKey = `revoked_token:${sessionId}`;
  const revoked = await redisClient.get(tokenKey);
  return revoked !== null;
}

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  rotateRefreshToken,
  isTokenRevoked,
};

import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: JwtPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Decode token without verification (useful for debugging)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Generate password reset token (expires in 1 hour)
 */
export const generatePasswordResetToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email, type: 'password-reset' }, JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};


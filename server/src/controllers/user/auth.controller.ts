import { Request, Response } from 'express';
import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateTokenPair, verifyRefreshToken, generatePasswordResetToken, verifyPasswordResetToken } from '../../utils/jwt';
import { UserRole } from '@prisma/client';
import logger from '../../utils/logger';

/**
 * Student Signup
 */
export const studentSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surname, otherNames, email, password, phone, gender, studentId, residence, hallOfResidence } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Check if student ID already exists
    const existingStudent = await prisma.user.findUnique({
      where: { studentId },
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: 'Student ID already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        surname,
        otherNames,
        phone,
        gender,
        studentId,
        residence,
        hallOfResidence,
      },
      select: {
        id: true,
        email: true,
        role: true,
        surname: true,
        otherNames: true,
        phone: true,
        gender: true,
        studentId: true,
        residence: true,
        hallOfResidence: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`New student registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Student signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Staff Signup
 */
export const staffSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surname, otherNames, email, password, phone, gender, staffId } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Check if staff ID already exists
    const existingStaff = await prisma.user.findUnique({
      where: { staffId },
    });

    if (existingStaff) {
      res.status(409).json({
        success: false,
        message: 'Staff ID already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.STAFF,
        surname,
        otherNames,
        phone,
        gender,
        staffId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        surname: true,
        otherNames: true,
        phone: true,
        gender: true,
        staffId: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`New staff registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Staff signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Public User Signup
 */
export const publicSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surname, otherNames, email, password, phone, gender } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: UserRole.PUBLIC,
        surname,
        otherNames,
        phone,
        gender,
      },
      select: {
        id: true,
        email: true,
        role: true,
        surname: true,
        otherNames: true,
        phone: true,
        gender: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`New public user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Public signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * Login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Refresh Token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
      return;
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`Token refreshed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
    });
  }
};

/**
 * Get Current User Profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        surname: true,
        otherNames: true,
        phone: true,
        gender: true,
        studentId: true,
        staffId: true,
        residence: true,
        hallOfResidence: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};

/**
 * Logout (client-side handles token removal, but we can log it)
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user) {
      logger.info(`User logged out: ${req.user.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * Forgot Password - Generate reset token
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken(user.id, user.email);

    // TODO: Send email with reset token
    // For now, we'll return the token in the response (in production, only send via email)
    logger.info(`Password reset requested for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
      // In production, remove this! Only send via email
      data: {
        resetToken, // This should ONLY be sent via email in production
      },
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset Password - Update password with reset token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    let decoded;
    try {
      decoded = verifyPasswordResetToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.email !== decoded.email) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info(`Password reset successful for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
    });
  }
};

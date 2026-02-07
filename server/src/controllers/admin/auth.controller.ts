import { Request, Response } from 'express';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAdminTokenPair, verifyAdminAccessToken,  } from '../../utils/jwt';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Admin Signup (Temporary - will be removed later)
export const adminSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { surname, otherNames, gender, email, password, isSuperAdmin } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin with this email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        surname,
        otherNames,
        gender,
        email,
        password: hashedPassword,
        isSuperAdmin: isSuperAdmin || false,
        permissions: [], // Empty array by default
      },
      select: {
        id: true,
        surname: true,
        otherNames: true,
        gender: true,
        email: true,
        isSuperAdmin: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const tokens = generateAdminTokenPair({
      userId: admin.id,
      email: admin.email,
      role: 'ADMIN',
    });

    logger.info(`Admin registered successfully: ${admin.email}`);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        admin,
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Admin Signup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin signup',
    });
  }
};

// Admin Login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, admin.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const tokens = generateAdminTokenPair({
      userId: admin.id,
      email: admin.email,
      role: 'ADMIN',
    });

    logger.info(`Admin logged in: ${admin.email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          surname: admin.surname,
          otherNames: admin.otherNames,
          gender: admin.gender,
          email: admin.email,
          isSuperAdmin: admin.isSuperAdmin,
          permissions: admin.permissions,
        },
        ...tokens,
      },
    });
  } catch (error) {
    logger.error('Admin Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login',
    });
  }
};

// Admin Refresh Token
export const adminRefreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyAdminAccessToken(refreshToken);
    } catch (error) {
      logger.error('Admin Refresh Token Verification Error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Verify admin still exists
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Generate new token pair
    const tokens = generateAdminTokenPair({
      userId: admin.id,
      email: admin.email,
      role: 'ADMIN',
    });

    logger.info(`Admin token refreshed: ${admin.email}`);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error) {
    logger.error('Admin Refresh Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
    });
  }
};

// Get Admin Profile
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;

    if (!adminId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        surname: true,
        otherNames: true,
        gender: true,
        email: true,
        isSuperAdmin: true,
        permissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    logger.error('Get Admin Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile',
    });
  }
};

// Admin Logout (Placeholder)
export const adminLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a production app, you might want to blacklist the token here
    // For now, just return success
    logger.info(`Admin logged out: ${req.user?.email || 'Unknown'}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Admin Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
    });
  }
};

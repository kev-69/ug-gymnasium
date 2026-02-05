import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Get All Users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    // Build filter
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          surname: true,
          otherNames: true,
          gender: true,
          email: true,
          role: true,
          isActive: true,
          studentId: true,
          staffId: true,
          residence: true,
          hallOfResidence: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subscriptions: true,
            },
          },
        },
        orderBy: [
          { isActive: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching users',
    });
  }
};

// Get User by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        surname: true,
        otherNames: true,
        gender: true,
        email: true,
        role: true,
        isActive: true,
        studentId: true,
        staffId: true,
        residence: true,
        hallOfResidence: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
              },
            },
            transactions: {
              select: {
                id: true,
                amount: true,
                paymentStatus: true,
                paymentMethod: true,
                paidAt: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
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
    logger.error('Get User By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user',
    });
  }
};

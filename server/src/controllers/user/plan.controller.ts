import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Get All Active Plans
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    // If user is logged in, filter by their role
    // If not logged in, show all active plans
    const plans = await prisma.plan.findMany({
      where: {
        isActive: true,
        ...(userRole ? { targetRole: userRole } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        targetRole: true,
        features: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { price: 'asc' },
      ],
    });

    res.status(200).json({
      success: true,
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    logger.error('Get All Plans Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching plans',
    });
  }
};

// Get Plan by ID
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const plan = await prisma.plan.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        targetRole: true,
        features: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    if (!plan.isActive) {
      res.status(404).json({
        success: false,
        message: 'Plan is no longer available',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Get Plan By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching plan',
    });
  }
};

import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Create Plan
export const createPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, price, duration, targetRole, features, isActive } = req.body;

    // Check if plan with same name exists
    const existingPlan = await prisma.plan.findFirst({
      where: { name },
    });

    if (existingPlan) {
      res.status(400).json({
        success: false,
        message: 'Plan with this name already exists',
      });
      return;
    }

    // Create plan
    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price,
        duration,
        targetRole,
        features,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    logger.info(`Plan created by admin ${req.user?.email}: ${plan.name}`);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: plan,
    });
  } catch (error) {
    logger.error('Create Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating plan',
    });
  }
};

// Get All Plans
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, targetRole } = req.query;

    // Build filter
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (targetRole) {
      where.targetRole = targetRole;
    }

    const plans = await prisma.plan.findMany({
      where,
      orderBy: [
        { isActive: 'desc' },
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
    const planId = req.params.id;

    const plan = await prisma.plan.findUnique({
      where: { id: planId as string },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
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

// Update Plan
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const planId = req.params.id;
    const updateData = req.body;

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId as string },
    });

    if (!existingPlan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== existingPlan.name) {
      const duplicateName = await prisma.plan.findFirst({
        where: {
          name: updateData.name,
          id: { not: planId as string },
        },
      });

      if (duplicateName) {
        res.status(400).json({
          success: false,
          message: 'Plan with this name already exists',
        });
        return;
      }
    }

    // Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: planId as string },
      data: updateData,
    });

    logger.info(`Plan updated by admin ${req.user?.email}: ${updatedPlan.name}`);

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully',
      data: updatedPlan,
    });
  } catch (error) {
    logger.error('Update Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating plan',
    });
  }
};

// Delete Plan
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: id as string },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    // Check if plan has active subscriptions
    if (plan._count.subscriptions > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete plan with ${plan._count.subscriptions} active subscription(s). Consider deactivating instead.`,
      });
      return;
    }

    // Delete plan
    await prisma.plan.delete({
      where: { id: id as string },
    });

    logger.info(`Plan deleted by admin ${req.user?.email}: ${plan.name}`);

    res.status(200).json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    logger.error('Delete Plan Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting plan',
    });
  }
};

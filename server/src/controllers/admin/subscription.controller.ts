import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Get All Subscriptions
export const getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionStatus, paymentStatus, userId, planId, page = 1, limit = 10 } = req.query;

    // Build filter
    const where: any = {};

    if (subscriptionStatus) {
      where.subscriptionStatus = subscriptionStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (userId) {
      where.userId = userId as string;
    }

    if (planId) {
      where.planId = planId as string;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Get subscriptions and total count
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              surname: true,
              otherNames: true,
              email: true,
              role: true,
              studentId: true,
              staffId: true,
              phone: true,
            },
          },
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
              description: true,
            },
          },
          transactions: {
            select: {
              id: true,
              amount: true,
              paymentStatus: true,
              paymentMethod: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get All Subscriptions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subscriptions',
    });
  }
};

// Get Subscription by ID
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            surname: true,
            otherNames: true,
            email: true,
            role: true,
            studentId: true,
            staffId: true,
            phone: true,
            gender: true,
            residence: true,
            hallOfResidence: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            description: true,
            features: true,
            targetRole: true,
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
            paymentMethod: true,
            paymentReference: true,
            paystackReference: true,
            paidAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    logger.error('Get Subscription by ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subscription',
    });
  }
};

// Update Subscription Status
export const updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { subscriptionStatus } = req.body;

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: id as string },
    });

    if (!existingSubscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
      return;
    }

    // Update subscription status
    const subscription = await prisma.subscription.update({
      where: { id: id as string },
      data: {
        subscriptionStatus,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            surname: true,
            otherNames: true,
            email: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
    });

    logger.info(`Subscription ${id} status updated to ${subscriptionStatus}`);

    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: subscription,
    });
  } catch (error) {
    logger.error('Update Subscription Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating subscription status',
    });
  }
};

// Get Subscription Statistics
export const getSubscriptionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      pendingSubscriptions,
      totalRevenue,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: { subscriptionStatus: 'ACTIVE' },
      }),
      prisma.subscription.count({
        where: { subscriptionStatus: 'EXPIRED' },
      }),
      prisma.subscription.count({
        where: { subscriptionStatus: 'CANCELLED' },
      }),
      prisma.subscription.count({
        where: { subscriptionStatus: 'PENDING' },
      }),
      prisma.transaction.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        expiredSubscriptions,
        cancelledSubscriptions,
        pendingSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    logger.error('Get Subscription Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subscription statistics',
    });
  }
};

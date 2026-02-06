import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';

// Create Subscription
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { planId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
      return;
    }

    if (!plan.isActive) {
      res.status(400).json({
        success: false,
        message: 'Plan is no longer active',
      });
      return;
    }

    // Check if user's role matches plan target role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (plan.targetRole !== user.role) {
      res.status(403).json({
        success: false,
        message: `This plan is only available for ${plan.targetRole} users`,
      });
      return;
    }

    // Check if user has an active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });

    if (activeSubscription) {
      res.status(400).json({
        success: false,
        message: 'You already have an active subscription. Please cancel it before subscribing to a new plan.',
      });
      return;
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        subscriptionStatus: SubscriptionStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: {
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

    // Generate payment reference
    const paymentReference = `PAY-${Date.now()}-${subscription.id.substring(0, 8)}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        paymentMethod: 'MOBILE_MONEY', // Default, will be updated by payment callback
        paymentReference,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    logger.info(`Subscription created for user ${user.email}: ${plan.name}`);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully. Please proceed to payment.',
      data: {
        subscription,
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          paymentReference: transaction.paymentReference,
          paymentStatus: transaction.paymentStatus,
        },
      },
    });
  } catch (error) {
    logger.error('Create Subscription Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating subscription',
    });
  }
};

// Get User Subscriptions
export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            features: true,
          },
        },
        transactions: {
          select: {
            id: true,
            amount: true,
            paymentStatus: true,
            paymentMethod: true,
            paymentReference: true,
            paidAt: true,
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
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    logger.error('Get User Subscriptions Error:', error);
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
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: id as string },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            features: true,
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

    // Verify the subscription belongs to the user
    if (subscription.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    logger.error('Get Subscription By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching subscription',
    });
  }
};


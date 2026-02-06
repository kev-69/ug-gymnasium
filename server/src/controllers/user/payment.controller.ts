import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize Payment
export const initializePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionId, paymentMethod } = req.body;
    const userId = req.user?.userId;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        subscription: {
          include: {
            plan: true,
            user: true,
          },
        },
      },
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }

    // Verify transaction belongs to user
    if (transaction.subscription.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
      });
      return;
    }

    // Check if transaction is already completed
    if (transaction.paymentStatus === PaymentStatus.COMPLETED) {
      res.status(400).json({
        success: false,
        message: 'Payment has already been completed',
      });
      return;
    }

    // Update payment method
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentMethod },
    });

    // For mobile money and card, initialize Paystack payment
    try {
      const paystackResponse = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: userEmail,
          amount: Math.round(transaction.amount * 100), // Convert to kobo/pesewas
          reference: transaction.paymentReference,
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
          metadata: {
            transactionId: transaction.id,
            subscriptionId: transaction.subscriptionId,
            userId,
            planName: transaction.subscription.plan.name,
          },
          channels: paymentMethod === 'MOBILE_MONEY' ? ['mobile_money'] : ['card'],
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (paystackResponse.data.status) {
        logger.info(`Payment initialized for transaction ${transaction.id}`);

        res.status(200).json({
          success: true,
          message: 'Payment initialized successfully',
          data: {
            authorizationUrl: paystackResponse.data.data.authorization_url,
            accessCode: paystackResponse.data.data.access_code,
            reference: paystackResponse.data.data.reference,
          },
        });
      } else {
        throw new Error('Paystack initialization failed');
      }
    } catch (paystackError: any) {
      logger.error('Paystack Initialization Error:', paystackError.response?.data || paystackError);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize payment with Paystack',
        error: paystackError.response?.data?.message || 'Payment gateway error',
      });
    }
  } catch (error) {
    logger.error('Initialize Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while initializing payment',
    });
  }
};

// Verify Payment
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Verify with Paystack
    try {
      const paystackResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      if (paystackResponse.data.status && paystackResponse.data.data.status === 'success') {
        const paystackData = paystackResponse.data.data;

        // Get transaction by reference
        const transaction = await prisma.transaction.findUnique({
          where: { paymentReference: reference as string },
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        });

        if (!transaction) {
          res.status(404).json({
            success: false,
            message: 'Transaction not found',
          });
          return;
        }

        // Verify transaction belongs to user
        if (transaction.subscription.userId !== userId) {
          res.status(403).json({
            success: false,
            message: 'Access denied',
          });
          return;
        }

        // Update transaction
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paystackReference: paystackData.reference,
            paidAt: new Date(),
            metadata: paystackData,
          },
        });

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + transaction.subscription.plan.duration);

        // Update subscription
        await prisma.subscription.update({
          where: { id: transaction.subscriptionId },
          data: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            paymentStatus: PaymentStatus.COMPLETED,
            startDate,
            endDate,
          },
        });

        logger.info(`Payment verified and subscription activated: ${transaction.id}`);

        res.status(200).json({
          success: true,
          message: 'Payment verified and subscription activated',
          data: {
            transaction: updatedTransaction,
            subscription: {
              status: SubscriptionStatus.ACTIVE,
              startDate,
              endDate,
            },
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Payment verification failed',
        });
      }
    } catch (paystackError: any) {
      logger.error('Paystack Verification Error:', paystackError.response?.data || paystackError);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment with Paystack',
        error: paystackError.response?.data?.message || 'Payment gateway error',
      });
    }
  } catch (error) {
    logger.error('Verify Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying payment',
    });
  }
};

// Paystack Webhook Handler
export const handlePaystackWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = PAYSTACK_SECRET_KEY;
    const hash = req.headers['x-paystack-signature'];

    if (!hash) {
      res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
      return;
    }

    // Verify webhook signature
    const crypto = require('crypto');
    const expectedHash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== expectedHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid webhook signature',
      });
      return;
    }

    const event = req.body;

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      const transaction = await prisma.transaction.findUnique({
        where: { paymentReference: reference },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
        },
      });

      if (transaction && transaction.paymentStatus !== PaymentStatus.COMPLETED) {
        // Update transaction
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            paystackReference: reference,
            paidAt: new Date(),
            metadata: event.data,
          },
        });

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + transaction.subscription.plan.duration);

        // Update subscription
        await prisma.subscription.update({
          where: { id: transaction.subscriptionId },
          data: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            paymentStatus: PaymentStatus.COMPLETED,
            startDate,
            endDate,
          },
        });

        logger.info(`Webhook: Payment completed for transaction ${transaction.id}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook received',
    });
  } catch (error) {
    logger.error('Paystack Webhook Error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

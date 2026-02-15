import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../utils/logger';
import { PaymentStatus, SubscriptionStatus } from '@prisma/client';

/**
 * Cleanup Abandoned Payments Job
 * Runs every 15 minutes to mark abandoned pending payments as failed
 */
export const startPaymentCleanupJob = () => {
  // Run every 15 minutes: */15 * * * *
  // For testing, you can use: * * * * * (every minute)
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running payment cleanup job...');

      // Payment timeout in minutes (default: 30 minutes)
      const timeoutMinutes = parseInt(process.env.PAYMENT_TIMEOUT_MINUTES || '30');
      const timeoutDate = new Date();
      timeoutDate.setMinutes(timeoutDate.getMinutes() - timeoutMinutes);

      // Find all pending transactions older than timeout
      const abandonedTransactions = await prisma.transaction.findMany({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          createdAt: {
            lt: timeoutDate, // Less than (older than) timeout date
          },
        },
        include: {
          subscription: true,
        },
      });

      if (abandonedTransactions.length === 0) {
        logger.info('Payment cleanup: No abandoned payments found');
        return;
      }

      // Update all abandoned transactions to FAILED
      const failedCount = await prisma.$transaction(async (tx) => {
        let count = 0;

        for (const transaction of abandonedTransactions) {
          // Update transaction
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              paymentStatus: PaymentStatus.FAILED,
            },
          });

          // Update subscription
          await tx.subscription.update({
            where: { id: transaction.subscriptionId },
            data: {
              subscriptionStatus: SubscriptionStatus.EXPIRED,
              paymentStatus: PaymentStatus.FAILED,
            },
          });

          count++;
        }

        return count;
      });

      logger.info(`Payment cleanup: Marked ${failedCount} abandoned payment(s) as FAILED`);
    } catch (error) {
      logger.error('Payment cleanup job error:', error);
    }
  });

  logger.info('Payment cleanup job scheduled (runs every 15 minutes)');
};

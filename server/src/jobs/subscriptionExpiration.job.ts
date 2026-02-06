import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../utils/logger';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Cron job to automatically expire subscriptions
 * Runs every hour to check for expired subscriptions
 */
export const startSubscriptionExpirationJob = () => {
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running subscription expiration check...');

      const now = new Date();

      // Find all active subscriptions with endDate in the past
      const expiredSubscriptions = await prisma.subscription.updateMany({
        where: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          endDate: {
            lt: now,
          },
        },
        data: {
          subscriptionStatus: SubscriptionStatus.EXPIRED,
        },
      });

      if (expiredSubscriptions.count > 0) {
        logger.info(`✅ Expired ${expiredSubscriptions.count} subscription(s)`);
      } else {
        logger.info('No subscriptions to expire');
      }
    } catch (error) {
      logger.error('Subscription expiration job error:', error);
    }
  });

  logger.info('⏰ Subscription expiration cron job started (runs hourly)');
};

/**
 * Manual function to expire subscriptions
 * Can be called directly if needed
 */
export const expireSubscriptions = async (): Promise<number> => {
  try {
    const now = new Date();

    const result = await prisma.subscription.updateMany({
      where: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
      data: {
        subscriptionStatus: SubscriptionStatus.EXPIRED,
      },
    });

    logger.info(`Manually expired ${result.count} subscription(s)`);
    return result.count;
  } catch (error) {
    logger.error('Manual subscription expiration error:', error);
    throw error;
  }
};

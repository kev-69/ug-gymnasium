import cron from 'node-cron';
import prisma from '../config/database';
import logger from '../utils/logger';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import emailService from '../utils/email';

type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{
  include: { user: true; plan: true };
}>;

// Days before expiration to send warning email (configurable via env)
const EXPIRATION_WARNING_DAYS = parseInt(process.env.EXPIRATION_WARNING_DAYS || '2');

/**
 * Cron job to handle subscription expiration and send notification emails
 * Runs daily at midnight to check for:
 * 1. Subscriptions expiring soon (send warning)
 * 2. Expired subscriptions (update status and send notification)
 */
export const startSubscriptionExpirationJob = () => {
  // Run daily at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running subscription expiration and notification check...');

      await sendExpirationWarnings();
      await expireSubscriptionsAndNotify();
      
      logger.info('Subscription expiration check completed');
    } catch (error) {
      logger.error('Subscription expiration job error:', error);
    }
  });

  logger.info(`⏰ Subscription expiration cron job started (runs daily at midnight)`);
  logger.info(`📧 Expiration warnings will be sent ${EXPIRATION_WARNING_DAYS} days before expiration`);
};

/**
 * Send expiration warning emails to users whose subscriptions are expiring soon
 */
async function sendExpirationWarnings(): Promise<void> {
  try {
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + EXPIRATION_WARNING_DAYS);
    warningDate.setHours(23, 59, 59, 999); // End of that day

    // Find active subscriptions expiring within the warning period
    const expiringSubscriptions = await prisma.subscription.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        endDate: {
          gte: now,
          lte: warningDate,
        },
        // Only send warning if haven't sent one in the last 2 days
        // (to avoid spamming if job runs multiple times)
        updatedAt: { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      },
      include: {
        user: true,
        plan: true,
      },
    }) as SubscriptionWithRelations[];

    if (expiringSubscriptions.length === 0) {
      logger.info('No subscriptions expiring soon');
      return;
    }

    logger.info(`Found ${expiringSubscriptions.length} subscription(s) expiring soon`);

    // Send warning emails
    for (const subscription of expiringSubscriptions) {
      // Skip if dates are missing
      if (!subscription.endDate || !subscription.startDate) {
        logger.warn(`Subscription ${subscription.id} has missing dates, skipping`);
        continue;
      }

      const daysUntilExpiration = Math.ceil(
        (subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      try {
        await emailService.sendSubscriptionExpirationWarning(
          {
            userName: subscription.user.surname + ' ' + subscription.user.otherNames,
            userEmail: subscription.user.email,
            planName: subscription.plan.name,
            duration: subscription.plan.duration,
            amount: subscription.plan.price,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
          },
          daysUntilExpiration
        );

        // Update subscription to mark that we've sent the warning
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { updatedAt: new Date() },
        });

        logger.info(
          `Sent expiration warning to ${subscription.user.email} (${daysUntilExpiration} days remaining)`
        );
      } catch (error) {
        logger.error(
          `Failed to send expiration warning to ${subscription.user.email}:`,
          error
        );
      }
    }

    logger.info(`✅ Sent ${expiringSubscriptions.length} expiration warning(s)`);
  } catch (error) {
    logger.error('Error sending expiration warnings:', error);
  }
}

/**
 * Expire subscriptions and send notification emails
 */
async function expireSubscriptionsAndNotify(): Promise<void> {
  try {
    const now = new Date();

    // Find all active subscriptions with endDate in the past
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        endDate: {
          lt: now,
        },
      },
      include: {
        user: true,
        plan: true,
      },
    }) as SubscriptionWithRelations[];

    if (expiredSubscriptions.length === 0) {
      logger.info('No subscriptions to expire');
      return;
    }

    logger.info(`Found ${expiredSubscriptions.length} expired subscription(s)`);

    // Update subscriptions to expired and send notification emails
    for (const subscription of expiredSubscriptions) {
      // Skip if dates are missing
      if (!subscription.endDate || !subscription.startDate) {
        logger.warn(`Subscription ${subscription.id} has missing dates, skipping`);
        continue;
      }

      try {
        // Update subscription status
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { subscriptionStatus: SubscriptionStatus.EXPIRED },
        });

        // Send expiration notification email
        await emailService.sendSubscriptionExpired({
          userName: subscription.user.surname + ' ' + subscription.user.otherNames,
          userEmail: subscription.user.email,
          planName: subscription.plan.name,
          duration: subscription.plan.duration,
          amount: subscription.plan.price,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        });

        logger.info(`Expired subscription and notified ${subscription.user.email}`);
      } catch (error) {
        logger.error(
          `Failed to expire subscription or send notification to ${subscription.user.email}:`,
          error
        );
      }
    }

    logger.info(`✅ Expired ${expiredSubscriptions.length} subscription(s) and sent notifications`);
  } catch (error) {
    logger.error('Error expiring subscriptions:', error);
  }
}

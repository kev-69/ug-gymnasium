import { startSubscriptionExpirationJob } from './subscriptionExpiration.job';
import { startPaymentCleanupJob } from './paymentCleanup.job';

export const startBackgroundJobs = (): void => {
  startSubscriptionExpirationJob();
  startPaymentCleanupJob();
};
import { Router } from 'express';
import {
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscriptionStatus,
  getSubscriptionStats,
} from '../../controllers/admin/subscription.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getAllSubscriptionsSchema,
  getSubscriptionByIdSchema,
  updateSubscriptionStatusSchema,
} from '../../validators/admin/subscription.validator';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// Get Subscription Statistics
router.get('/stats', getSubscriptionStats);

// Get All Subscriptions
router.get('/', validateRequest(getAllSubscriptionsSchema), getAllSubscriptions);

// Get Subscription by ID
router.get('/:id', validateRequest(getSubscriptionByIdSchema), getSubscriptionById);

// Update Subscription Status
router.patch('/:id/status', validateRequest(updateSubscriptionStatusSchema), updateSubscriptionStatus);

export default router;

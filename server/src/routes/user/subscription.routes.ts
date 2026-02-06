import { Router } from 'express';
import {
  createSubscription,
  getUserSubscriptions,
  getSubscriptionById,
} from '../../controllers/user/subscription.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createSubscriptionSchema,
} from '../../validators/user/subscription.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create Subscription
router.post('/', validateRequest(createSubscriptionSchema), createSubscription);

// Get User Subscriptions
router.get('/', getUserSubscriptions);

// Get Subscription by ID
router.get('/:id', getSubscriptionById);

export default router;

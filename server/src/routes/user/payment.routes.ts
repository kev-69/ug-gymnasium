import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  handlePaystackWebhook,
} from '../../controllers/user/payment.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  initializePaymentSchema,
  verifyPaymentSchema,
} from '../../validators/user/payment.validator';

const router = Router();

// Initialize Payment (requires authentication)
router.post('/initialize', authenticate, validateRequest(initializePaymentSchema), initializePayment);

// Verify Payment (requires authentication)
router.get('/verify/:reference', authenticate, validateRequest(verifyPaymentSchema), verifyPayment);

// Paystack Webhook (no authentication required)
router.post('/webhook/paystack', handlePaystackWebhook);

export default router;

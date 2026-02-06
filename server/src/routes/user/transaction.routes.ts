import { Router } from 'express';
import { getUserTransactions } from '../../controllers/user/transaction.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { getUserTransactionsSchema } from '../../validators/user/transaction.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/transactions
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get('/', validateRequest(getUserTransactionsSchema), getUserTransactions);

export default router;

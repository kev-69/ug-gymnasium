import { Router } from 'express';
import {
  getAllTransactions,
  getTransactionById,
} from '../../controllers/admin/transaction.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getAllTransactionsSchema,
  getTransactionByIdSchema,
} from '../../validators/admin/transaction.validator';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

// Get All Transactions
router.get('/', validateRequest(getAllTransactionsSchema), getAllTransactions);

// Get Transaction by ID
router.get('/:id', validateRequest(getTransactionByIdSchema), getTransactionById);

export default router;

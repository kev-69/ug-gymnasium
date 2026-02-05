import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
} from '../../controllers/admin/user.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getUserByIdSchema,
  getAllUsersSchema,
} from '../../validators/admin/user.validator';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

// Get All Users
router.get('/', validateRequest(getAllUsersSchema), getAllUsers);

// Get User by ID
router.get('/:id', validateRequest(getUserByIdSchema), getUserById);

export default router;

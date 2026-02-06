import { Router } from 'express';
import {
  getAllPlans,
  getPlanById,
} from '../../controllers/user/plan.controller';
import { optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();

// Get All Active Plans (optional auth - filters by role if logged in)
router.get('/', optionalAuthenticate, getAllPlans);

// Get Plan by ID (optional auth)
router.get('/:id', optionalAuthenticate, getPlanById);

export default router;

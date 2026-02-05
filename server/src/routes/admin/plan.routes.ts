import { Router } from 'express';
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from '../../controllers/admin/plan.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  createPlanSchema,
  updatePlanSchema,
  getPlanByIdSchema,
  deletePlanSchema,
} from '../../validators/admin/plan.validator';

const router = Router();

// All plan management routes require authentication
router.use(authenticate);

// Create Plan
router.post('/', validateRequest(createPlanSchema), createPlan);

// Get All Plans
router.get('/', getAllPlans);

// Get Plan by ID
router.get('/:id', validateRequest(getPlanByIdSchema), getPlanById);

// Update Plan
router.put('/:id', validateRequest(updatePlanSchema), updatePlan);

// Delete Plan
router.delete('/:id', validateRequest(deletePlanSchema), deletePlan);

export default router;

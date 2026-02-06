import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Create Plan Schema
export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plan name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be a positive number'),
    durationInDays: z.number().int().positive('Duration must be a positive integer'),
    targetRole: z.nativeEnum(UserRole),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    isActive: z.boolean().optional().default(true),
  }),
});

// Update Plan Schema
export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID format'),
  }),
  body: z.object({
    name: z.string().min(1, 'Plan name is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    duration: z.number().int().positive('Duration must be a positive integer').optional(),
    targetRole: z.nativeEnum(UserRole).optional(),
    features: z.array(z.string()).min(1, 'At least one feature is required').optional(),
    isActive: z.boolean().optional(),
  }),
});

// Get Plan by ID Schema
export const getPlanByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID format'),
  }),
});

// Delete Plan Schema
export const deletePlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID format'),
  }),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>['body'];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>['body'];
export type PlanIdParams = z.infer<typeof getPlanByIdSchema>['params'];

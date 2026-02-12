import { z } from 'zod';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';

// Get All Subscriptions Query Schema
export const getAllSubscriptionsSchema = z.object({
  query: z.object({
    subscriptionStatus: z.nativeEnum(SubscriptionStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    userId: z.string().uuid('Invalid user ID format').optional(),
    planId: z.string().uuid('Invalid plan ID format').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

// Get Subscription by ID Schema
export const getSubscriptionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID format'),
  }),
});

// Update Subscription Status Schema
export const updateSubscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid subscription ID format'),
  }),
  body: z.object({
    subscriptionStatus: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'CANCELLED']),
  }),
});

export type GetAllSubscriptionsQuery = z.infer<typeof getAllSubscriptionsSchema>['query'];
export type SubscriptionIdParams = z.infer<typeof getSubscriptionByIdSchema>['params'];
export type UpdateSubscriptionStatusBody = z.infer<typeof updateSubscriptionStatusSchema>['body'];

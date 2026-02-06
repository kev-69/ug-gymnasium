import { z } from 'zod';

// Create Subscription Schema
export const createSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid('Invalid plan ID format'),
  }),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>['body'];

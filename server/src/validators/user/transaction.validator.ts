import { z } from 'zod';

// Get user transactions schema with optional filters
export const getUserTransactionsSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

export type GetUserTransactionsQuery = z.infer<typeof getUserTransactionsSchema>['query'];

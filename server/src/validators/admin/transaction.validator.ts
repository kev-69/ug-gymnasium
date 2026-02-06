import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

// Get All Transactions Query Schema
export const getAllTransactionsSchema = z.object({
  query: z.object({
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    userId: z.string().uuid('Invalid user ID format').optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

// Get Transaction by ID Schema
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID format'),
  }),
});

export type GetAllTransactionsQuery = z.infer<typeof getAllTransactionsSchema>['query'];
export type TransactionIdParams = z.infer<typeof getTransactionByIdSchema>['params'];

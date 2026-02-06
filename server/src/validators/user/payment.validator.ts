import { z } from 'zod';

// Initialize Payment Schema
export const initializePaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().uuid('Invalid transaction ID format'),
    paymentMethod: z.enum(['CARD', 'MOBILE_MONEY']),
  }),
});

// Verify Payment Schema
export const verifyPaymentSchema = z.object({
  params: z.object({
    reference: z.string().min(1, 'Payment reference is required'),
  }),
});

export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>['body'];
export type VerifyPaymentParams = z.infer<typeof verifyPaymentSchema>['params'];

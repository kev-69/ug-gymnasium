import { z } from 'zod';
import { Gender } from '@prisma/client';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[@$!%*?&#]/, 'Password must contain at least one special character');

// Admin Signup Schema
export const adminSignupSchema = z.object({
  body: z.object({
    surname: z.string().min(1, 'Surname is required'),
    otherNames: z.string().min(1, 'Other names are required'),
    gender: z.nativeEnum(Gender),
    email: z.string().email('Invalid email format'),
    password: passwordSchema,
    isSuperAdmin: z.boolean().optional().default(false),
  }),
});

// Admin Login Schema
export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export type AdminSignupInput = z.infer<typeof adminSignupSchema>['body'];
export type AdminLoginInput = z.infer<typeof adminLoginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];

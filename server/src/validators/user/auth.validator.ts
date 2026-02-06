import { z } from 'zod';

// Password validation
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// Student signup schema
export const studentSignupSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'Student ID is required'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    surname: z.string().min(1, 'Surname is required'),
    otherNames: z.string().min(1, 'Other names are required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    gender: z.enum(['MALE', 'FEMALE']),
    residence: z.boolean().optional().default(false),
    hallOfResidence: z.string().optional(),
  }),
});

// Staff signup schema
export const staffSignupSchema = z.object({
  body: z.object({
    staffId: z.string().min(1, 'Staff ID is required'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    surname: z.string().min(1, 'Surname is required'),
    otherNames: z.string().min(1, 'Other names are required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    gender: z.enum(['MALE', 'FEMALE']),
  }),
});

// Public user signup schema
export const publicSignupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    surname: z.string().min(1, 'Surname is required'),
    otherNames: z.string().min(1, 'Other names are required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    gender: z.enum(['MALE', 'FEMALE']),
  }),
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Change password schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
  }),
});

// Type exports
export type StudentSignupInput = z.infer<typeof studentSignupSchema>['body'];
export type StaffSignupInput = z.infer<typeof staffSignupSchema>['body'];
export type PublicSignupInput = z.infer<typeof publicSignupSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];

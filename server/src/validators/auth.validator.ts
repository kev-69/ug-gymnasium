import { z } from 'zod';
import { UserRole, Gender } from '@prisma/client';

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
  studentId: z.string().min(1, 'Student ID is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  surname: z.string().min(1, 'Surname is required'),
  otherNames: z.string().min(1, 'Other names are required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.nativeEnum(Gender),
  residence: z.boolean().optional().default(false),
  hallOfResidence: z.string().optional(),
});

// Staff signup schema
export const staffSignupSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  surname: z.string().min(1, 'Surname is required'),
  otherNames: z.string().min(1, 'Other names are required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.nativeEnum(Gender),
});

// Public user signup schema
export const publicSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  surname: z.string().min(1, 'Surname is required'),
  otherNames: z.string().min(1, 'Other names are required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  gender: z.nativeEnum(Gender),
});

// Admin signup schema (should be restricted)
export const adminSignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  surname: z.string().min(1, 'Surname is required'),
  otherNames: z.string().min(1, 'Other names are required'),
  gender: z.nativeEnum(Gender),
  permissions: z.array(z.string()).optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

// Type exports
export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type StaffSignupInput = z.infer<typeof staffSignupSchema>;
export type PublicSignupInput = z.infer<typeof publicSignupSchema>;
export type AdminSignupInput = z.infer<typeof adminSignupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

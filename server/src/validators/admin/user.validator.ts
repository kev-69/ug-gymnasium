import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Get User by ID Schema
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
});

// Get All Users Query Schema
export const getAllUsersSchema = z.object({
  query: z.object({
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

export type UserIdParams = z.infer<typeof getUserByIdSchema>['params'];
export type GetAllUsersQuery = z.infer<typeof getAllUsersSchema>['query'];

import { z } from 'zod';

export const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name is required and must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const adminAddSchema = adminRegisterSchema;

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const adminChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const getAdminVendorQuerySchema = z.object({
  limit: z.coerce.number().int().nonnegative().optional().default(10),
  skip: z.coerce.number().int().nonnegative().optional().default(0),
  searchTerm: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  sortKey: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional().default('createdAt'),
  sortOrder: z
    .union([z.string(), z.number()])
    .optional()
    .transform(val => (val === 'asc' || val === 1 || val === '1' ? 'asc' : 'desc')),
  needCount: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform(val => val === true || val === 'true' || val === '1'),
  active: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform(val => (val === undefined ? undefined : val === true || val === 'true')),
});

export const adminVendorStatusSchema = z.object({
  active: z.boolean(),
});

export const adminUpdateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

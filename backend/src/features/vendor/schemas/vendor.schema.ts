import { z } from 'zod';

export const vendorRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const vendorLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const vendorUpdateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  phoneCountry: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.string().optional(),
});

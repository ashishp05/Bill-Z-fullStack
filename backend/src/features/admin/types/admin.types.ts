import { z } from 'zod';

import {
  adminAddSchema,
  adminChangePasswordSchema,
  adminLoginSchema,
  adminRegisterSchema,
  adminUpdateProfileSchema,
  adminVendorStatusSchema,
  getAdminVendorQuerySchema,
} from '../schemas/admin.schema';

export const AdminRoles = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

export type AdminRoleType = (typeof AdminRoles)[keyof typeof AdminRoles];

export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type AdminAddInput = z.infer<typeof adminAddSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminChangePasswordInput = z.infer<typeof adminChangePasswordSchema>;
export type AdminVendorQueryFilterInput = z.infer<typeof getAdminVendorQuerySchema>;
export type AdminVendorStatusInput = z.infer<typeof adminVendorStatusSchema>;
export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>;

export interface AdminProfileResponse {
  id: string;
  name: string;
  email: string;
  image: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAuthResponse {
  token: string;
  accessToken: string;
  admin: AdminProfileResponse;
  user: {
    _id: string;
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface VendorsListingResponse {
  total?: number;
  records: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    businessName: string | null;
    phoneCountry: string | null;
    phoneNumber: string | null;
    profilePicture: string | null;
    profilePictureUrl?: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

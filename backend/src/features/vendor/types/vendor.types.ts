import { z } from 'zod';

import {
  vendorLoginSchema,
  vendorRegisterSchema,
  vendorUpdateProfileSchema,
} from '../schemas/vendor.schema';

export type VendorRegisterInput = z.infer<typeof vendorRegisterSchema>;
export type VendorLoginInput = z.infer<typeof vendorLoginSchema>;
export type VendorUpdateProfileInput = z.infer<typeof vendorUpdateProfileSchema>;

export interface VendorQueryFilterInput {
  limit?: number;
  skip?: number;
  searchTerm?: string;
  name?: string;
  email?: string;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  needCount?: boolean;
  active?: boolean;
}

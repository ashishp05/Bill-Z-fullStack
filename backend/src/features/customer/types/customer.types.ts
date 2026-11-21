import { z } from 'zod';

import {
  createVendorCustomerSchema,
  updateCustomerProfileSchema,
  updateVendorCustomerSchema,
  vendorCustomerQuerySchema,
} from '../schemas/customer.schema';

export type CreateVendorCustomerInput = z.infer<typeof createVendorCustomerSchema>;
export type UpdateVendorCustomerInput = z.infer<typeof updateVendorCustomerSchema>;
export type VendorCustomerQueryInput = z.infer<typeof vendorCustomerQuerySchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;

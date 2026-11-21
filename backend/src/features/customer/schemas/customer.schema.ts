import { z } from 'zod';

import { MAX_PAGE_SIZE } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import {
  gstinField,
  mobileField,
  optionalOf,
  optionalText,
  pincodeField,
} from '../../vendor/schemas/vendor.schema';

const customerFields = {
  name: z.string().trim().min(2, ValidationMessages.ENTER_VALID_NAME).max(120),
  email: z.string().trim().toLowerCase().email(ValidationMessages.ENTER_VALID_EMAIL),
  phone: mobileField,
  gstin: optionalOf(gstinField),
  address: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  pincode: optionalOf(pincodeField),
};

export const createVendorCustomerSchema = z.object(customerFields);

export const updateVendorCustomerSchema = z.object(customerFields).partial();

export const vendorCustomerQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

// A customer can only change their own login identity details, not a vendor's records.
export const updateCustomerProfileSchema = z
  .object({
    name: customerFields.name,
    phone: mobileField,
  })
  .partial();

import { z } from 'zod';

import { GST_RATES } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import { isValidIndianMobile, normalizeIndianMobile } from '../../../utils/phone.util';

const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PINCODE_PATTERN = /^[1-9]\d{5}$/;

// Shared field validators reused by the customer feature.
export const mobileField = z
  .string()
  .trim()
  .refine(isValidIndianMobile, ValidationMessages.ENTER_VALID_MOBILE)
  .transform(normalizeIndianMobile);

export const gstinField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(GSTIN_PATTERN, ValidationMessages.ENTER_VALID_GSTIN);

export const pincodeField = z
  .string()
  .trim()
  .regex(PINCODE_PATTERN, ValidationMessages.ENTER_VALID_PINCODE);

// Empty strings from forms clear an optional field.
export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max, ValidationMessages.max('Value', max))
    .transform(value => (value === '' ? null : value))
    .nullable()
    .optional();

export const optionalOf = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(value => (value === '' ? null : value), schema.nullable().optional());

const booleanField = z.preprocess(
  value => (value === 'true' ? true : value === 'false' ? false : value),
  z.boolean(),
);

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
  firstName: z.string().trim().min(1, ValidationMessages.required('First name')).optional(),
  lastName: z.string().trim().optional(),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').optional(),
  businessType: optionalText(100),
  gstin: optionalOf(gstinField),
  isRegisteredGST: booleanField.optional(),
  phoneCountry: z.string().optional(),
  phoneNumber: optionalOf(mobileField),
  address: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  pincode: optionalOf(pincodeField),
  upiId: optionalText(100),
  profilePicture: z.string().optional(),
});

export const vendorSettingsSchema = z
  .object({
    invoicePrefix: z.string().trim().min(1, ValidationMessages.required('Invoice prefix')).max(20),
    nextInvoiceNumber: z.coerce.number().int().min(1),
    defaultGstRate: z.coerce
      .number()
      .int()
      .refine(
        rate => (GST_RATES as readonly number[]).includes(rate),
        ValidationMessages.INVALID_GST_RATE,
      ),
    paymentTermsDays: z.coerce.number().int().min(0).max(365),
    invoiceNote: optionalText(500),
    showGst: z.boolean(),
    emailInvoices: z.boolean(),
    paymentUpdates: z.boolean(),
    weeklySummary: z.boolean(),
  })
  .partial();

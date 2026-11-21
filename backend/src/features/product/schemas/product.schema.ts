import { z } from 'zod';

import { GST_RATES } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';

// Product forms may arrive as multipart (strings) or JSON, so numbers and booleans are coerced.
const toNumber = (value: unknown) =>
  value === '' || value === undefined ? undefined : Number(value);
const toBoolean = (value: unknown) =>
  value === undefined ? undefined : value === 'true' || value === true;
const emptyToNull = (value: unknown) => (value === '' || value === 'null' ? null : value);

const productFields = {
  name: z.string().trim().min(1, ValidationMessages.required('Name')).max(150),
  description: z.preprocess(emptyToNull, z.string().max(1000).nullable()),
  sku: z.preprocess(emptyToNull, z.string().trim().max(50).nullable()),
  hsn: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(/^\d{4,8}$/, ValidationMessages.INVALID_HSN)
      .nullable(),
  ),
  unit: z.string().trim().min(1).max(20),
  price: z.preprocess(
    toNumber,
    z
      .number(ValidationMessages.required('Price'))
      .int(ValidationMessages.WHOLE_RUPEES)
      .min(0, 'Price must be greater than or equal to 0'),
  ),
  gstRate: z.preprocess(
    toNumber,
    z
      .number()
      .int()
      .refine(
        rate => (GST_RATES as readonly number[]).includes(rate),
        ValidationMessages.INVALID_GST_RATE,
      ),
  ),
  categoryId: z.preprocess(
    emptyToNull,
    z.string().uuid(ValidationMessages.invalid('categoryId')).nullable(),
  ),
  brandId: z.preprocess(
    emptyToNull,
    z.string().uuid(ValidationMessages.invalid('brandId')).nullable(),
  ),
  active: z.preprocess(toBoolean, z.boolean()),
  quantity: z.preprocess(
    toNumber,
    z.number().int().min(0, 'Quantity must be greater than or equal to 0'),
  ),
  unlimitedStock: z.preprocess(toBoolean, z.boolean()),
};

export const addProductSchema = z.object({
  ...productFields,
  description: productFields.description.optional(),
  sku: productFields.sku.optional(),
  hsn: productFields.hsn.optional(),
  unit: productFields.unit.default('Pcs'),
  gstRate: productFields.gstRate.default(18),
  categoryId: productFields.categoryId.optional(),
  brandId: productFields.brandId.optional(),
  active: productFields.active.default(true),
  quantity: productFields.quantity.default(0),
  unlimitedStock: productFields.unlimitedStock.default(true),
});

export const updateProductSchema = z.object(productFields).partial();

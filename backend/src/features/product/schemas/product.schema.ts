import { z } from 'zod';

import { ValidationMessages } from '../../../constants/messages';

export const addProductSchema = z.object({
  name: z.string().min(1, ValidationMessages.required('Name')),
  description: z.string().optional(),
  price: z.preprocess(
    val => Number(val),
    z.number().min(0, 'Price must be greater than or equal to 0'),
  ),
  quantity: z.preprocess(
    val => Number(val),
    z.number().int().min(0, 'Quantity must be greater than or equal to 0'),
  ),
  unlimitedStock: z.preprocess(val => val === 'true' || val === true, z.boolean()).default(false),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, ValidationMessages.required('Name')).optional(),
  description: z.string().optional(),
  price: z
    .preprocess(val => Number(val), z.number().min(0, 'Price must be greater than or equal to 0'))
    .optional(),
  quantity: z
    .preprocess(
      val => Number(val),
      z.number().int().min(0, 'Quantity must be greater than or equal to 0'),
    )
    .optional(),
  unlimitedStock: z
    .preprocess(
      val => (val !== undefined ? val === 'true' || val === true : undefined),
      z.boolean(),
    )
    .optional(),
});

import { z } from 'zod';

import { ValidationMessages } from '../../../constants/messages';

export const catalogKindSchema = z.enum(['categories', 'brands']);

export const createCatalogItemSchema = z.object({
  name: z.string().trim().min(1, ValidationMessages.required('Name')).max(80),
});

export const updateCatalogItemSchema = z
  .object({
    name: z.string().trim().min(1, ValidationMessages.required('Name')).max(80),
    active: z.boolean(),
  })
  .partial();

export const catalogQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .optional()
    .transform(value => value === 'true'),
});

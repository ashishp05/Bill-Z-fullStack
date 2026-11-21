import { z } from 'zod';

import { addProductSchema, updateProductSchema } from '../schemas/product.schema';

export type AddProductPayload = z.infer<typeof addProductSchema> & { images?: string[] };
export type UpdateProductPayload = z.infer<typeof updateProductSchema> & { images?: string[] };

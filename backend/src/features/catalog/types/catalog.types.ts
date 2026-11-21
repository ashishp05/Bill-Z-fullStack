import { z } from 'zod';

import {
  catalogKindSchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
} from '../schemas/catalog.schema';

// "categories" or "brands": both are global name lists with the same shape.
export type CatalogKind = z.infer<typeof catalogKindSchema>;
export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
export type UpdateCatalogItemInput = z.infer<typeof updateCatalogItemSchema>;

export interface CatalogItem {
  id: string;
  name: string;
  active: boolean;
}

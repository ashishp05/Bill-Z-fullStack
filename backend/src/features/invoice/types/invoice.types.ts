import { Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  createInvoiceSchema,
  invoiceQuerySchema,
  updatePaymentSchema,
} from '../schemas/invoice.schema';

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;

export type InvoiceWithItems = Prisma.InvoiceGetPayload<{ include: { items: true } }>;

// Scope for list/detail queries: exactly one owner is set.
export type InvoiceOwner = { vendorId: string } | { customerId: string };

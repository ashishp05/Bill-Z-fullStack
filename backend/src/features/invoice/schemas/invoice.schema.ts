import { z } from 'zod';

import { MAX_PAGE_SIZE, PAYMENT_MODES } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import { optionalText } from '../../vendor/schemas/vendor.schema';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, ValidationMessages.INVALID_DATE);

// Only ids and quantities are accepted: prices, names and tax come from the database.
export const createInvoiceSchema = z
  .object({
    customerId: z.string().uuid(ValidationMessages.invalid('customerId')),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(ValidationMessages.invalid('productId')),
          quantity: z.coerce.number().int().min(1).max(100000),
        }),
      )
      .min(1, ValidationMessages.INVOICE_ITEMS_REQUIRED)
      .max(100),
    invoiceDate: dateOnly.optional(),
    dueDate: dateOnly.optional(),
    discount: z.coerce.number().int(ValidationMessages.WHOLE_RUPEES).min(0).default(0),
    notes: optionalText(500),
  })
  .refine(data => !data.invoiceDate || !data.dueDate || data.dueDate >= data.invoiceDate, {
    message: ValidationMessages.INVOICE_DUE_BEFORE_DATE,
    path: ['dueDate'],
  });

export const updatePaymentSchema = z
  .object({
    status: z.enum(['PENDING', 'PAID']),
    paymentMode: z.enum(PAYMENT_MODES).optional(),
  })
  .refine(data => data.status !== 'PAID' || !!data.paymentMode, {
    message: ValidationMessages.PAYMENT_MODE_REQUIRED,
    path: ['paymentMode'],
  });

// OVERDUE is a derived filter (PENDING and past due), never a stored status.
export const invoiceQuerySchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
  search: z.string().trim().optional(),
  customerId: z.string().uuid().optional(),
  from: dateOnly.optional(),
  to: dateOnly.optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});

import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { AuthRoles } from '../../../constants/config.constants';
import { checkUserRole } from '../../../middleware/auth.middleware';
import { validateQuery, validateRequest } from '../../../middleware/validation.middleware';
import { InvoiceController } from '../controllers/invoice.controller';
import { InvoiceRepository } from '../repositories/invoice.repository';
import {
  createInvoiceSchema,
  invoiceQuerySchema,
  updatePaymentSchema,
} from '../schemas/invoice.schema';
import { InvoiceService } from '../services/invoice.service';

const prisma = PrismaService.getInstance().client;
const invoiceController = new InvoiceController(new InvoiceService(new InvoiceRepository(prisma)));

// Mounted at /vendor/invoices
const vendorInvoiceRouter = Router();

vendorInvoiceRouter.use(checkUserRole([AuthRoles.VENDOR]));

vendorInvoiceRouter.get('/', validateQuery(invoiceQuerySchema), invoiceController.getAll);

vendorInvoiceRouter.get('/summary', invoiceController.getSummary);

vendorInvoiceRouter.get('/:id', invoiceController.getById);

vendorInvoiceRouter.post('/', validateRequest(createInvoiceSchema), invoiceController.create);

vendorInvoiceRouter.patch(
  '/:id/payment',
  validateRequest(updatePaymentSchema),
  invoiceController.updatePayment,
);

// Mounted at /customer/invoices
const customerInvoiceRouter = Router();

customerInvoiceRouter.use(checkUserRole([AuthRoles.CUSTOMER]));

customerInvoiceRouter.get(
  '/',
  validateQuery(invoiceQuerySchema),
  invoiceController.getAllForCustomer,
);

customerInvoiceRouter.get('/:id', invoiceController.getByIdForCustomer);

export { customerInvoiceRouter, vendorInvoiceRouter };

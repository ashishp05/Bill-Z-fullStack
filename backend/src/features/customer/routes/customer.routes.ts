import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { AuthRoles } from '../../../constants/config.constants';
import { checkUserRole } from '../../../middleware/auth.middleware';
import { validateQuery, validateRequest } from '../../../middleware/validation.middleware';
import { CustomerController } from '../controllers/customer.controller';
import { CustomerRepository } from '../repositories/customer.repository';
import {
  createVendorCustomerSchema,
  updateCustomerProfileSchema,
  updateVendorCustomerSchema,
  vendorCustomerQuerySchema,
} from '../schemas/customer.schema';
import { CustomerService } from '../services/customer.service';

const prisma = PrismaService.getInstance().client;
const customerController = new CustomerController(
  new CustomerService(new CustomerRepository(prisma)),
);

// Mounted at /vendor/customers
const vendorCustomerRouter = Router();

vendorCustomerRouter.use(checkUserRole([AuthRoles.VENDOR]));

vendorCustomerRouter.get('/', validateQuery(vendorCustomerQuerySchema), customerController.getAll);

vendorCustomerRouter.get('/:id', customerController.getById);

vendorCustomerRouter.post(
  '/',
  validateRequest(createVendorCustomerSchema),
  customerController.create,
);

vendorCustomerRouter.put(
  '/:id',
  validateRequest(updateVendorCustomerSchema),
  customerController.update,
);

// Mounted at /customer
const customerAccountRouter = Router();

customerAccountRouter.get(
  '/profile',
  checkUserRole([AuthRoles.CUSTOMER]),
  customerController.getProfile,
);

customerAccountRouter.put(
  '/profile',
  checkUserRole([AuthRoles.CUSTOMER]),
  validateRequest(updateCustomerProfileSchema),
  customerController.updateProfile,
);

export { customerAccountRouter, vendorCustomerRouter };

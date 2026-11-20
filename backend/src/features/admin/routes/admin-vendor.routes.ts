import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { auth, checkUserRole } from '../../../middleware/auth.middleware';
import { validateQuery, validateRequest } from '../../../middleware/validation.middleware';
import { VendorRepository } from '../../vendor/repositories/vendor.repository';
import { AdminVendorController } from '../controllers/admin-vendor.controller';
import { adminVendorStatusSchema, getAdminVendorQuerySchema } from '../schemas/admin.schema';
import { AdminVendorService } from '../services/admin-vendor.service';
import { AdminRoles } from '../types/admin.types';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const vendorRepository = new VendorRepository(prisma);
const adminVendorService = new AdminVendorService(vendorRepository);
const adminVendorController = new AdminVendorController(adminVendorService);

const router = Router();

const superAdminGuard = [auth, checkUserRole([AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN])];

router.get(
  '/',
  ...superAdminGuard,
  validateQuery(getAdminVendorQuerySchema),
  adminVendorController.getAllVendors,
);

router.get('/:id', ...superAdminGuard, adminVendorController.getVendorById);

router.patch(
  '/:id/status',
  ...superAdminGuard,
  validateRequest(adminVendorStatusSchema),
  adminVendorController.updateVendorStatus,
);

export default router;

import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { auth, checkUserRole } from '../../../middleware/auth.middleware';
import { authRateLimiter } from '../../../middleware/security.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { AdminRepository } from '../repositories/admin.repository';
import {
  adminAddSchema,
  adminChangePasswordSchema,
  adminLoginSchema,
  adminRegisterSchema,
} from '../schemas/admin.schema';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminRoles } from '../types/admin.types';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const adminRepository = new AdminRepository(prisma);
const adminAuthService = new AdminAuthService(adminRepository);
const adminAuthController = new AdminAuthController(adminAuthService);

const router = Router();

const superAdminGuard = [auth, checkUserRole([AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN])];

// Add / Register Admin (callable via Postman or Admin UI)
router.post('/add', authRateLimiter, validateRequest(adminAddSchema), adminAuthController.addAdmin);

router.post(
  '/register',
  authRateLimiter,
  validateRequest(adminRegisterSchema),
  adminAuthController.register,
);

// Login
router.post(
  '/login',
  authRateLimiter,
  validateRequest(adminLoginSchema),
  adminAuthController.login,
);

// Profile & Account Management
router.get('/profile', ...superAdminGuard, adminAuthController.getProfile);

router.post(
  '/change-password',
  ...superAdminGuard,
  validateRequest(adminChangePasswordSchema),
  adminAuthController.changePassword,
);

router.post('/logout', ...superAdminGuard, adminAuthController.logout);

export default router;

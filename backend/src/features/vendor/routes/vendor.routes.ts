import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { AuthRoles } from '../../../constants/config.constants';
import { checkUserRole } from '../../../middleware/auth.middleware';
import { authRateLimiter } from '../../../middleware/security.middleware';
import { uploadFor } from '../../../middleware/upload.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { VendorController } from '../controllers/vendor.controller';
import { VendorRepository } from '../repositories/vendor.repository';
import {
  vendorLoginSchema,
  vendorRegisterSchema,
  vendorSettingsSchema,
  vendorUpdateProfileSchema,
} from '../schemas/vendor.schema';
import { VendorService } from '../services/vendor.service';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const vendorRepository = new VendorRepository(prisma);
const vendorService = new VendorService(vendorRepository);
const vendorController = new VendorController(vendorService);

const router = Router();
const vendorOnly = checkUserRole([AuthRoles.VENDOR]);

const vendorProfileUpload = uploadFor('vendors/profiles', {
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

// Authentication Routes
router.post(
  '/register',
  authRateLimiter,
  validateRequest(vendorRegisterSchema),
  vendorController.register,
);

router.post('/login', authRateLimiter, validateRequest(vendorLoginSchema), vendorController.login);

// Protected Profile Routes
router.get('/profile', vendorOnly, vendorController.getProfile);

router.put(
  '/profile',
  vendorOnly,
  vendorProfileUpload.single('profilePicture'),
  validateRequest(vendorUpdateProfileSchema),
  vendorController.updateProfile,
);

router.post(
  '/profile/picture',
  vendorOnly,
  vendorProfileUpload.single('profilePicture'),
  vendorController.uploadProfilePicture,
);

// Invoice and billing preferences
router.get('/settings', vendorOnly, vendorController.getSettings);

router.put(
  '/settings',
  vendorOnly,
  validateRequest(vendorSettingsSchema),
  vendorController.updateSettings,
);

export default router;

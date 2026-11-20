import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { auth } from '../../../middleware/auth.middleware';
import { authRateLimiter } from '../../../middleware/security.middleware';
import { uploadFor } from '../../../middleware/upload.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { VendorController } from '../controllers/vendor.controller';
import { VendorRepository } from '../repositories/vendor.repository';
import {
  vendorLoginSchema,
  vendorRegisterSchema,
  vendorUpdateProfileSchema,
} from '../schemas/vendor.schema';
import { VendorService } from '../services/vendor.service';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const vendorRepository = new VendorRepository(prisma);
const vendorService = new VendorService(vendorRepository);
const vendorController = new VendorController(vendorService);

const router = Router();

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
router.get('/profile', auth, vendorController.getProfile);

router.put(
  '/profile',
  auth,
  vendorProfileUpload.single('profilePicture'),
  validateRequest(vendorUpdateProfileSchema),
  vendorController.updateProfile,
);

router.post(
  '/profile/picture',
  auth,
  vendorProfileUpload.single('profilePicture'),
  vendorController.uploadProfilePicture,
);

export default router;

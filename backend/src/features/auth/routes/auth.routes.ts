import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { otpRateLimiter } from '../../../middleware/security.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { VendorRepository } from '../../vendor/repositories/vendor.repository';
import { AuthController } from '../controllers/auth.controller';
import { OtpRepository } from '../repositories/otp.repository';
import { lookupAccountSchema, requestOtpSchema, verifyOtpSchema } from '../schemas/auth.schema';
import { AuthService } from '../services/auth.service';

const prisma = PrismaService.getInstance().client;
const authController = new AuthController(
  new AuthService(
    new OtpRepository(prisma),
    new VendorRepository(prisma),
    new CustomerRepository(prisma),
  ),
);

const router = Router();

// Email OTP sign-in shared by vendors and customers. Admins keep password login.
router.post('/lookup', otpRateLimiter, validateRequest(lookupAccountSchema), authController.lookup);

router.post(
  '/request-otp',
  otpRateLimiter,
  validateRequest(requestOtpSchema),
  authController.requestOtp,
);

router.post(
  '/verify-otp',
  otpRateLimiter,
  validateRequest(verifyOtpSchema),
  authController.verifyOtp,
);

export default router;

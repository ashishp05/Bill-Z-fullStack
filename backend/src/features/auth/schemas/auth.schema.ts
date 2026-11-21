import { z } from 'zod';

import { AuthRoles, OTP_CONFIG } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';

const identifier = z
  .string()
  .trim()
  .min(3, ValidationMessages.ENTER_VALID_IDENTIFIER)
  .max(254, ValidationMessages.ENTER_VALID_IDENTIFIER);

const role = z.enum([AuthRoles.VENDOR, AuthRoles.CUSTOMER]);

const purpose = z.enum(['login', 'register']).default('login');

// identifier is an email address or a 10-digit Indian mobile number.
export const lookupAccountSchema = z.object({
  identifier,
  role: role.optional(),
});

export const requestOtpSchema = z.object({ identifier, role, purpose });

export const verifyOtpSchema = z.object({
  identifier,
  role,
  purpose,
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${OTP_CONFIG.LENGTH}}$`), ValidationMessages.OTP_INVALID),
});

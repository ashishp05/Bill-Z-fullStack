import crypto from 'crypto';

import { env } from '../config/env-config';
import { OTP_CONFIG } from '../constants/config.constants';

// Generates a numeric one-time code. Outside production a fixed demo code can be configured.
export const generateOtpCode = (): string => {
  if (env.NODE_ENV !== 'production' && env.DEMO_OTP_CODE) {
    return env.DEMO_OTP_CODE;
  }
  const max = 10 ** OTP_CONFIG.LENGTH;
  return crypto.randomInt(0, max).toString().padStart(OTP_CONFIG.LENGTH, '0');
};

// Keyed hash so a database leak does not expose codes; the code itself is never stored.
export const hashOtpCode = (email: string, code: string): string =>
  crypto.createHmac('sha256', env.JWT_SECRET).update(`${email}:${code}`).digest('hex');

export const isOtpCodeMatch = (email: string, code: string, storedHash: string): boolean => {
  const candidate = Buffer.from(hashOtpCode(email, code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
};

// Shows enough of an email for the user to recognise it, e.g. ro***@mehtatraders.in.
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
};

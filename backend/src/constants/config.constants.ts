export const RATE_LIMIT = {
  GLOBAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GLOBAL_MAX: 600, // ~7 API calls per PWA load; 100 was exhausted by a few page loads
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX: 10,
  OTP_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  OTP_MAX: 30,
};

// Email OTP rules shared by vendor and customer sign-in.
export const OTP_CONFIG = Object.freeze({
  LENGTH: 6,
  EXPIRES_IN_SECONDS: 10 * 60,
  RESEND_COOLDOWN_SECONDS: 30,
  MAX_ATTEMPTS: 5,
  MAX_REQUESTS_PER_HOUR: 5,
});

// Roles carried in vendor and customer JWTs. Admin roles live in the admin feature.
export const AuthRoles = Object.freeze({
  VENDOR: 'vendor',
  CUSTOMER: 'customer',
} as const);

export type AuthRole = (typeof AuthRoles)[keyof typeof AuthRoles];

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const PAYMENT_MODES = ['UPI', 'Cash', 'Bank transfer', 'Card', 'Other'] as const;

// Invoice number sequence padding, e.g. INV-2026-000001.
export const INVOICE_NUMBER_PAD = 6;

export const MAX_PAGE_SIZE = 100;

export const BCRYPT_SALT_ROUNDS = 10;

export const APP_NAME = 'Node With Prisma';

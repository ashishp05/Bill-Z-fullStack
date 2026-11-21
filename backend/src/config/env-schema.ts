import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST_URL: z.string().optional(),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  WHITE_LIST_URLS: z
    .string()
    .transform(value => value.split(',').map(url => url.trim()))
    .refine(urls => urls.every(url => z.string().url().safeParse(url).success), {
      message: 'Each value in WHITE_LIST_URLS must be a valid URL',
    }),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SENDER_NAME: z.string().optional().default('Rise Up'),
  DISABLE_EMAIL: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(false),
  // Fixed OTP for demo accounts in development. Ignored when NODE_ENV is production.
  DEMO_OTP_CODE: z
    .string()
    .regex(/^\d{6}$/, 'DEMO_OTP_CODE must be 6 digits')
    .optional(),
  USE_S3: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(false),
  AWS_REGION: z.string().optional().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(false),
  USE_FIREBASE: z
    .string()
    .optional()
    .transform(val => val === 'true')
    .default(false),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

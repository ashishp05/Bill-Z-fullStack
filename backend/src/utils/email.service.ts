import path from 'path';

import { renderEmailTemplate, sendEmail } from './email.helper';

const templatesDirPath = path.join(process.cwd(), 'src/templates');
const logoUrl = 'https://example.com/assets/images/logo.png';
const appName = 'Prisma With PostgreSQL';

export interface ForgotPasswordEmailOptions {
  email: string;
  name?: string;
  resetLink: string;
}

export interface NewUserInvitationEmailOptions {
  email: string;
  name: string;
  role?: string;
  loginLink: string;
}

/**
 * Send forgot password reset email with .hbs template
 */
export const sendForgotPasswordEmail = async (options: ForgotPasswordEmailOptions) => {
  const { email, name = 'User', resetLink } = options;

  const templatePath = path.join(templatesDirPath, 'admin', 'forgot_password.hbs');

  const html = renderEmailTemplate({
    templatePath,
    data: {
      name,
      resetLink,
      logoUrl,
      appName,
    },
  });

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
  });
};

/**
 * Send new user invitation email with .hbs template
 */
export const sendNewUserInvitationEmail = async (options: NewUserInvitationEmailOptions) => {
  const { email, name, role, loginLink } = options;

  const templatePath = path.join(templatesDirPath, 'admin', 'new_user_invitation.hbs');

  const html = renderEmailTemplate({
    templatePath,
    data: {
      name,
      email,
      role,
      loginLink,
      logoUrl,
      appName,
    },
  });

  return sendEmail({
    to: email,
    subject: 'Welcome Aboard',
    html,
  });
};

export interface OtpEmailOptions {
  email: string;
  name?: string;
  code: string;
  expiresInMinutes: number;
}

/**
 * Send a one-time sign-in code for vendor or customer login
 */
export const sendOtpEmail = async (options: OtpEmailOptions) => {
  const { email, name = 'there', code, expiresInMinutes } = options;

  const templatePath = path.join(templatesDirPath, 'auth', 'otp_code.hbs');

  const html = renderEmailTemplate({
    templatePath,
    data: { name, code, expiresInMinutes, appName: 'Bill-Z' },
  });

  return sendEmail({
    to: email,
    subject: `${code} is your Bill-Z verification code`,
    html,
    text: `Your Bill-Z verification code is ${code}. It is valid for ${expiresInMinutes} minutes.`,
  });
};

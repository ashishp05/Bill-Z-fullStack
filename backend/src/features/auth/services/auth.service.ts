import { OtpPurpose, OtpRole } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { env } from '../../../config/env-config';
import { AuthRole, AuthRoles, OTP_CONFIG } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { sendOtpEmail } from '../../../utils/email.service';
import { generateToken } from '../../../utils/generate-token.util';
import { generateOtpCode, hashOtpCode, isOtpCodeMatch, maskEmail } from '../../../utils/otp.util';
import { isValidIndianMobile, normalizeIndianMobile } from '../../../utils/phone.util';
import { CustomerRepository } from '../../customer/repositories/customer.repository';
import { VendorRepository } from '../../vendor/repositories/vendor.repository';
import { formatVendorProfile } from '../../vendor/services/vendor.service';
import { OtpRepository } from '../repositories/otp.repository';
import {
  LookupAccountInput,
  OtpPurposeInput,
  RequestOtpInput,
  ResolvedAccount,
  VerifyOtpInput,
} from '../types/auth.types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONE_HOUR_MS = 60 * 60 * 1000;

const toOtpRole = (role: AuthRole): OtpRole => (role === AuthRoles.VENDOR ? 'VENDOR' : 'CUSTOMER');
const toOtpPurpose = (purpose: OtpPurposeInput): OtpPurpose =>
  purpose === 'register' ? 'REGISTER' : 'LOGIN';

export class AuthService {
  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly vendorRepository: VendorRepository,
    private readonly customerRepository: CustomerRepository,
  ) {}

  // Resolves an email or mobile number to the account that should receive the code.
  async lookup(input: LookupAccountInput) {
    const account = await this.resolveLoginAccount(input.identifier, input.role);
    return {
      role: account.role,
      identifier: this.normalizeIdentifier(input.identifier).value,
      channel: 'email' as const,
      destination: maskEmail(account.email),
    };
  }

  async requestOtp(input: RequestOtpInput) {
    const account = await this.resolveForPurpose(input);
    const key = {
      email: account.email,
      role: toOtpRole(account.role),
      purpose: toOtpPurpose(input.purpose),
    };
    const now = Date.now();

    const active = await this.otpRepository.findLatestActive(key);
    if (active && active.resendAvailableAt.getTime() > now) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, ValidationMessages.OTP_COOLDOWN);
    }
    const recent = await this.otpRepository.countSince(account.email, new Date(now - ONE_HOUR_MS));
    if (recent >= OTP_CONFIG.MAX_REQUESTS_PER_HOUR) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, ValidationMessages.OTP_HOURLY_LIMIT);
    }

    const code = generateOtpCode();
    const challenge = await this.otpRepository.replaceActive(key, {
      codeHash: hashOtpCode(account.email, code),
      expiresAt: new Date(now + OTP_CONFIG.EXPIRES_IN_SECONDS * 1000),
      resendAvailableAt: new Date(now + OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000),
    });

    const sent = await sendOtpEmail({
      email: account.email,
      name: account.name,
      code,
      expiresInMinutes: OTP_CONFIG.EXPIRES_IN_SECONDS / 60,
    });
    if (!sent.success) {
      await this.otpRepository.deleteById(challenge.id);
      throw new ApiError(StatusCodes.BAD_GATEWAY, ValidationMessages.OTP_SEND_FAILED);
    }
    if (env.DISABLE_EMAIL && env.NODE_ENV !== 'production') {
      console.info(`[dev] OTP for ${account.email} (${account.role}): ${code}`);
    }

    return {
      role: account.role,
      destination: maskEmail(account.email),
      expiresAt: challenge.expiresAt.getTime(),
      resendAt: challenge.resendAvailableAt.getTime(),
    };
  }

  async verifyOtp(input: VerifyOtpInput) {
    const account = await this.resolveForPurpose(input);
    const key = {
      email: account.email,
      role: toOtpRole(account.role),
      purpose: toOtpPurpose(input.purpose),
    };

    const challenge = await this.otpRepository.findLatestActive(key);
    if (!challenge) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.OTP_REQUEST_NEW);
    }
    if (challenge.expiresAt.getTime() < Date.now()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.OTP_EXPIRED);
    }
    const counted = await this.otpRepository.registerAttempt(challenge.id, OTP_CONFIG.MAX_ATTEMPTS);
    if (!counted) {
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, ValidationMessages.OTP_ATTEMPTS_EXCEEDED);
    }
    if (!isOtpCodeMatch(account.email, input.code, challenge.codeHash)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.OTP_INVALID);
    }
    if (!(await this.otpRepository.consume(challenge.id))) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.OTP_REQUEST_NEW);
    }

    return this.issueSession(account, input.purpose);
  }

  private async issueSession(account: ResolvedAccount, purpose: OtpPurposeInput) {
    if (account.role === AuthRoles.VENDOR) {
      const isNewAccount = purpose === 'register';
      const vendor = isNewAccount
        ? await this.vendorRepository.createFromVerifiedEmail(account.email)
        : await this.vendorRepository.findByEmail(account.email);
      // Re-read through the profile select so the password hash is never returned.
      const profile = vendor && (await this.vendorRepository.findById(vendor.id));
      if (!profile) throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
      return {
        token: generateToken(profile.id, AuthRoles.VENDOR),
        role: AuthRoles.VENDOR,
        isNewAccount,
        user: formatVendorProfile(profile),
      };
    }

    const customer = await this.customerRepository.findByEmail(account.email);
    if (!customer) throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.CUSTOMER_NOT_FOUND);
    return {
      token: generateToken(customer.id, AuthRoles.CUSTOMER),
      role: AuthRoles.CUSTOMER,
      isNewAccount: false,
      user: customer,
    };
  }

  private async resolveForPurpose(input: RequestOtpInput): Promise<ResolvedAccount> {
    if (input.purpose !== 'register') {
      return this.resolveLoginAccount(input.identifier, input.role);
    }

    // Registration is for business owners only and always uses email.
    if (input.role !== AuthRoles.VENDOR) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.ONLY_VENDORS_REGISTER);
    }
    const { kind, value } = this.normalizeIdentifier(input.identifier);
    if (kind !== 'email') {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.REGISTER_WITH_EMAIL);
    }
    if (await this.vendorRepository.findByEmail(value)) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.VENDOR_EXISTS_WITH_EMAIL);
    }
    return { role: AuthRoles.VENDOR, email: value, name: 'there', exists: false };
  }

  // Vendors take precedence when an email belongs to both, unless a role is requested.
  private async resolveLoginAccount(identifier: string, role?: AuthRole): Promise<ResolvedAccount> {
    const { kind, value } = this.normalizeIdentifier(identifier);

    if (role !== AuthRoles.CUSTOMER) {
      const vendors =
        kind === 'email'
          ? [await this.vendorRepository.findByEmail(value)].filter(v => v !== null)
          : await this.vendorRepository.findByPhone(value);
      if (vendors.length > 1) {
        throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.ACCOUNT_AMBIGUOUS);
      }
      const [vendor] = vendors;
      if (vendor) {
        if (!vendor.active) {
          throw new ApiError(StatusCodes.FORBIDDEN, ValidationMessages.ACCOUNT_INACTIVE);
        }
        const name = `${vendor.firstName} ${vendor.lastName}`.trim() || vendor.businessName || '';
        return { role: AuthRoles.VENDOR, email: vendor.email, name, exists: true };
      }
    }

    if (role !== AuthRoles.VENDOR) {
      const customers =
        kind === 'email'
          ? [await this.customerRepository.findByEmail(value)].filter(c => c !== null)
          : await this.customerRepository.findByPhone(value);
      if (customers.length > 1) {
        throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.ACCOUNT_AMBIGUOUS);
      }
      const [customer] = customers;
      if (customer) {
        if (!customer.active) {
          throw new ApiError(StatusCodes.FORBIDDEN, ValidationMessages.ACCOUNT_INACTIVE);
        }
        return {
          role: AuthRoles.CUSTOMER,
          email: customer.email,
          name: customer.name,
          exists: true,
        };
      }
    }

    throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.ACCOUNT_NOT_FOUND);
  }

  private normalizeIdentifier(identifier: string): { kind: 'email' | 'mobile'; value: string } {
    const value = identifier.trim();
    if (value.includes('@')) {
      if (!EMAIL_PATTERN.test(value)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.ENTER_VALID_IDENTIFIER);
      }
      return { kind: 'email', value: value.toLowerCase() };
    }
    if (!isValidIndianMobile(value)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.ENTER_VALID_IDENTIFIER);
    }
    return { kind: 'mobile', value: normalizeIndianMobile(value) };
  }
}

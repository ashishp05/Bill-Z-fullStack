import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { BCRYPT_SALT_ROUNDS } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { generateToken } from '../../../utils/generate-token.util';
import { AdminRepository } from '../repositories/admin.repository';
import {
  AdminAuthResponse,
  AdminLoginInput,
  AdminProfileResponse,
  AdminRegisterInput,
  AdminRoles,
} from '../types/admin.types';

const formatAdminProfile = (admin: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AdminProfileResponse => ({
  id: admin.id,
  name: admin.name,
  email: admin.email,
  image: admin.image ?? null,
  active: admin.active,
  createdAt: admin.createdAt,
  updatedAt: admin.updatedAt,
});

const formatAdminAuthPayload = (
  token: string,
  admin: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
): AdminAuthResponse => {
  const profile = formatAdminProfile(admin);
  const nameParts = (admin.name || '').trim().split(' ');
  const firstName = nameParts[0] || 'Admin';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    token,
    accessToken: token,
    admin: profile,
    user: {
      _id: admin.id,
      id: admin.id,
      name: admin.name,
      firstName,
      lastName,
      email: admin.email,
      role: AdminRoles.SUPER_ADMIN,
      isActive: admin.active,
    },
  };
};

export class AdminAuthService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async addAdmin(data: AdminRegisterInput): Promise<{ admin: AdminProfileResponse }> {
    const existingAdmin = await this.adminRepository.findByEmail(data.email);
    if (existingAdmin) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.ADMIN_EXISTS_WITH_EMAIL);
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const newAdmin = await this.adminRepository.create({
      ...data,
      password: hashedPassword,
    });

    return {
      admin: formatAdminProfile(newAdmin),
    };
  }

  async register(data: AdminRegisterInput): Promise<AdminAuthResponse> {
    const existingAdmin = await this.adminRepository.findByEmail(data.email);
    if (existingAdmin) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.ADMIN_EXISTS_WITH_EMAIL);
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const newAdmin = await this.adminRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken(newAdmin.id, AdminRoles.SUPER_ADMIN);
    return formatAdminAuthPayload(token, newAdmin);
  }

  async login(data: AdminLoginInput): Promise<AdminAuthResponse> {
    const admin = await this.adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.ADMIN_NOT_FOUND);
    }

    if (!admin.active) {
      throw new ApiError(StatusCodes.FORBIDDEN, ValidationMessages.ACCOUNT_INACTIVE);
    }

    const isPasswordValid = await bcrypt.compare(data.password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ValidationMessages.INVALID_CREDENTIALS);
    }

    const token = generateToken(admin.id, AdminRoles.SUPER_ADMIN);
    return formatAdminAuthPayload(token, admin);
  }

  async getProfile(adminId: string): Promise<AdminProfileResponse> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.ADMIN_NOT_FOUND);
    }

    return formatAdminProfile(admin);
  }

  async changePassword(
    adminId: string,
    data: { oldPassword: string; newPassword: string },
  ): Promise<boolean> {
    const admin = await this.adminRepository.findByIdWithPassword(adminId);
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.ADMIN_NOT_FOUND);
    }

    const isOldPasswordValid = await bcrypt.compare(data.oldPassword, admin.password);
    if (!isOldPasswordValid) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.OLD_PASSWORD_INCORRECT);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, BCRYPT_SALT_ROUNDS);
    await this.adminRepository.updatePassword(adminId, hashedPassword);

    return true;
  }
}

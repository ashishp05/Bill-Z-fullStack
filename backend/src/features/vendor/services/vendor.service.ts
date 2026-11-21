import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';

import { BCRYPT_SALT_ROUNDS } from '../../../constants/config.constants';
import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { deleteFile, getFileUrl } from '../../../utils/file-upload.util';
import { generateToken } from '../../../utils/generate-token.util';
import { VendorRepository } from '../repositories/vendor.repository';
import {
  VendorLoginInput,
  VendorRegisterInput,
  VendorSettingsInput,
  VendorUpdateProfileInput,
} from '../types/vendor.types';

export const formatVendorProfile = <T extends { profilePicture?: string | null }>(
  vendor: T | null,
) => {
  if (!vendor) return null;
  return {
    ...vendor,
    profilePictureUrl: getFileUrl(vendor.profilePicture),
  };
};

export class VendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async register(data: VendorRegisterInput) {
    const existingVendor = await this.vendorRepository.findByEmail(data.email);
    if (existingVendor) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.VENDOR_EXISTS_WITH_EMAIL);
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const newVendor = await this.vendorRepository.create({
      ...data,
      password: hashedPassword,
    });
    await this.vendorRepository.getOrCreateSettings(newVendor.id);

    const token = generateToken(newVendor.id, 'vendor');
    return {
      token,
      vendor: formatVendorProfile(newVendor),
    };
  }

  async login(data: VendorLoginInput) {
    const vendor = await this.vendorRepository.findByEmail(data.email);
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    if (!vendor.active) {
      throw new ApiError(StatusCodes.FORBIDDEN, ValidationMessages.ACCOUNT_INACTIVE);
    }

    // Vendors created through email OTP have no password.
    const isPasswordValid =
      !!vendor.password && (await bcrypt.compare(data.password, vendor.password));
    if (!isPasswordValid) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ValidationMessages.INVALID_CREDENTIALS);
    }

    const token = generateToken(vendor.id, 'vendor');
    const { password: _, ...vendorData } = vendor;

    return {
      token,
      vendor: formatVendorProfile(vendorData),
    };
  }

  async getProfile(vendorId: string) {
    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    return formatVendorProfile(vendor);
  }

  async updateProfile(vendorId: string, data: VendorUpdateProfileInput) {
    const existing = await this.vendorRepository.findById(vendorId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    if (
      data.profilePicture &&
      existing.profilePicture &&
      existing.profilePicture !== data.profilePicture
    ) {
      void deleteFile(existing.profilePicture);
    }

    const updated = await this.vendorRepository.update(vendorId, data);
    return formatVendorProfile(updated);
  }

  async updateProfilePicture(vendorId: string, imagePath: string) {
    const existing = await this.vendorRepository.findById(vendorId);
    if (!existing) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    if (existing.profilePicture && existing.profilePicture !== imagePath) {
      void deleteFile(existing.profilePicture);
    }

    const updated = await this.vendorRepository.updateProfilePicture(vendorId, imagePath);
    return formatVendorProfile(updated);
  }

  async getSettings(vendorId: string) {
    return this.vendorRepository.getOrCreateSettings(vendorId);
  }

  async updateSettings(vendorId: string, data: VendorSettingsInput) {
    const current = await this.vendorRepository.getOrCreateSettings(vendorId);
    const prefix = data.invoicePrefix ?? current.invoicePrefix;

    // Never allow a sequence that would reuse an existing invoice number under the same prefix.
    if (data.nextInvoiceNumber !== undefined) {
      const highest = await this.vendorRepository.findHighestInvoiceSequence(vendorId, prefix);
      if (data.nextInvoiceNumber <= highest) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.INVOICE_NUMBER_TOO_LOW);
      }
    }

    return this.vendorRepository.updateSettings(vendorId, data);
  }
}

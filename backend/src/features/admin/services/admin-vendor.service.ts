import { StatusCodes } from 'http-status-codes';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { getFileUrl } from '../../../utils/file-upload.util';
import { VendorRepository } from '../../vendor/repositories/vendor.repository';
import { AdminVendorQueryFilterInput, VendorsListingResponse } from '../types/admin.types';

export class AdminVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async getVendors(
    filter: Partial<AdminVendorQueryFilterInput> = {},
  ): Promise<VendorsListingResponse> {
    const { total, records } = await this.vendorRepository.findAllVendors(filter);

    const formattedRecords = records.map(vendor => ({
      ...vendor,
      profilePictureUrl: getFileUrl(vendor.profilePicture),
    }));

    return {
      ...(total !== undefined ? { total } : {}),
      records: formattedRecords,
    };
  }

  async getVendorById(vendorId: string) {
    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    return {
      ...vendor,
      profilePictureUrl: getFileUrl(vendor.profilePicture),
    };
  }

  async updateVendorStatus(vendorId: string, active: boolean) {
    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) {
      throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.VENDOR_NOT_FOUND);
    }

    const updated = await this.vendorRepository.updateStatus(vendorId, active);
    return {
      ...updated,
      profilePictureUrl: getFileUrl(updated.profilePicture),
    };
  }
}

import { StatusCodes } from 'http-status-codes';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { CustomerRepository } from '../repositories/customer.repository';
import {
  CreateVendorCustomerInput,
  UpdateCustomerProfileInput,
  UpdateVendorCustomerInput,
  VendorCustomerQueryInput,
} from '../types/customer.types';

export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async listForVendor(vendorId: string, query: VendorCustomerQueryInput) {
    return this.customerRepository.findVendorCustomers(vendorId, query);
  }

  async getForVendor(vendorId: string, id: string) {
    const customer = await this.customerRepository.findVendorCustomer(vendorId, id);
    if (!customer) throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.CUSTOMER_NOT_FOUND);
    return customer;
  }

  async createForVendor(vendorId: string, data: CreateVendorCustomerInput) {
    const created = await this.customerRepository.createVendorCustomer(vendorId, data);
    if (!created) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.CUSTOMER_ALREADY_ADDED);
    }
    return created;
  }

  async updateForVendor(vendorId: string, id: string, data: UpdateVendorCustomerInput) {
    await this.getForVendor(vendorId, id);
    const updated = await this.customerRepository.updateVendorCustomer(vendorId, id, data);
    if (!updated) {
      throw new ApiError(StatusCodes.CONFLICT, ValidationMessages.CUSTOMER_ALREADY_ADDED);
    }
    return updated;
  }

  async getProfile(customerId: string) {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.CUSTOMER_NOT_FOUND);
    return customer;
  }

  async updateProfile(customerId: string, data: UpdateCustomerProfileInput) {
    await this.getProfile(customerId);
    return this.customerRepository.updateProfile(customerId, data);
  }
}

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages } from '../../../constants/messages';
import { sendJsonResponse } from '../../../utils/response.util';
import { CustomerService } from '../services/customer.service';
import {
  CreateVendorCustomerInput,
  UpdateCustomerProfileInput,
  UpdateVendorCustomerInput,
  VendorCustomerQueryInput,
} from '../types/customer.types';

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Vendor: manage own customer list

  getAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as VendorCustomerQueryInput;
    const result = await this.customerService.listForVendor(req.userId as string, query);
    sendJsonResponse(res, result, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  getById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const customer = await this.customerService.getForVendor(req.userId as string, req.params.id);
    sendJsonResponse(res, customer, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  create = async (
    req: Request<{}, {}, CreateVendorCustomerInput>,
    res: Response,
  ): Promise<void> => {
    const customer = await this.customerService.createForVendor(req.userId as string, req.body);
    sendJsonResponse(res, customer, ResponseMessages.CREATED, StatusCodes.CREATED);
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateVendorCustomerInput>,
    res: Response,
  ): Promise<void> => {
    const customer = await this.customerService.updateForVendor(
      req.userId as string,
      req.params.id,
      req.body,
    );
    sendJsonResponse(res, customer, ResponseMessages.UPDATED, StatusCodes.OK);
  };

  // Customer: own profile

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const profile = await this.customerService.getProfile(req.userId as string);
    sendJsonResponse(res, profile, ResponseMessages.PROFILE_FETCH_SUCCESS, StatusCodes.OK);
  };

  updateProfile = async (
    req: Request<{}, {}, UpdateCustomerProfileInput>,
    res: Response,
  ): Promise<void> => {
    const profile = await this.customerService.updateProfile(req.userId as string, req.body);
    sendJsonResponse(res, profile, ResponseMessages.PROFILE_UPDATED_SUCCESS, StatusCodes.OK);
  };
}

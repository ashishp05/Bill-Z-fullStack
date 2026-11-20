import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages } from '../../../constants/messages';
import { sendJsonResponse } from '../../../utils/response.util';
import { AdminVendorService } from '../services/admin-vendor.service';
import { AdminVendorQueryFilterInput, AdminVendorStatusInput } from '../types/admin.types';

export class AdminVendorController {
  constructor(private readonly adminVendorService: AdminVendorService) {}

  getAllVendors = async (req: Request, res: Response): Promise<void> => {
    const filter = req.query as unknown as AdminVendorQueryFilterInput;
    const result = await this.adminVendorService.getVendors(filter);
    sendJsonResponse(res, result, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  getVendorById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const { id } = req.params;
    const vendor = await this.adminVendorService.getVendorById(id);
    sendJsonResponse(res, vendor, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  updateVendorStatus = async (
    req: Request<{ id: string }, {}, AdminVendorStatusInput>,
    res: Response,
  ): Promise<void> => {
    const { id } = req.params;
    const { active } = req.body;
    const updated = await this.adminVendorService.updateVendorStatus(id, active);
    sendJsonResponse(res, updated, ResponseMessages.STATUS_UPDATED_SUCCESS, StatusCodes.OK);
  };
}

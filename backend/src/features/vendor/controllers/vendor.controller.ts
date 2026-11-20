import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages, ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { sendJsonResponse } from '../../../utils/response.util';
import { VendorService } from '../services/vendor.service';
import {
  VendorLoginInput,
  VendorRegisterInput,
  VendorUpdateProfileInput,
} from '../types/vendor.types';

export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  register = async (req: Request<{}, {}, VendorRegisterInput>, res: Response): Promise<void> => {
    const result = await this.vendorService.register(req.body);
    sendJsonResponse(res, result, ResponseMessages.REGISTRATION_SUCCESSFUL, StatusCodes.CREATED);
  };

  login = async (req: Request<{}, {}, VendorLoginInput>, res: Response): Promise<void> => {
    console.log('req.body', req.body);
    const result = await this.vendorService.login(req.body);
    sendJsonResponse(res, result, ResponseMessages.LOGIN_SUCCESSFUL, StatusCodes.OK);
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.userId;
    if (!vendorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ValidationMessages.UNAUTHORIZED);
    }

    const profile = await this.vendorService.getProfile(vendorId);
    sendJsonResponse(res, profile, ResponseMessages.PROFILE_FETCH_SUCCESS, StatusCodes.OK);
  };

  updateProfile = async (
    req: Request<{}, {}, VendorUpdateProfileInput>,
    res: Response,
  ): Promise<void> => {
    const vendorId = req.userId;
    if (!vendorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ValidationMessages.UNAUTHORIZED);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (req as any).file;
    const updateData = { ...req.body };
    if (file && (file.url || file.localPath)) {
      updateData.profilePicture = file.url || file.localPath;
    }

    const updated = await this.vendorService.updateProfile(vendorId, updateData);
    sendJsonResponse(res, updated, ResponseMessages.PROFILE_UPDATED_SUCCESS, StatusCodes.OK);
  };

  uploadProfilePicture = async (req: Request, res: Response): Promise<void> => {
    const vendorId = req.userId;
    if (!vendorId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, ValidationMessages.UNAUTHORIZED);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = (req as any).file;
    if (!file || (!file.url && !file.localPath)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.required('profilePicture'));
    }

    const filePath = file.url || file.localPath;
    const updated = await this.vendorService.updateProfilePicture(vendorId, filePath);
    sendJsonResponse(res, updated, ResponseMessages.PROFILE_UPDATED_SUCCESS, StatusCodes.OK);
  };
}

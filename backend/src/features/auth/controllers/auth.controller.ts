import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages } from '../../../constants/messages';
import { sendJsonResponse } from '../../../utils/response.util';
import { AuthService } from '../services/auth.service';
import { LookupAccountInput, RequestOtpInput, VerifyOtpInput } from '../types/auth.types';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  lookup = async (req: Request<{}, {}, LookupAccountInput>, res: Response): Promise<void> => {
    const result = await this.authService.lookup(req.body);
    sendJsonResponse(res, result, ResponseMessages.ACCOUNT_FOUND, StatusCodes.OK);
  };

  requestOtp = async (req: Request<{}, {}, RequestOtpInput>, res: Response): Promise<void> => {
    const result = await this.authService.requestOtp(req.body);
    sendJsonResponse(res, result, ResponseMessages.OTP_SENT, StatusCodes.OK);
  };

  verifyOtp = async (req: Request<{}, {}, VerifyOtpInput>, res: Response): Promise<void> => {
    const result = await this.authService.verifyOtp(req.body);
    sendJsonResponse(res, result, ResponseMessages.OTP_VERIFIED, StatusCodes.OK);
  };
}

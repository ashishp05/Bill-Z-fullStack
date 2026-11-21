import { z } from 'zod';

import { AuthRole } from '../../../constants/config.constants';
import { lookupAccountSchema, requestOtpSchema, verifyOtpSchema } from '../schemas/auth.schema';

export type LookupAccountInput = z.infer<typeof lookupAccountSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type OtpPurposeInput = RequestOtpInput['purpose'];

export interface ResolvedAccount {
  role: AuthRole;
  email: string;
  name: string;
  exists: boolean;
}

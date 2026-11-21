import { apiClient, request } from "./client";
import type {
  AccountLookup,
  AuthService,
  DemoSession,
  OtpPurpose,
} from "../services/auth.service";
import type { AuthUser, UserRole } from "../types/auth.types";

interface ApiSession {
  token: string;
  role: UserRole;
  isNewAccount: boolean;
  user: Record<string, unknown> & {
    id: string;
    email: string;
    active: boolean;
  };
}

const toUser = (session: ApiSession): AuthUser => {
  const u = session.user;
  if (session.role === "vendor")
    return {
      role: "vendor",
      id: u.id,
      email: u.email,
      active: u.active,
      firstName: String(u.firstName ?? ""),
      lastName: String(u.lastName ?? ""),
      businessName: (u.businessName as string | null) ?? null,
      phoneNumber: (u.phoneNumber as string | null) ?? null,
      profilePictureUrl: (u.profilePictureUrl as string | null) ?? null,
    };
  return {
    role: "customer",
    id: u.id,
    email: u.email,
    active: u.active,
    name: String(u.name ?? ""),
    phone: (u.phone as string | null) ?? null,
  };
};

/**
 * Email OTP against the API. The identifier (email or mobile) is passed through as the
 * "email" argument of the AuthService contract; the server resolves it to the account email.
 */
export const apiAuthService: AuthService = {
  async findAccount(identifier) {
    const result = await request<{
      role: UserRole;
      identifier: string;
      channel: "email";
      destination: string;
    }>(apiClient.post("/auth/lookup", { identifier }));
    const lookup: AccountLookup = {
      role: result.role,
      email: result.identifier,
      channel: result.channel,
      destination: result.destination,
    };
    return lookup;
  },

  async requestOtp(identifier, role, purpose: OtpPurpose = "login") {
    const result = await request<{
      expiresAt: number;
      resendAt: number;
      destination: string;
    }>(apiClient.post("/auth/request-otp", { identifier, role, purpose }));
    return result;
  },

  async verifyOtp(
    identifier,
    code,
    role,
    purpose: OtpPurpose = "login",
  ): Promise<DemoSession> {
    const session = await request<ApiSession>(
      apiClient.post("/auth/verify-otp", { identifier, role, purpose, code }),
    );
    return { token: session.token, user: toUser(session) };
  },

  async updateCustomerProfile(patch) {
    const saved = await request<{ name: string; phone: string | null }>(
      apiClient.put("/customer/profile", patch),
    );
    return { name: saved.name, phone: saved.phone ?? "" };
  },
};

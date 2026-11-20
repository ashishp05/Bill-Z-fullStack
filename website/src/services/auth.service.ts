import seed from "../data/demo.json";
import type { AuthUser, UserRole } from "../types/auth.types";
export interface DemoSession {
  user: AuthUser;
  token: string;
}
/** Result of resolving a login identifier (email or mobile) to an existing account. */
export interface AccountLookup {
  role: UserRole;
  email: string;
  channel: "email" | "sms";
  /** Where the code is sent, shown on the OTP screen. */
  destination: string;
}
export interface AuthService {
  findAccount(identifier: string): Promise<AccountLookup>;
  requestOtp(
    email: string,
    role: UserRole,
  ): Promise<{ expiresAt: number; resendAt: number }>;
  verifyOtp(email: string, code: string, role: UserRole): Promise<DemoSession>;
}
interface Challenge {
  email: string;
  role: UserRole;
  expiresAt: number;
  resendAt: number;
  attempts: number;
  used: boolean;
}
let challenge: Challenge | undefined;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Last 10 digits of an Indian mobile number, ignoring +91, spaces and dashes. */
const mobileKey = (value: string) => value.replace(/\D/g, "").slice(-10);
/** UI simulation only. Production code generation, email delivery and verification belong on the server. */
export const authService: AuthService = {
  async findAccount(identifier) {
    const value = identifier.trim();
    const isEmail = value.includes("@");
    if (isEmail ? !EMAIL_PATTERN.test(value) : mobileKey(value).length !== 10)
      throw new Error("Enter a valid email address or 10-digit mobile number.");
    const email = value.toLowerCase();
    const key = mobileKey(value);
    const matches = (candidate: { email: string; phone: string }) =>
      isEmail ? candidate.email.toLowerCase() === email : mobileKey(candidate.phone) === key;
    const vendor = { email: seed.profile.email, phone: seed.profile.phoneNumber };
    const customer = seed.customers.find((c) => matches(c));
    const account = matches(vendor)
      ? { role: "vendor" as const, ...vendor }
      : customer
        ? { role: "customer" as const, email: customer.email, phone: customer.phone }
        : undefined;
    if (!account)
      throw new Error(
        "We couldn’t find an account with these details. Business owners can register below.",
      );
    return {
      role: account.role,
      email: account.email.toLowerCase(),
      channel: isEmail ? "email" : "sms",
      destination: isEmail ? account.email.toLowerCase() : account.phone,
    };
  },
  async requestOtp(email, role) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw new Error("Enter a valid email address.");
    const now = Date.now();
    if (
      challenge?.email === email &&
      challenge.role === role &&
      now < challenge.resendAt
    )
      throw new Error("Please wait before requesting another code.");
    challenge = {
      email,
      role,
      expiresAt: now + seed.demoAuth.expiresInSeconds * 1000,
      resendAt: now + seed.demoAuth.cooldownSeconds * 1000,
      attempts: 0,
      used: false,
    };
    return { expiresAt: challenge.expiresAt, resendAt: challenge.resendAt };
  },
  async verifyOtp(email, code, role) {
    if (
      !challenge ||
      challenge.email !== email ||
      challenge.role !== role ||
      challenge.used
    )
      throw new Error("Request a new verification code.");
    if (Date.now() > challenge.expiresAt)
      throw new Error("This code has expired. Request a new code.");
    if (challenge.attempts >= seed.demoAuth.maxAttempts)
      throw new Error("Attempt limit reached. Please request a new code.");
    challenge.attempts += 1;
    if (code !== seed.demoAuth.code)
      throw new Error("That code is incorrect. Please try again.");
    challenge.used = true;
    const user: AuthUser =
      role === "vendor"
        ? {
            id: "vendor-1",
            firstName: "Rohan",
            lastName: "Mehta",
            email,
            businessName: seed.profile.businessName,
            phoneNumber: seed.profile.phoneNumber,
            role,
            active: true,
          }
        : {
            id:
              seed.customers.find((c) => c.email === email)?.id ||
              "demo-customer",
            name:
              seed.customers.find((c) => c.email === email)?.name ||
              email.split("@")[0],
            email,
            phone: seed.customers.find((c) => c.email === email)?.phone || "",
            role,
            active: true,
          };
    return { user, token: `demo-${role}-session` };
  },
};

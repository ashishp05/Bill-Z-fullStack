import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.service";
import type { DemoSession } from "../services/auth.service";
import type {
  AuthUser,
  UserRole,
  VendorRegisterInput,
  CustomerRegisterInput,
  VendorLoginInput,
  CustomerLoginInput,
} from "../types/auth.types";
function restore(): DemoSession | null {
  try {
    const v = JSON.parse(localStorage.getItem("billz-demo-session") || "null");
    return v?.token?.startsWith("demo-") &&
      ["vendor", "customer"].includes(v?.user?.role)
      ? v
      : null;
  } catch {
    return null;
  }
}
function useAuthState() {
  const [session, setSession] = useState(restore);
  const [role, setRole] = useState<UserRole>(session?.user.role || "vendor");
  const save = (next: DemoSession) => {
    setSession(next);
    setRole(next.user.role);
    try {
      localStorage.setItem("billz-demo-session", JSON.stringify(next));
    } catch {
      /* In-memory session remains usable. */
    }
  };
  const verifyOtp = async (email: string, code: string, nextRole: UserRole) =>
    save(await authService.verifyOtp(email, code, nextRole));
  const updateUser = (patch: Partial<AuthUser>) => {
    if (session)
      save({ ...session, user: { ...session.user, ...patch } as AuthUser });
  };
  const logout = () => {
    setSession(null);
    localStorage.removeItem("billz-demo-session");
  };
  const legacyLogin = async (_data: VendorLoginInput | CustomerLoginInput) => {
    throw new Error("Use email verification to sign in to this demo.");
  };
  const legacyRegister = async (
    _data: VendorRegisterInput | CustomerRegisterInput,
  ) => {
    throw new Error("Use the email verification and onboarding flow.");
  };
  return {
    user: session?.user || null,
    token: session?.token || null,
    role,
    setRole,
    isAuthenticated: !!session,
    isLoading: false,
    findAccount: authService.findAccount,
    requestOtp: authService.requestOtp,
    verifyOtp,
    updateUser,
    logout,
    loginVendor: legacyLogin,
    loginCustomer: legacyLogin,
    registerVendor: legacyRegister,
    registerCustomer: legacyRegister,
  };
}
const AuthContext = createContext<ReturnType<typeof useAuthState> | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={useAuthState()}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is missing");
  return context;
}

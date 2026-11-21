/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: "mock" | "api";
  readonly VITE_API_URL?: string;
  readonly VITE_SHOW_DEMO_LOGINS?: string;
  readonly VITE_DEMO_OTP_CODE?: string;
}

/**
 * Where the app reads and writes data.
 * - "mock" (default): typed in-browser mocks seeded from src/data/demo.json. No backend needed.
 * - "api": the Bill-Z REST API at VITE_API_URL.
 */
export const USE_API = import.meta.env.VITE_DATA_SOURCE === "api";

/** Demo logins are always shown in mock mode; in API mode only when explicitly enabled (dev/staging). */
export const SHOW_DEMO_LOGINS =
  !USE_API || import.meta.env.VITE_SHOW_DEMO_LOGINS === "true";

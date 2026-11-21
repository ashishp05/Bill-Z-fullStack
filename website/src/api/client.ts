import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

/** localStorage key holding `{ user, token }` for the signed-in vendor or customer. */
export const SESSION_KEY = "billz-session";

export const readSessionToken = (): string | null => {
  try {
    return (
      JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.token ?? null
    );
  } catch {
    return null;
  }
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = readSessionToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or revoked token: drop the session and return to sign-in.
    if (error.response?.status === 401 && readSessionToken()) {
      localStorage.removeItem(SESSION_KEY);
      window.location.assign("/auth");
    }
    return Promise.reject(error);
  },
);

/** The backend envelope: `{ success, message, data }`. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Turns an axios error into the user-facing message the API sent. */
export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return "You’re offline or the server can’t be reached.";
    const body = error.response.data as
      { message?: string; errors?: { message: string }[] } | undefined;
    return body?.errors?.[0]?.message || body?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

/** Unwraps `data` and rethrows API errors as plain `Error`s with the server message. */
export async function request<T>(
  promise: Promise<{ data: ApiEnvelope<T> }>,
): Promise<T> {
  try {
    return (await promise).data.data;
  } catch (error) {
    throw new Error(apiErrorMessage(error));
  }
}

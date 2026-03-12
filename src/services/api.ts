import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

export type ApiVersion = "v1" | "v2";

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  details?: unknown;
}

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:10003";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const apiOrigin = normalizedBaseUrl.replace(/\/api\/v\d+$/, "");

export const buildApiPath = (version: ApiVersion, path: string) =>
  `/api/${version}${path.startsWith("/") ? path : `/${path}`}`;

export const buildApiUrl = (version: ApiVersion, path: string) => `${apiOrigin}${buildApiPath(version, path)}`;

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const api = axios.create({
  baseURL: apiOrigin,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

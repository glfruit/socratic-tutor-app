import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const rawBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:10003";
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const apiOrigin = normalizedBaseUrl.replace(/\/api\/v\d+$/, "");

export const buildApiPath = (version: "v1" | "v2", path: string) =>
  `/api/${version}${path.startsWith("/") ? path : `/${path}`}`;

export const buildApiUrl = (version: "v1" | "v2", path: string) => `${apiOrigin}${buildApiPath(version, path)}`;

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

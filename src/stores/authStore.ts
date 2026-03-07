import { create } from "zustand";
import type { User, UserPreferences } from "@/types";

const TOKEN_KEY = "socratic_token";

const getStorage = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return typeof window.localStorage?.getItem === "function" ? window.localStorage : null;
  } catch {
    return null;
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  preferences: UserPreferences | null;
  login: (payload: { user: User; token: string; preferences?: UserPreferences | null }) => void;
  logout: () => void;
  setPreferences: (preferences: UserPreferences) => void;
}

const getInitialToken = () => {
  return getStorage()?.getItem(TOKEN_KEY) ?? null;
};

const initialToken = getInitialToken();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  preferences: null,
  login: ({ user, token, preferences = null }) => {
    getStorage()?.setItem(TOKEN_KEY, token);
    set({ user, token, preferences, isAuthenticated: true });
  },
  logout: () => {
    getStorage()?.removeItem(TOKEN_KEY);
    set({ user: null, token: null, preferences: null, isAuthenticated: false });
  },
  setPreferences: (preferences) => {
    set({ preferences });
  }
}));

export const authTokenKey = TOKEN_KEY;

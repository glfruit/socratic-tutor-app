import { create } from "zustand";
import type { User } from "@/types";

const TOKEN_KEY = "socratic_token";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: { user: User; token: string }) => void;
  logout: () => void;
}

const initialToken = localStorage.getItem(TOKEN_KEY);

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  login: ({ user, token }) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export const authTokenKey = TOKEN_KEY;

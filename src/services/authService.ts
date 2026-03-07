import { api } from "@/services/api";
import type { User, UserRole } from "@/types";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
  role: UserRole;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export const authService = {
  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const response = await api.post<AuthResponse>("/auth/login", input);
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  },

  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
    const response = await api.post<AuthResponse>("/auth/register", input);
    return {
      user: response.data.user,
      token: response.data.tokens.accessToken
    };
  }
};

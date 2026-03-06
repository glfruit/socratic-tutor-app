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

interface AuthResult {
  user: User;
  token: string;
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    const response = await api.post<AuthResult>("/auth/login", input);
    return response.data;
  },

  async register(input: RegisterInput): Promise<AuthResult> {
    const response = await api.post<AuthResult>("/auth/register", input);
    return response.data;
  }
};

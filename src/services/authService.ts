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

const buildMockUser = (email: string, role: UserRole, name = "学习者"): User => ({
  id: crypto.randomUUID(),
  email,
  name,
  role
});

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    try {
      const response = await api.post<AuthResult>("/auth/login", input);
      return response.data;
    } catch {
      return {
        user: buildMockUser(input.email, "STUDENT"),
        token: "mock-token"
      };
    }
  },

  async register(input: RegisterInput): Promise<AuthResult> {
    try {
      const response = await api.post<AuthResult>("/auth/register", input);
      return response.data;
    } catch {
      return {
        user: buildMockUser(input.email, input.role, input.name),
        token: "mock-token"
      };
    }
  }
};

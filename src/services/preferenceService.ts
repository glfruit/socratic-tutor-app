import { api, buildApiPath } from "@/services/api";
import { mockPreferences } from "@/services/mockData";
import type { UserPreferences } from "@/types";

export const preferenceService = {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<UserPreferences>(buildApiPath("v2", "/preferences"));
      return response.data;
    } catch {
      return mockPreferences;
    }
  },

  async updatePreferences(input: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await api.patch<UserPreferences>(buildApiPath("v2", "/preferences"), input);
      return response.data;
    } catch {
      return { ...mockPreferences, ...input };
    }
  }
};

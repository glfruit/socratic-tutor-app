import { api, buildApiPath } from "@/services/api";
import { mockPreferences } from "@/services/mockData";
import type { UserPreferences } from "@/types";

interface PreferenceApiResponse {
  level?: UserPreferences["defaultLevel"];
  subjects?: string[];
  aiModel?: string;
  theme?: UserPreferences["theme"];
}

interface UpdatePreferenceInput {
  defaultLevel?: UserPreferences["defaultLevel"];
  theme?: UserPreferences["theme"];
  subjects?: string[];
  aiModel?: string;
}

const normalizePreferences = (payload?: PreferenceApiResponse): UserPreferences => ({
  defaultLevel: payload?.level ?? mockPreferences.defaultLevel,
  theme: payload?.theme ?? mockPreferences.theme
});

export const preferenceService = {
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<PreferenceApiResponse>(buildApiPath("v2", "/preferences"));
      return normalizePreferences(response.data);
    } catch {
      return mockPreferences;
    }
  },

  async updatePreferences(input: UpdatePreferenceInput): Promise<UserPreferences> {
    const payload: PreferenceApiResponse = {
      level: input.defaultLevel,
      theme: input.theme,
      subjects: input.subjects,
      aiModel: input.aiModel
    };

    try {
      const response = await api.patch<PreferenceApiResponse>(buildApiPath("v2", "/preferences"), payload);
      return normalizePreferences({ ...payload, ...response.data });
    } catch {
      return {
        ...mockPreferences,
        ...(input.defaultLevel ? { defaultLevel: input.defaultLevel } : {}),
        ...(input.theme ? { theme: input.theme } : {})
      };
    }
  }
};

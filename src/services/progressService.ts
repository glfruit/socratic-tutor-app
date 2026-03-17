import { api, buildApiPath, USE_MOCKS } from "@/services/api";
import { mockMastery, mockProgressStats, mockRadar } from "@/services/mockData";
import type { MasteryRecord, ProgressStat } from "@/types";

interface ProgressData {
  stats: ProgressStat[];
  radar: Array<{ label: string; value: number }>;
  mastery: MasteryRecord[];
}

export const progressService = {
  async getDashboard(): Promise<ProgressData> {
    try {
      const response = await api.get<ProgressData>(buildApiPath("v1", "/progress/dashboard"));
      return response.data;
    } catch (error) {
      if (USE_MOCKS) {
        return {
          stats: mockProgressStats,
          radar: mockRadar,
          mastery: mockMastery
        };
      }
      throw error;
    }
  }
};

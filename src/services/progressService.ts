import { api } from "@/services/api";
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
      const response = await api.get<ProgressData>("/progress/dashboard");
      return response.data;
    } catch {
      return {
        stats: mockProgressStats,
        radar: mockRadar,
        mastery: mockMastery
      };
    }
  }
};

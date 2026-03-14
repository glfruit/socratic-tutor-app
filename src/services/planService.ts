import { api, buildApiPath } from "@/services/api";
import type { LearningPlan, LearningPlanStatus } from "@/types";

interface CreatePlanInput {
  title: string;
  description?: string;
  subject: string;
  targetDate?: string;
}

interface UpdatePlanInput {
  title?: string;
  description?: string;
  subject?: string;
  targetDate?: string;
  status?: LearningPlanStatus;
}

export const planService = {
  async create(input: CreatePlanInput): Promise<LearningPlan> {
    const response = await api.post<LearningPlan>(buildApiPath("v2", "/plans"), input);
    return response.data;
  },

  async list(status?: LearningPlanStatus): Promise<LearningPlan[]> {
    const params = status ? { status } : {};
    const response = await api.get<LearningPlan[]>(buildApiPath("v2", "/plans"), { params });
    return response.data;
  },

  async get(id: string): Promise<LearningPlan> {
    const response = await api.get<LearningPlan>(buildApiPath("v2", `/plans/${id}`));
    return response.data;
  },

  async update(id: string, input: UpdatePlanInput): Promise<LearningPlan> {
    const response = await api.patch<LearningPlan>(buildApiPath("v2", `/plans/${id}`), input);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(buildApiPath("v2", `/plans/${id}`));
  }
};

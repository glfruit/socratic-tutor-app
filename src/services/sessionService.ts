import axios from "axios";
import { api, buildApiPath } from "@/services/api";
import { mockSessionMaterials, mockSessions, mockSubjects } from "@/services/mockData";
import type { ChatMessage, SessionMaterial, SessionSummary, Subject } from "@/types";

interface CreateSessionInput {
  subject?: string;
  level?: string;
  title?: string;
  documentIds?: string[];
}

interface SendMessageResponse {
  user: ChatMessage;
  assistant: ChatMessage;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
};

const cloneMockSessionMaterials = (sessionId: string) =>
  (mockSessionMaterials[sessionId] ?? []).map((item) => ({ ...item }));

export const sessionService = {
  async getSessions(): Promise<SessionSummary[]> {
    try {
      const response = await api.get<SessionSummary[]>(buildApiPath("v1", "/sessions"));
      return response.data;
    } catch {
      return mockSessions;
    }
  },

  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await api.get<Subject[]>(buildApiPath("v1", "/subjects"));
      return response.data;
    } catch {
      return mockSubjects;
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      console.info("[sessionService] Loading session messages", { sessionId });
      const response = await api.get<ChatMessage[]>(buildApiPath("v1", `/sessions/${sessionId}/messages`));
      console.info("[sessionService] Loaded session messages", {
        sessionId,
        count: response.data.length
      });
      return response.data;
    } catch (error) {
      console.error("[sessionService] Failed to load session messages", { sessionId, error });
      throw new Error(getErrorMessage(error, "会话消息加载失败"));
    }
  },

  async createSession(input: CreateSessionInput = {}): Promise<SessionSummary> {
    try {
      console.info("[sessionService] Creating session", input);
      const response = await api.post<SessionSummary>(buildApiPath("v1", "/sessions"), input);
      console.info("[sessionService] Created session", { sessionId: response.data.id });
      return response.data;
    } catch (error) {
      console.error("[sessionService] Failed to create session", { input, error });
      throw new Error(getErrorMessage(error, "创建会话失败"));
    }
  },

  async getSessionMaterials(sessionId: string): Promise<SessionMaterial[]> {
    try {
      const response = await api.get<SessionMaterial[]>(buildApiPath("v1", `/sessions/${sessionId}/materials`));
      return response.data;
    } catch {
      return cloneMockSessionMaterials(sessionId);
    }
  },

  async uploadMaterial(sessionId: string, file: File): Promise<SessionMaterial> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post<SessionMaterial>(buildApiPath("v1", `/sessions/${sessionId}/upload`), formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch {
      const material: SessionMaterial = {
        id: crypto.randomUUID(),
        sessionId,
        filename: file.name,
        title: file.name.replace(/\.[^.]+$/, ""),
        status: "PROCESSING",
        createdAt: new Date().toISOString(),
        size: file.size
      };
      mockSessionMaterials[sessionId] = [material, ...(mockSessionMaterials[sessionId] ?? [])];
      return material;
    }
  },

  async deleteMaterial(sessionId: string, materialId: string): Promise<void> {
    try {
      await api.delete(buildApiPath("v1", `/sessions/${sessionId}/materials/${materialId}`));
    } catch {
      mockSessionMaterials[sessionId] = (mockSessionMaterials[sessionId] ?? []).filter((item) => item.id !== materialId);
    }
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
    try {
      console.info("[sessionService] Sending message", { sessionId, contentLength: content.length });
      const response = await api.post<SendMessageResponse>(buildApiPath("v1", `/sessions/${sessionId}/messages`), {
        content
      });
      console.info("[sessionService] Received assistant message", {
        sessionId,
        assistantMessageId: response.data.assistant.id
      });
      return response.data.assistant;
    } catch (error) {
      console.error("[sessionService] Failed to send message", { sessionId, error });
      throw new Error(getErrorMessage(error, "AI 对话暂时不可用"));
    }
  }
};

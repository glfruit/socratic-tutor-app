import { api } from "@/services/api";
import { mockMessages, mockSessions, mockSubjects } from "@/services/mockData";
import type { ChatMessage, SessionSummary, Subject } from "@/types";

export const sessionService = {
  async getSessions(): Promise<SessionSummary[]> {
    try {
      const response = await api.get<SessionSummary[]>("/sessions");
      return response.data;
    } catch {
      return mockSessions;
    }
  },

  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await api.get<Subject[]>("/subjects");
      return response.data;
    } catch {
      return mockSubjects;
    }
  },

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get<ChatMessage[]>(`/sessions/${sessionId}/messages`);
      return response.data;
    } catch {
      return mockMessages[sessionId] ?? [];
    }
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await api.post<ChatMessage>(`/sessions/${sessionId}/messages`, { content });
      return response.data;
    } catch {
      return {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `如果从已知条件出发，你会如何拆解“${content.slice(0, 20)}”这个问题？`,
        createdAt: new Date().toISOString(),
        hints: ["先列出已知", "找出未知", "尝试画图"]
      };
    }
  }
};

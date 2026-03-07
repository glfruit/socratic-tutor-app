import axios from "axios";
import { api, buildApiPath } from "@/services/api";
import { mockSessions, mockSubjects } from "@/services/mockData";
import type { ChatMessage, SessionSummary, Subject } from "@/types";

interface CreateSessionInput {
  subject?: string;
  level?: string;
  title?: string;
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
      const response = await api.get<ChatMessage[]>(buildApiPath("v1", `/sessions/${sessionId}/messages`));
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "会话消息加载失败"));
    }
  },

  async createSession(input: CreateSessionInput = {}): Promise<SessionSummary> {
    try {
      const response = await api.post<SessionSummary>(buildApiPath("v1", "/sessions"), input);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "创建会话失败"));
    }
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await api.post<SendMessageResponse>(buildApiPath("v1", `/sessions/${sessionId}/messages`), {
        content
      });
      return response.data.assistant;
    } catch (error) {
      throw new Error(getErrorMessage(error, "AI 对话暂时不可用"));
    }
  }
};

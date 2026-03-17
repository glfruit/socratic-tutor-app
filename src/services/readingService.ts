import axios from "axios";
import { api, buildApiPath, buildApiUrl, getApiErrorMessage, USE_MOCKS } from "@/services/api";
import { mockReadingSessions } from "@/services/mockData";
import type { ReadingMessageContext, ReadingSession } from "@/types";
import { useAuthStore } from "@/stores/authStore";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CreateReadingSessionInput {
  documentId: string;
  chapterId?: string;
}

interface SendReadingMessageInput {
  content: string;
  context?: ReadingMessageContext;
}

export const readingService = {
  async createSession(documentId: string, chapterId?: string): Promise<ReadingSession> {
    return this.createReadingSession({ documentId, chapterId });
  },

  async createReadingSession(input: CreateReadingSessionInput): Promise<ReadingSession> {
    try {
      const response = await api.post<ReadingSession>(buildApiPath("v2", "/reading-sessions"), input);
      return response.data;
    } catch (error) {
      if (USE_MOCKS) {
        const session = mockReadingSessions[input.documentId];
        return session ?? Object.values(mockReadingSessions)[0];
      }
      throw error;
    }
  },

  async getSession(sessionId: string): Promise<ReadingSession> {
    try {
      const response = await api.get<ReadingSession>(buildApiPath("v2", `/reading-sessions/${sessionId}`));
      return response.data;
    } catch (error) {
      if (USE_MOCKS) return Object.values(mockReadingSessions).find((session) => session.id === sessionId) ?? Object.values(mockReadingSessions)[0];
      throw error;
    }
  },

  async sendMessage(sessionId: string, input: SendReadingMessageInput): Promise<Response> {
    const token = useAuthStore.getState().token;
    const response = await fetch(buildApiUrl("v2", `/reading-sessions/${sessionId}/messages`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      let message = "阅读对话发送失败";

      try {
        const payload = (await response.json()) as { message?: string };
        message = payload.message ?? message;
      } catch {
        message = response.statusText || message;
      }

      throw new Error(message);
    }

    return response;
  },

  async streamMessage(
    sessionId: string,
    content: string,
    context?: ReadingMessageContext,
    onChunk?: (chunk: string) => void
  ): Promise<{ messageId: string; content: string }> {
    try {
      const response = await this.sendMessage(sessionId, { content, context });

      if (!response.body) {
        throw new Error("No stream body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffered = "";
      let fullText = "";

      while (!done) {
        const result = await reader.read();
        done = result.done;
        buffered += decoder.decode(result.value ?? new Uint8Array(), { stream: !done });

        const events = buffered.split("\n\n");
        buffered = events.pop() ?? "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((entry) => entry.startsWith("data:"));

          if (!line) {
            continue;
          }

          const payload = JSON.parse(line.slice(5).trim()) as { chunk?: string; done?: boolean; messageId?: string };
          if (payload.chunk) {
            fullText += payload.chunk;
            onChunk?.(payload.chunk);
          }
          if (payload.done) {
            return { messageId: payload.messageId ?? crypto.randomUUID(), content: fullText };
          }
        }
      }

      return { messageId: crypto.randomUUID(), content: fullText };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(getApiErrorMessage(error, "阅读对话发送失败"));
      }

      if (USE_MOCKS) {
        const fallback = context?.selectedText
          ? `你选择了”${context.selectedText.slice(0, 24)}”。作者为什么要这样表述，这个说法依赖了什么前提？`
          : `先不要急着回答。围绕”${content.slice(0, 18)}”，你认为文本真正想让你分辨的是什么？`;

        let rendered = "";
        for (const char of fallback) {
          await wait(12);
          rendered += char;
          onChunk?.(char);
        }

        return { messageId: crypto.randomUUID(), content: rendered };
      }

      throw error;
    }
  },

  async updateProgress(sessionId: string, chapterId: string, progress: number): Promise<void> {
    try {
      await api.patch(buildApiPath("v2", `/reading-sessions/${sessionId}/progress`), { chapterId, progress });
    } catch (error) {
      if (USE_MOCKS) {
        const session = Object.values(mockReadingSessions).find((item) => item.id === sessionId);
        if (session) return;
      }
      throw new Error(getApiErrorMessage(error, "阅读进度更新失败"));
    }
  }
};

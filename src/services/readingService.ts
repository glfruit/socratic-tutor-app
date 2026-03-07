import { api, buildApiPath, buildApiUrl } from "@/services/api";
import { mockReadingSessions } from "@/services/mockData";
import type { ReadingMessageContext, ReadingSession } from "@/types";
import { useAuthStore } from "@/stores/authStore";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const readingService = {
  async createSession(documentId: string, chapterId?: string): Promise<ReadingSession> {
    try {
      const response = await api.post<ReadingSession>(buildApiPath("v2", "/reading-sessions"), { documentId, chapterId });
      return response.data;
    } catch {
      const session = mockReadingSessions[documentId];
      return session ?? Object.values(mockReadingSessions)[0];
    }
  },

  async getSession(sessionId: string): Promise<ReadingSession> {
    try {
      const response = await api.get<ReadingSession>(buildApiPath("v2", `/reading-sessions/${sessionId}`));
      return response.data;
    } catch {
      return Object.values(mockReadingSessions).find((session) => session.id === sessionId) ?? Object.values(mockReadingSessions)[0];
    }
  },

  async streamMessage(
    sessionId: string,
    content: string,
    context?: ReadingMessageContext,
    onChunk?: (chunk: string) => void
  ): Promise<{ messageId: string; content: string }> {
    try {
      const token = useAuthStore.getState().token;
      const response = await fetch(buildApiUrl("v2", `/reading-sessions/${sessionId}/messages`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ content, context })
      });

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
    } catch {
      const fallback = context?.selectedText
        ? `你选择了“${context.selectedText.slice(0, 24)}”。作者为什么要这样表述，这个说法依赖了什么前提？`
        : `先不要急着回答。围绕“${content.slice(0, 18)}”，你认为文本真正想让你分辨的是什么？`;

      let rendered = "";
      for (const char of fallback) {
        await wait(12);
        rendered += char;
        onChunk?.(char);
      }

      return { messageId: crypto.randomUUID(), content: rendered };
    }
  },

  async updateProgress(sessionId: string, chapterId: string, progress: number): Promise<void> {
    try {
      await api.patch(buildApiPath("v2", `/reading-sessions/${sessionId}/progress`), { chapterId, progress });
    } catch {
      return;
    }
  }
};

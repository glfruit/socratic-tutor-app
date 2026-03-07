import { create } from "zustand";
import { sessionService } from "@/services/sessionService";
import type { ChatMessage } from "@/types";

interface SendMessageOptions {
  subject?: string;
  level?: string | null;
}

interface SendMessageResult {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

interface SessionState {
  currentSessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  isLoadingSession: boolean;
  error: string | null;
  loadSession: (sessionId: string) => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<SendMessageResult>;
  stopStreaming: () => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  isLoadingSession: false,
  error: null,

  async loadSession(sessionId) {
    set({ isLoadingSession: true, error: null });
    try {
      const messages = await sessionService.getSessionMessages(sessionId);
      set({ currentSessionId: sessionId, messages, isLoadingSession: false });
    } catch {
      set({ error: "会话加载失败，请稍后重试。", isLoadingSession: false });
    }
  },

  resetSession() {
    set({ currentSessionId: null, messages: [], isStreaming: false, isLoadingSession: false, error: null });
  },

  clearError() {
    set({ error: null });
  },

  async sendMessage(content, options = {}) {
    const trimmedContent = content.trim();
    const { currentSessionId, messages, isStreaming } = get();
    if (isStreaming || !trimmedContent) {
      return { ok: false };
    }

    let sessionId = currentSessionId;

    try {
      if (!sessionId) {
        const session = await sessionService.createSession({
          subject: options.subject,
          level: options.level ?? undefined,
          title: options.subject ? `${options.subject}对话` : undefined
        });
        sessionId = session.id;
        set({ currentSessionId: session.id, error: null });
      }
    } catch {
      set({ error: "新会话创建失败，请稍后重试。" });
      return { ok: false, error: "新会话创建失败，请稍后重试。" };
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedContent,
      createdAt: new Date().toISOString()
    };

    set({ messages: [...messages, userMessage], isStreaming: true, error: null });

    try {
      const assistantMessage = await sessionService.sendMessage(sessionId, trimmedContent);

      const partialMessage: ChatMessage = {
        ...assistantMessage,
        content: ""
      };

      set((state) => ({ messages: [...state.messages, partialMessage] }));

      for (const chunk of assistantMessage.content) {
        if (!get().isStreaming) {
          break;
        }
        await wait(15);
        set((state) => {
          const lastIndex = state.messages.length - 1;
          const last = state.messages[lastIndex];
          const updated = [...state.messages];
          updated[lastIndex] = { ...last, content: `${last.content}${chunk}`, hints: assistantMessage.hints };
          return { messages: updated };
        });
      }

      set({ isStreaming: false });
      const result: SendMessageResult = { ok: true, sessionId };
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "消息发送失败，请检查网络后重试。";
      console.error("[sessionStore] Message send failed", {
        sessionId,
        error
      });
      set({
        messages,
        isStreaming: false,
        error: message
      });
      const result: SendMessageResult = { ok: false, error: message };
      return result;
    }
  },

  stopStreaming() {
    set({ isStreaming: false });
  }
}));

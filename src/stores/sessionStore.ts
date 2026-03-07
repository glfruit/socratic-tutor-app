import { create } from "zustand";
import { sessionService } from "@/services/sessionService";
import type { ChatMessage } from "@/types";

interface SendMessageOptions {
  subject?: string;
  level?: string | null;
}

interface SessionContext {
  subject: string | null;
  level: string | null;
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
  activeContext: SessionContext | null;
  loadSession: (sessionId: string) => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<SendMessageResult>;
  stopStreaming: () => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeContext = (options: SendMessageOptions = {}): SessionContext => ({
  subject: options.subject ?? null,
  level: options.level ?? null
});

const contextsMatch = (left: SessionContext | null, right: SessionContext) => {
  if (!left) {
    return false;
  }

  return left.subject === right.subject && left.level === right.level;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  messages: [],
  isStreaming: false,
  isLoadingSession: false,
  error: null,
  activeContext: null,

  async loadSession(sessionId) {
    set({ isLoadingSession: true, error: null });
    try {
      const messages = await sessionService.getSessionMessages(sessionId);
      set({ currentSessionId: sessionId, messages, isLoadingSession: false, activeContext: null });
    } catch {
      set({ error: "会话加载失败，请稍后重试。", isLoadingSession: false });
    }
  },

  resetSession() {
    set({ currentSessionId: null, messages: [], isStreaming: false, isLoadingSession: false, error: null, activeContext: null });
  },

  clearError() {
    set({ error: null });
  },

  async sendMessage(content, options = {}) {
    const trimmedContent = content.trim();
    const { currentSessionId, messages, isStreaming, activeContext } = get();
    if (isStreaming || !trimmedContent) {
      return { ok: false };
    }

    const requestedContext = normalizeContext(options);
    const shouldStartFreshSession = Boolean(currentSessionId && activeContext && !contextsMatch(activeContext, requestedContext));

    let sessionId = shouldStartFreshSession ? null : currentSessionId;
    let nextMessages = shouldStartFreshSession ? [] : messages;

    if (shouldStartFreshSession) {
      set({ currentSessionId: null, messages: [], error: null, activeContext: requestedContext });
    }

    try {
      if (!sessionId) {
        const session = await sessionService.createSession({
          subject: options.subject,
          level: options.level ?? undefined,
          title: options.subject ? `${options.subject}对话` : undefined
        });
        sessionId = session.id;
        set({ currentSessionId: session.id, error: null, activeContext: requestedContext });
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

    set({ messages: [...nextMessages, userMessage], isStreaming: true, error: null });

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
        messages: nextMessages,
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

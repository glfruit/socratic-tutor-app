import { create } from "zustand";
import { sessionService } from "@/services/sessionService";
import type { ChatMessage } from "@/types";

interface SessionState {
  currentSessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  loadSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  stopStreaming: () => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  messages: [],
  isStreaming: false,

  async loadSession(sessionId) {
    const messages = await sessionService.getSessionMessages(sessionId);
    set({ currentSessionId: sessionId, messages });
  },

  async sendMessage(content) {
    const { currentSessionId, messages, isStreaming } = get();
    if (!currentSessionId || isStreaming || !content.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    set({ messages: [...messages, userMessage], isStreaming: true });

    const assistantMessage = await sessionService.sendMessage(currentSessionId, content);

    const partialMessage: ChatMessage = {
      ...assistantMessage,
      content: ""
    };

    set((state) => ({ messages: [...state.messages, partialMessage] }));

    for (const chunk of assistantMessage.content) {
      if (!get().isStreaming) {
        return;
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
  },

  stopStreaming() {
    set({ isStreaming: false });
  }
}));

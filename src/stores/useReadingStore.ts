import { create } from "zustand";
import { documentService } from "@/services/documentService";
import { readingService } from "@/services/readingService";
import type { Chapter, ChatMessage, DocumentDetail, ReadingMessageContext, ReadingSession } from "@/types";

interface ReadingState {
  document: DocumentDetail | null;
  session: ReadingSession | null;
  currentChapter: Chapter | null;
  selectedText: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  initializeReader: (documentId: string) => Promise<void>;
  selectChapter: (chapterId: string) => void;
  setSelectedText: (text: string) => void;
  sendMessage: (content: string, context?: ReadingMessageContext) => Promise<void>;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  document: null,
  session: null,
  currentChapter: null,
  selectedText: "",
  messages: [],
  isLoading: false,
  isStreaming: false,

  async initializeReader(documentId) {
    set({ isLoading: true });
    const [document, session] = await Promise.all([
      documentService.getDocument(documentId),
      readingService.createSession(documentId)
    ]);

    set({
      document,
      session,
      currentChapter: session.currentChapter ?? document.chapters[0] ?? null,
      messages: session.messages,
      isLoading: false
    });
  },

  selectChapter(chapterId) {
    const document = get().document;
    const currentChapter = document?.chapters.find((chapter) => chapter.id === chapterId) ?? null;
    set({ currentChapter, selectedText: "" });
  },

  setSelectedText(text) {
    set({ selectedText: text });
  },

  async sendMessage(content, context) {
    const { session, messages, currentChapter, selectedText } = get();
    if (!session || !content.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      metadata: context?.selectedText || selectedText ? { referencedText: context?.selectedText ?? selectedText } : undefined
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString()
    };

    set({
      messages: [...messages, userMessage, assistantMessage],
      isStreaming: true
    });

    const usedContext = context?.selectedText || selectedText ? { ...context, selectedText: context?.selectedText ?? selectedText } : context;

    const result = await readingService.streamMessage(session.id, content, usedContext, (chunk) => {
      set((state) => {
        const updated = [...state.messages];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = { ...updated[lastIndex], content: `${updated[lastIndex].content}${chunk}` };
        return { messages: updated };
      });
    });

    set((state) => {
      const updated = [...state.messages];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = { ...updated[lastIndex], id: result.messageId };
      return { messages: updated, isStreaming: false, selectedText: "" };
    });

    if (currentChapter) {
      void readingService.updateProgress(session.id, currentChapter.id, Math.min((session.progress ?? 0) + 5, 100));
    }
  }
}));

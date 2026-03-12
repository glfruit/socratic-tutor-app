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
  progressState: "idle" | "saving" | "saved" | "error";
  error: string | null;
  initializeReader: (documentId: string) => Promise<void>;
  selectChapter: (chapterId: string) => Promise<void>;
  setSelectedText: (text: string) => void;
  sendMessage: (content: string, context?: ReadingMessageContext) => Promise<void>;
}

const getChapterProgress = (chapters: Chapter[], chapterId?: string) => {
  if (!chapters.length || !chapterId) {
    return 0;
  }

  const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex < 0) {
    return 0;
  }

  return Math.round(((chapterIndex + 1) / chapters.length) * 100);
};

export const useReadingStore = create<ReadingState>((set, get) => ({
  document: null,
  session: null,
  currentChapter: null,
  selectedText: "",
  messages: [],
  isLoading: false,
  isStreaming: false,
  progressState: "idle",
  error: null,

  async initializeReader(documentId) {
    set({ isLoading: true, error: null, progressState: "idle", selectedText: "" });

    try {
      const [document, session] = await Promise.all([documentService.getDocument(documentId), readingService.createSession(documentId)]);

      set({
        document,
        session,
        currentChapter: session.currentChapter ?? document.chapters[0] ?? null,
        messages: session.messages,
        isLoading: false
      });
    } catch {
      set({
        document: null,
        session: null,
        currentChapter: null,
        messages: [],
        isLoading: false,
        error: "阅读内容加载失败，请稍后重试。"
      });
    }
  },

  async selectChapter(chapterId) {
    const { document, session } = get();
    const currentChapter = document?.chapters.find((chapter) => chapter.id === chapterId) ?? null;
    const progress = currentChapter ? getChapterProgress(document?.chapters ?? [], currentChapter.id) : session?.progress ?? 0;

    set((state) => ({
      currentChapter,
      selectedText: "",
      progressState: currentChapter ? "saving" : state.progressState,
      session: state.session && currentChapter ? { ...state.session, currentChapter, progress } : state.session
    }));

    if (session && currentChapter) {
      try {
        await readingService.updateProgress(session.id, currentChapter.id, progress);
        set({ progressState: "saved" });
      } catch {
        set({ progressState: "error" });
      }
    }
  },

  setSelectedText(text) {
    set({ selectedText: text });
  },

  async sendMessage(content, context) {
    const { session, messages, currentChapter, selectedText, document } = get();
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
      isStreaming: true,
      error: null
    });

    const usedContext = context?.selectedText || selectedText ? { ...context, selectedText: context?.selectedText ?? selectedText } : context;

    try {
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
        return { messages: updated, isStreaming: false, selectedText: "", error: null };
      });

      if (currentChapter) {
        const progress = Math.max(getChapterProgress(document?.chapters ?? [], currentChapter.id), Math.min((session.progress ?? 0) + 5, 100));

        set((state) => ({
          progressState: "saving",
          session: state.session ? { ...state.session, progress, currentChapter } : state.session
        }));

        try {
          await readingService.updateProgress(session.id, currentChapter.id, progress);
          set({ progressState: "saved" });
        } catch {
          set({ progressState: "error" });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "发送阅读问题失败，请稍后重试。";
      set((state) => ({
        messages: state.messages.slice(0, -1),
        isStreaming: false,
        error: message
      }));
    }
  }
}));

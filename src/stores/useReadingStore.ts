import { create } from "zustand";
import { documentService } from "@/services/documentService";
import { readingService } from "@/services/readingService";
import type { Chapter, ChatMessage, DocumentDetail, ReadingMessageContext, ReadingSession } from "@/types";

interface ReadingState {
  document: DocumentDetail | null;
  session: ReadingSession | null;
  currentChapter: Chapter | null;
  chapterCompletion: number;
  selectedText: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  progressState: "idle" | "saving" | "saved" | "error";
  error: string | null;
  initializeReader: (documentId: string) => Promise<void>;
  selectChapter: (chapterId: string) => Promise<void>;
  updateChapterCompletion: (completion: number) => void;
  setSelectedText: (text: string) => void;
  sendMessage: (content: string, context?: ReadingMessageContext) => Promise<void>;
}

let progressSaveTimer: ReturnType<typeof window.setTimeout> | null = null;

const clampProgress = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const getChapterProgress = (chapters: Chapter[], chapterId?: string, chapterCompletion = 100) => {
  if (!chapters.length || !chapterId) {
    return 0;
  }

  const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex < 0) {
    return 0;
  }

  return clampProgress(((chapterIndex + chapterCompletion / 100) / chapters.length) * 100);
};

const getCompletionFromProgress = (chapters: Chapter[], chapterId: string | undefined, progress: number) => {
  if (!chapters.length || !chapterId) {
    return 0;
  }

  const chapterIndex = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (chapterIndex < 0) {
    return 0;
  }

  const chapterSpan = 100 / chapters.length;
  const chapterStart = chapterIndex * chapterSpan;
  const chapterOffset = clampProgress(progress) - chapterStart;

  return clampProgress((chapterOffset / chapterSpan) * 100);
};

const scheduleProgressSave = () => {
  if (progressSaveTimer) {
    window.clearTimeout(progressSaveTimer);
  }

  progressSaveTimer = window.setTimeout(async () => {
    const { session, currentChapter } = getReadingState();
    if (!session || !currentChapter) {
      return;
    }

    try {
      useReadingStore.setState({ progressState: "saving" });
      await readingService.updateProgress(session.id, currentChapter.id, session.progress);
      useReadingStore.setState({ progressState: "saved" });
    } catch {
      useReadingStore.setState({ progressState: "error" });
    }
  }, 700);
};

const getReadingState = () => useReadingStore.getState();

export const useReadingStore = create<ReadingState>((set, get) => ({
  document: null,
  session: null,
  currentChapter: null,
  chapterCompletion: 0,
  selectedText: "",
  messages: [],
  isLoading: false,
  isStreaming: false,
  progressState: "idle",
  error: null,

  async initializeReader(documentId) {
    if (progressSaveTimer) {
      window.clearTimeout(progressSaveTimer);
      progressSaveTimer = null;
    }

    set({ isLoading: true, error: null, progressState: "idle", selectedText: "" });

    try {
      const [document, session] = await Promise.all([documentService.getDocument(documentId), readingService.createSession(documentId)]);
      const chapterCompletion = getCompletionFromProgress(document.chapters, session.currentChapter?.id, session.progress);

      set({
        document,
        session,
        currentChapter: session.currentChapter ?? document.chapters[0] ?? null,
        chapterCompletion,
        messages: session.messages,
        isLoading: false
      });
    } catch {
      set({
        document: null,
        session: null,
        currentChapter: null,
        chapterCompletion: 0,
        messages: [],
        isLoading: false,
        error: "阅读内容加载失败，请稍后重试。"
      });
    }
  },

  async selectChapter(chapterId) {
    const { document, session } = get();
    const currentChapter = document?.chapters.find((chapter) => chapter.id === chapterId) ?? null;
    const progress = currentChapter ? getChapterProgress(document?.chapters ?? [], currentChapter.id, 0) : session?.progress ?? 0;

    set((state) => ({
      currentChapter,
      chapterCompletion: 0,
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

  updateChapterCompletion(completion) {
    const { document, currentChapter, session } = get();
    if (!document || !currentChapter || !session) {
      return;
    }

    const nextCompletion = clampProgress(completion);
    const progress = getChapterProgress(document.chapters, currentChapter.id, nextCompletion);

    set((state) => ({
      chapterCompletion: nextCompletion,
      session: state.session ? { ...state.session, progress } : state.session
    }));

    scheduleProgressSave();
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
        const progress = Math.max(
          getChapterProgress(document?.chapters ?? [], currentChapter.id, get().chapterCompletion),
          Math.min((session.progress ?? 0) + 5, 100)
        );

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

import { useReadingStore } from "./useReadingStore";
import { documentService } from "@/services/documentService";
import { readingService } from "@/services/readingService";

vi.mock("@/services/documentService", () => ({
  documentService: {
    getDocument: vi.fn()
  }
}));

vi.mock("@/services/readingService", () => ({
  readingService: {
    createSession: vi.fn(),
    updateProgress: vi.fn(),
    streamMessage: vi.fn()
  }
}));

const mockedDocumentService = vi.mocked(documentService);
const mockedReadingService = vi.mocked(readingService);

const documentDetail = {
  id: "doc-1",
  type: "BOOK" as const,
  title: "批判性思维导论",
  status: "READY" as const,
  progress: 0,
  createdAt: "2026-03-01T09:00:00Z",
  chapters: [
    { id: "c-1", title: "第 1 章 问题的起点", orderIndex: 0, content: "a" },
    { id: "c-2", title: "第 2 章 论证与证据", orderIndex: 1, content: "b" },
    { id: "c-3", title: "第 3 章 迁移与应用", orderIndex: 2, content: "c" }
  ]
};

const session = {
  id: "read-1",
  document: { id: "doc-1", title: "批判性思维导论" },
  currentChapter: documentDetail.chapters[0],
  messages: [],
  progress: 0,
  status: "ACTIVE" as const,
  createdAt: "2026-03-06T09:00:00Z"
};

describe("useReadingStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedDocumentService.getDocument.mockReset();
    mockedReadingService.createSession.mockReset();
    mockedReadingService.updateProgress.mockReset();

    useReadingStore.setState({
      document: null,
      session: null,
      currentChapter: null,
      chapterCompletion: 0,
      selectedText: "",
      messages: [],
      isLoading: false,
      isStreaming: false,
      progressState: "idle",
      error: null
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("jumps chapters and saves reading progress", async () => {
    mockedDocumentService.getDocument.mockResolvedValue(documentDetail);
    mockedReadingService.createSession.mockResolvedValue(session);
    mockedReadingService.updateProgress.mockResolvedValue();

    await useReadingStore.getState().initializeReader("doc-1");
    await useReadingStore.getState().selectChapter("c-2");

    expect(useReadingStore.getState().currentChapter?.id).toBe("c-2");
    expect(mockedReadingService.updateProgress).toHaveBeenCalledWith("read-1", "c-2", 33);

    mockedReadingService.updateProgress.mockClear();

    useReadingStore.getState().updateChapterCompletion(60);
    await vi.advanceTimersByTimeAsync(700);

    expect(mockedReadingService.updateProgress).toHaveBeenCalledWith("read-1", "c-2", 53);
    expect(useReadingStore.getState().progressState).toBe("saved");
  });
});

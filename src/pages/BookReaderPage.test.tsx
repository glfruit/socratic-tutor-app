import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookReaderPage } from "./BookReaderPage";
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
    streamMessage: vi.fn(),
    updateProgress: vi.fn()
  }
}));

const mockedDocumentService = vi.mocked(documentService);
const mockedReadingService = vi.mocked(readingService);

const mockChapters = [
  { id: "ch-1", title: "第 1 章 问题的起点", content: "批判性思维的第一步是提出正确的问题。", orderIndex: 0, startPage: 1 },
  { id: "ch-2", title: "第 2 章 论证与证据", content: "任何论证都需要充分的证据支撑。", orderIndex: 1, startPage: 15 }
];

describe("BookReaderPage", () => {
  beforeEach(() => {
    mockedDocumentService.getDocument.mockResolvedValue({
      id: "doc-book-1",
      type: "BOOK",
      title: "批判性思维导论",
      author: "D. Fisher",
      status: "READY",
      chapters: mockChapters,
      createdAt: "2026-03-01T09:00:00Z"
    } as any);

    mockedReadingService.createSession.mockResolvedValue({
      id: "read-1",
      document: { id: "doc-book-1", title: "批判性思维导论" },
      currentChapter: mockChapters[0],
      messages: [],
      progress: 0,
      status: "ACTIVE",
      createdAt: "2026-03-06T09:00:00Z"
    } as any);

    mockedReadingService.streamMessage.mockResolvedValue({
      messageId: "msg-1",
      content: "这是一个关于批判性思维的核心问题。"
    });

    mockedReadingService.updateProgress.mockResolvedValue(undefined);
  });

  it("loads reader layout, supports chapter jump, and sends a question", async () => {
    render(
      <MemoryRouter initialEntries={["/reader/doc-book-1"]}>
        <Routes>
          <Route path="/reader/:documentId" element={<BookReaderPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "第 1 章 问题的起点" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "下一节" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "第 2 章 论证与证据" })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/输入一个问题/i), "这段文字真正的中心论点是什么？");
    await userEvent.click(screen.getByRole("button", { name: /发送问题/i }));

    await waitFor(() => {
      expect(screen.getByText(/这段文字真正的中心论点/)).toBeInTheDocument();
    });
  });
});

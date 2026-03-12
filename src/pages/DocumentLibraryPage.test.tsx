import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentLibraryPage } from "./DocumentLibraryPage";
import { useDocumentsStore } from "@/stores/useDocumentsStore";
import { documentService } from "@/services/documentService";

vi.mock("@/services/documentService", () => ({
  documentService: {
    getDocumentsPage: vi.fn(),
    deleteDocument: vi.fn()
  }
}));

const mockedDocumentService = vi.mocked(documentService);

const pageOne = {
  items: [
    {
      id: "doc-1",
      type: "BOOK" as const,
      title: "批判性思维导论",
      author: "D. Fisher",
      status: "READY" as const,
      progress: 42,
      createdAt: "2026-03-01T09:00:00Z"
    }
  ],
  pagination: {
    page: 1,
    pageSize: 1,
    total: 2
  }
};

const pageTwo = {
  items: [
    {
      id: "doc-2",
      type: "BOOK" as const,
      title: "科学革命的结构",
      author: "Thomas Kuhn",
      status: "READY" as const,
      progress: 18,
      createdAt: "2026-02-28T11:30:00Z"
    }
  ],
  pagination: {
    page: 2,
    pageSize: 1,
    total: 2
  }
};

describe("DocumentLibraryPage", () => {
  beforeEach(() => {
    mockedDocumentService.getDocumentsPage.mockReset();
    mockedDocumentService.deleteDocument.mockReset();

    useDocumentsStore.setState({
      items: [],
      filteredItems: [],
      visibleItems: [],
      filters: {
        search: "",
        type: "ALL",
        status: "ALL"
      },
      currentPage: 1,
      pageSize: 6,
      hasMore: false,
      total: 0,
      isLoading: false,
      isLoadingMore: false,
      isUploading: false,
      uploadProgress: 0,
      error: null
    });
  });

  it("loads more documents and confirms deletion", async () => {
    mockedDocumentService.getDocumentsPage.mockResolvedValueOnce(pageOne).mockResolvedValueOnce(pageTwo);
    mockedDocumentService.deleteDocument.mockResolvedValue();

    render(
      <MemoryRouter>
        <DocumentLibraryPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("批判性思维导论")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "加载更多" }));

    await waitFor(() => {
      expect(screen.getByText("科学革命的结构")).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByRole("button", { name: "删除" })[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("确认删除文档")).toBeInTheDocument();
    expect(within(dialog).getByText("批判性思维导论")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "确认删除" }));

    await waitFor(() => {
      expect(mockedDocumentService.deleteDocument).toHaveBeenCalledWith("doc-1");
    });

    await waitFor(() => {
      expect(screen.queryByText("批判性思维导论")).not.toBeInTheDocument();
    });
  });
});

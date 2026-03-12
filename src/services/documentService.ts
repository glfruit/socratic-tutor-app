import { api, buildApiPath, getApiErrorMessage } from "@/services/api";
import { mockDocumentDetails, mockDocuments } from "@/services/mockData";
import type { DocumentDetail, DocumentFilters, DocumentSummary, UploadDocumentInput } from "@/types";

interface DocumentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: DocumentFilters["type"];
  status?: DocumentFilters["status"];
}

interface DocumentListResponse {
  items: DocumentSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

interface DocumentSearchInput {
  query: string;
  topK?: number;
  chapterId?: string;
}

interface DocumentSearchResult {
  content: string;
  chapterId: string;
  chapterTitle: string;
  score: number;
  metadata?: {
    pageNumber?: number;
  };
}

interface DocumentSearchResponse {
  results: DocumentSearchResult[];
}

const applyFilters = (items: DocumentSummary[], filters?: Partial<DocumentFilters>) => {
  const search = filters?.search?.trim().toLowerCase() ?? "";

  return items.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      item.title.toLowerCase().includes(search) ||
      item.author?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search);
    const matchesType = !filters?.type || filters.type === "ALL" || item.type === filters.type;
    const matchesStatus = !filters?.status || filters.status === "ALL" || item.status === filters.status;
    return matchesSearch && matchesType && matchesStatus;
  });
};

export const documentService = {
  async getDocumentsPage(params: DocumentListParams = {}): Promise<DocumentListResponse> {
    try {
      const response = await api.get<DocumentListResponse>(buildApiPath("v2", "/documents"), {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search || undefined,
          type: params.type === "ALL" ? undefined : params.type,
          status: params.status === "ALL" ? undefined : params.status
        }
      });
      return response.data;
    } catch {
      const filtered = applyFilters(mockDocuments, params);
      const page = params.page ?? 1;
      const pageSize = params.pageSize ?? filtered.length || 20;
      const startIndex = (page - 1) * pageSize;

      return {
        items: filtered.slice(startIndex, startIndex + pageSize),
        pagination: {
          page,
          pageSize,
          total: filtered.length
        }
      };
    }
  },

  async getDocuments(filters?: Partial<DocumentFilters>): Promise<DocumentSummary[]> {
    const response = await this.getDocumentsPage(filters);
    return response.items;
  },

  async getDocument(documentId: string): Promise<DocumentDetail> {
    try {
      const response = await api.get<DocumentDetail>(buildApiPath("v2", `/documents/${documentId}`));
      return response.data;
    } catch {
      return mockDocumentDetails[documentId] ?? { ...mockDocuments[0], id: documentId, chapters: [] };
    }
  },

  async searchDocument(documentId: string, input: DocumentSearchInput): Promise<DocumentSearchResult[]> {
    try {
      const response = await api.post<DocumentSearchResponse>(buildApiPath("v2", `/documents/${documentId}/search`), input);
      return response.data.results;
    } catch {
      const document = mockDocumentDetails[documentId] ?? mockDocumentDetails[mockDocuments[0].id];
      const query = input.query.trim().toLowerCase();

      return document.chapters
        .filter((chapter) => (input.chapterId ? chapter.id === input.chapterId : true))
        .map((chapter) => ({
          content: chapter.content ?? "",
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          score: query && chapter.content?.toLowerCase().includes(query) ? 0.95 : 0.6,
          metadata: undefined
        }))
        .sort((left, right) => right.score - left.score)
        .slice(0, input.topK ?? 5);
    }
  },

  async uploadDocument(input: UploadDocumentInput): Promise<DocumentSummary> {
    const formData = new FormData();
    formData.append("file", input.file);
    formData.append("type", input.type);
    if (input.title) {
      formData.append("title", input.title);
    }
    if (input.description) {
      formData.append("description", input.description);
    }

    try {
      const response = await api.post<DocumentSummary>(buildApiPath("v2", "/documents"), formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    } catch {
      return {
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title?.trim() || input.file.name.replace(/\.[^.]+$/, ""),
        description: input.description,
        status: "PROCESSING",
        progress: 0,
        createdAt: new Date().toISOString()
      };
    }
  },

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await api.delete(buildApiPath("v2", `/documents/${documentId}`));
    } catch (error) {
      const existsInMock = Boolean(mockDocumentDetails[documentId] || mockDocuments.find((item) => item.id === documentId));
      if (!existsInMock) {
        throw new Error(getApiErrorMessage(error, "删除文档失败"));
      }
    }
  }
};

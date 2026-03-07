import { api, buildApiPath } from "@/services/api";
import { mockDocumentDetails, mockDocuments } from "@/services/mockData";
import type { DocumentDetail, DocumentFilters, DocumentSummary, UploadDocumentInput } from "@/types";

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
  async getDocuments(filters?: Partial<DocumentFilters>): Promise<DocumentSummary[]> {
    try {
      const response = await api.get<{ items: DocumentSummary[] }>(buildApiPath("v2", "/documents"), {
        params: {
          search: filters?.search || undefined,
          type: filters?.type === "ALL" ? undefined : filters?.type,
          status: filters?.status === "ALL" ? undefined : filters?.status
        }
      });
      return response.data.items;
    } catch {
      return applyFilters(mockDocuments, filters);
    }
  },

  async getDocument(documentId: string): Promise<DocumentDetail> {
    try {
      const response = await api.get<DocumentDetail>(buildApiPath("v2", `/documents/${documentId}`));
      return response.data;
    } catch {
      return mockDocumentDetails[documentId] ?? { ...mockDocuments[0], id: documentId, chapters: [] };
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
    } catch {
      return;
    }
  }
};

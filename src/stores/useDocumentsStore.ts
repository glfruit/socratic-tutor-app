import { create } from "zustand";
import { documentService } from "@/services/documentService";
import type { DocumentFilters, DocumentSummary, UploadDocumentInput } from "@/types";

interface DocumentsState {
  items: DocumentSummary[];
  filteredItems: DocumentSummary[];
  filters: DocumentFilters;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  loadDocuments: () => Promise<void>;
  setFilters: (filters: Partial<DocumentFilters>) => void;
  uploadDocument: (input: UploadDocumentInput) => Promise<DocumentSummary>;
  deleteDocument: (documentId: string) => Promise<void>;
}

const defaultFilters: DocumentFilters = {
  search: "",
  type: "ALL",
  status: "ALL"
};

const applyFilters = (items: DocumentSummary[], filters: DocumentFilters) => {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      search.length === 0 ||
      item.title.toLowerCase().includes(search) ||
      item.author?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search);
    const matchesType = filters.type === "ALL" || item.type === filters.type;
    const matchesStatus = filters.status === "ALL" || item.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });
};

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  items: [],
  filteredItems: [],
  filters: defaultFilters,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  async loadDocuments() {
    set({ isLoading: true, error: null });

    try {
      const items = await documentService.getDocuments();
      set((state) => ({
        items,
        filteredItems: applyFilters(items, state.filters),
        isLoading: false
      }));
    } catch {
      set({ isLoading: false, error: "文档列表加载失败，请稍后重试。" });
    }
  },

  setFilters(filters) {
    set((state) => {
      const nextFilters = { ...state.filters, ...filters };

      return {
        filters: nextFilters,
        filteredItems: applyFilters(state.items, nextFilters)
      };
    });
  },

  async uploadDocument(input) {
    set({ isUploading: true, uploadProgress: 15, error: null });

    try {
      const document = await documentService.uploadDocument(input);
      set((state) => {
        const items = [document, ...state.items];

        return {
          isUploading: false,
          uploadProgress: 100,
          items,
          filteredItems: applyFilters(items, state.filters)
        };
      });
      return document;
    } catch (error) {
      set({ isUploading: false, uploadProgress: 0, error: "文档上传失败，请稍后重试。" });
      throw error;
    }
  },

  async deleteDocument(documentId) {
    await documentService.deleteDocument(documentId);
    set((state) => {
      const items = state.items.filter((item) => item.id !== documentId);

      return {
        items,
        filteredItems: applyFilters(items, state.filters)
      };
    });
  }
}));

import { create } from "zustand";
import { documentService } from "@/services/documentService";
import type { DocumentFilters, DocumentSummary, UploadDocumentInput } from "@/types";

interface DocumentsState {
  items: DocumentSummary[];
  filteredItems: DocumentSummary[];
  visibleItems: DocumentSummary[];
  filters: DocumentFilters;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  loadDocuments: () => Promise<void>;
  loadMore: () => void;
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

const DEFAULT_PAGE_SIZE = 6;

const getVisibleItems = (items: DocumentSummary[], currentPage: number, pageSize: number) => items.slice(0, currentPage * pageSize);

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  items: [],
  filteredItems: [],
  visibleItems: [],
  filters: defaultFilters,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  async loadDocuments() {
    set({ isLoading: true, error: null });

    try {
      const items = await documentService.getDocuments();
      const filteredItems = applyFilters(items, get().filters);
      const pageSize = get().pageSize;

      set((state) => ({
        currentPage: 1,
        items,
        filteredItems,
        visibleItems: getVisibleItems(filteredItems, 1, pageSize),
        hasMore: filteredItems.length > state.pageSize,
        isLoading: false
      }));
    } catch {
      set({ isLoading: false, error: "文档列表加载失败，请稍后重试。" });
    }
  },

  loadMore() {
    set((state) => {
      if (!state.hasMore) {
        return {};
      }

      const currentPage = state.currentPage + 1;
      const visibleItems = getVisibleItems(state.filteredItems, currentPage, state.pageSize);

      return {
        currentPage,
        visibleItems,
        hasMore: visibleItems.length < state.filteredItems.length
      };
    });
  },

  setFilters(filters) {
    set((state) => {
      const nextFilters = { ...state.filters, ...filters };
      const filteredItems = applyFilters(state.items, nextFilters);
      const currentPage = 1;

      return {
        filters: nextFilters,
        filteredItems,
        visibleItems: getVisibleItems(filteredItems, currentPage, state.pageSize),
        currentPage,
        hasMore: filteredItems.length > state.pageSize
      };
    });
  },

  async uploadDocument(input) {
    set({ isUploading: true, uploadProgress: 15, error: null });

    try {
      const document = await documentService.uploadDocument(input);
      set((state) => {
        const items = [document, ...state.items];
        const filteredItems = applyFilters(items, state.filters);
        const visibleItems = getVisibleItems(filteredItems, state.currentPage, state.pageSize);

        return {
          isUploading: false,
          uploadProgress: 100,
          items,
          filteredItems,
          visibleItems,
          hasMore: visibleItems.length < filteredItems.length
        };
      });
      return document;
    } catch (error) {
      set({ isUploading: false, uploadProgress: 0, error: "文档上传失败，请稍后重试。" });
      throw error;
    }
  },

  async deleteDocument(documentId) {
    try {
      await documentService.deleteDocument(documentId);
      set((state) => {
        const items = state.items.filter((item) => item.id !== documentId);
        const filteredItems = applyFilters(items, state.filters);
        const maxPage = Math.max(1, Math.ceil(filteredItems.length / state.pageSize));
        const currentPage = Math.min(state.currentPage, maxPage);
        const visibleItems = getVisibleItems(filteredItems, currentPage, state.pageSize);

        return {
          items,
          filteredItems,
          visibleItems,
          currentPage,
          hasMore: visibleItems.length < filteredItems.length,
          error: null
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "删除文档失败，请稍后重试。" });
      throw error;
    }
  }
}));

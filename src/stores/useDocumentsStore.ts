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
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  loadDocuments: () => Promise<void>;
  loadMore: () => Promise<void>;
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

const getHasMore = (page: number, pageSize: number, total: number) => page * pageSize < total;

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  items: [],
  filteredItems: [],
  visibleItems: [],
  filters: defaultFilters,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  total: 0,
  isLoading: false,
  isLoadingMore: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,

  async loadDocuments() {
    set({ isLoading: true, error: null });

    try {
      const { filters, pageSize } = get();
      const response = await documentService.getDocumentsPage({
        page: 1,
        pageSize,
        search: filters.search,
        type: filters.type,
        status: filters.status
      });
      const filteredItems = applyFilters(response.items, filters);

      set({
        currentPage: 1,
        items: response.items,
        filteredItems,
        visibleItems: filteredItems,
        hasMore: getHasMore(response.pagination.page, response.pagination.pageSize, response.pagination.total),
        total: response.pagination.total,
        isLoading: false,
        isLoadingMore: false
      });
    } catch {
      set({ isLoading: false, isLoadingMore: false, error: "文档列表加载失败，请稍后重试。" });
    }
  },

  async loadMore() {
    const { hasMore, isLoadingMore, currentPage, pageSize, filters, items } = get();
    if (!hasMore || isLoadingMore) {
      return;
    }

    set({ isLoadingMore: true, error: null });

    try {
      const nextPage = currentPage + 1;
      const response = await documentService.getDocumentsPage({
        page: nextPage,
        pageSize,
        search: filters.search,
        type: filters.type,
        status: filters.status
      });

      const mergedItems = [...items, ...response.items.filter((item) => !items.some((existing) => existing.id === item.id))];
      const filteredItems = applyFilters(mergedItems, filters);

      set({
        currentPage: nextPage,
        items: mergedItems,
        filteredItems,
        visibleItems: filteredItems,
        hasMore: getHasMore(response.pagination.page, response.pagination.pageSize, response.pagination.total),
        total: response.pagination.total,
        isLoadingMore: false
      });
    } catch {
      set({ isLoadingMore: false, error: "更多文档加载失败，请稍后重试。" });
    }
  },

  setFilters(filters) {
    set((state) => {
      const nextFilters = { ...state.filters, ...filters };

      return {
        filters: nextFilters
      };
    });

    void get().loadDocuments();
  },

  async uploadDocument(input) {
    set({ isUploading: true, uploadProgress: 15, error: null });

    try {
      const document = await documentService.uploadDocument(input);
      set((state) => {
        const items = [document, ...state.items];
        const filteredItems = applyFilters(items, state.filters);

        return {
          isUploading: false,
          uploadProgress: 100,
          items,
          filteredItems,
          visibleItems: filteredItems,
          total: state.total + 1,
          hasMore: getHasMore(state.currentPage, state.pageSize, state.total + 1)
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
        const total = Math.max(0, state.total - 1);

        return {
          items,
          filteredItems,
          visibleItems: filteredItems,
          total,
          hasMore: getHasMore(state.currentPage, state.pageSize, total),
          error: null
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "删除文档失败，请稍后重试。" });
      throw error;
    }
  }
}));

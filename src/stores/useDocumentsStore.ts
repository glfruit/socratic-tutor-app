import { create } from "zustand";
import { documentService } from "@/services/documentService";
import type { DocumentFilters, DocumentSummary, UploadDocumentInput } from "@/types";

interface DocumentsState {
  items: DocumentSummary[];
  filters: DocumentFilters;
  isLoading: boolean;
  isUploading: boolean;
  uploadProgress: number;
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

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  items: [],
  filters: defaultFilters,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,

  async loadDocuments() {
    set({ isLoading: true });
    const items = await documentService.getDocuments(get().filters);
    set({ items, isLoading: false });
  },

  setFilters(filters) {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  async uploadDocument(input) {
    set({ isUploading: true, uploadProgress: 15 });
    const document = await documentService.uploadDocument(input);
    set((state) => ({
      isUploading: false,
      uploadProgress: 100,
      items: [document, ...state.items]
    }));
    return document;
  },

  async deleteDocument(documentId) {
    await documentService.deleteDocument(documentId);
    set((state) => ({ items: state.items.filter((item) => item.id !== documentId) }));
  }
}));

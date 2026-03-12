import { create } from "zustand";
import { sessionService } from "@/services/sessionService";
import type { ChatMessage, SessionMaterial } from "@/types";

let latestLoadRequestId = 0;

interface SendMessageOptions {
  subject?: string;
  level?: string | null;
}

interface SessionContext {
  subject: string | null;
  level: string | null;
}

interface SendMessageResult {
  ok: boolean;
  sessionId?: string;
  error?: string;
}

interface SessionState {
  currentSessionId: string | null;
  messages: ChatMessage[];
  materials: SessionMaterial[];
  isStreaming: boolean;
  isLoadingSession: boolean;
  isLoadingMaterials: boolean;
  isUploadingMaterial: boolean;
  deletingMaterialIds: string[];
  error: string | null;
  activeContext: SessionContext | null;
  loadSession: (sessionId: string, options?: SendMessageOptions) => Promise<boolean>;
  loadSessionMaterials: (sessionId: string) => Promise<void>;
  resetSession: () => void;
  clearError: () => void;
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<SendMessageResult>;
  uploadMaterial: (file: File, options?: SendMessageOptions) => Promise<SendMessageResult>;
  deleteMaterial: (materialId: string) => Promise<boolean>;
  stopStreaming: () => void;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeContext = (options: SendMessageOptions = {}): SessionContext => ({
  subject: options.subject ?? null,
  level: options.level ?? null
});

const contextsMatch = (left: SessionContext | null, right: SessionContext) => {
  if (!left) {
    return false;
  }

  return left.subject === right.subject && left.level === right.level;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSessionId: null,
  messages: [],
  materials: [],
  isStreaming: false,
  isLoadingSession: false,
  isLoadingMaterials: false,
  isUploadingMaterial: false,
  deletingMaterialIds: [],
  error: null,
  activeContext: null,

  async loadSession(sessionId, options = {}) {
    const requestId = ++latestLoadRequestId;
    const requestedContext = normalizeContext(options);
    console.info("[sessionStore] Loading session", { sessionId, requestId, requestedContext });
    set({ isLoadingSession: true, isLoadingMaterials: true, error: null });
    try {
      if (requestedContext.subject) {
        const sessions = await sessionService.getSessions();
        const summary = sessions.find((session) => session.id === sessionId);

        if (!summary || summary.subject !== requestedContext.subject) {
          if (requestId !== latestLoadRequestId) {
            console.info("[sessionStore] Ignoring stale session context mismatch", {
              sessionId,
              requestId,
              latestLoadRequestId
            });
            return false;
          }

          console.warn("[sessionStore] Rejecting session load due to subject mismatch", {
            sessionId,
            requestId,
            expectedSubject: requestedContext.subject,
            actualSubject: summary?.subject ?? null
          });
          set({
            currentSessionId: null,
            messages: [],
            materials: [],
            isLoadingSession: false,
            isLoadingMaterials: false,
            error: "当前学科与会话不匹配，已开始新的对话。",
            activeContext: requestedContext
          });
          return false;
        }
      }

      const [messages, materials] = await Promise.all([
        sessionService.getSessionMessages(sessionId),
        sessionService.getSessionMaterials(sessionId).catch(() => [])
      ]);
      if (requestId !== latestLoadRequestId) {
        console.info("[sessionStore] Ignoring stale session load", { sessionId, requestId, latestLoadRequestId });
        return false;
      }

      console.info("[sessionStore] Session loaded", { sessionId, requestId, messageCount: messages.length });
      set({
        currentSessionId: sessionId,
        messages,
        materials,
        isLoadingSession: false,
        isLoadingMaterials: false,
        activeContext: requestedContext
      });
      return true;
    } catch {
      if (requestId !== latestLoadRequestId) {
        console.info("[sessionStore] Ignoring stale session load failure", { sessionId, requestId, latestLoadRequestId });
        return false;
      }

      set({ error: "会话加载失败，请稍后重试。", isLoadingSession: false, isLoadingMaterials: false });
      return false;
    }
  },

  async loadSessionMaterials(sessionId) {
    set({ isLoadingMaterials: true });

    try {
      const materials = await sessionService.getSessionMaterials(sessionId);
      if (get().currentSessionId !== sessionId) {
        return;
      }

      set({ materials, isLoadingMaterials: false });
    } catch {
      if (get().currentSessionId !== sessionId) {
        return;
      }

      set({ isLoadingMaterials: false, error: "资料列表加载失败，请稍后重试。" });
    }
  },

  resetSession() {
    latestLoadRequestId += 1;
    console.info("[sessionStore] Resetting session", { loadRequestId: latestLoadRequestId });
    set({
      currentSessionId: null,
      messages: [],
      materials: [],
      isStreaming: false,
      isLoadingSession: false,
      isLoadingMaterials: false,
      isUploadingMaterial: false,
      deletingMaterialIds: [],
      error: null,
      activeContext: null
    });
  },

  clearError() {
    set({ error: null });
  },

  async sendMessage(content, options = {}) {
    const trimmedContent = content.trim();
    const { currentSessionId, messages, isStreaming, activeContext } = get();
    if (isStreaming || !trimmedContent) {
      return { ok: false };
    }

    const requestedContext = normalizeContext(options);
    const shouldStartFreshSession = Boolean(currentSessionId && activeContext && !contextsMatch(activeContext, requestedContext));

    let sessionId = shouldStartFreshSession ? null : currentSessionId;
    let nextMessages = shouldStartFreshSession ? [] : messages;

    if (shouldStartFreshSession) {
      set({ currentSessionId: null, messages: [], error: null, activeContext: requestedContext });
    }

    try {
      if (!sessionId) {
        const session = await sessionService.createSession({
          subject: options.subject,
          level: options.level ?? undefined,
          title: options.subject ? `${options.subject}对话` : undefined
        });
        sessionId = session.id;
        set({ currentSessionId: session.id, error: null, activeContext: requestedContext });
      }
    } catch {
      set({ error: "新会话创建失败，请稍后重试。" });
      return { ok: false, error: "新会话创建失败，请稍后重试。" };
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedContent,
      createdAt: new Date().toISOString()
    };

    set({ messages: [...nextMessages, userMessage], isStreaming: true, error: null });

    try {
      const assistantMessage = await sessionService.sendMessage(sessionId, trimmedContent);

      const partialMessage: ChatMessage = {
        ...assistantMessage,
        content: ""
      };

      set((state) => ({ messages: [...state.messages, partialMessage] }));

      for (const chunk of assistantMessage.content) {
        if (!get().isStreaming) {
          break;
        }
        await wait(15);
        set((state) => {
          const lastIndex = state.messages.length - 1;
          const last = state.messages[lastIndex];
          const updated = [...state.messages];
          updated[lastIndex] = { ...last, content: `${last.content}${chunk}`, hints: assistantMessage.hints };
          return { messages: updated };
        });
      }

      set({ isStreaming: false });
      const result: SendMessageResult = { ok: true, sessionId };
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "消息发送失败，请检查网络后重试。";
      console.error("[sessionStore] Message send failed", {
        sessionId,
        error
      });
      set({
        messages: nextMessages,
        isStreaming: false,
        error: message
      });
      const result: SendMessageResult = { ok: false, error: message };
      return result;
    }
  },

  async uploadMaterial(file, options = {}) {
    const trimmedName = file.name.trim();
    const { currentSessionId, activeContext, isUploadingMaterial } = get();
    if (!trimmedName || isUploadingMaterial) {
      return { ok: false };
    }

    const requestedContext = normalizeContext(options);
    const shouldStartFreshSession = Boolean(currentSessionId && activeContext && !contextsMatch(activeContext, requestedContext));
    let sessionId = shouldStartFreshSession ? null : currentSessionId;

    if (shouldStartFreshSession) {
      set({ currentSessionId: null, messages: [], materials: [], error: null, activeContext: requestedContext });
    }

    try {
      if (!sessionId) {
        const session = await sessionService.createSession({
          subject: options.subject,
          level: options.level ?? undefined,
          title: options.subject ? `${options.subject}对话` : undefined
        });
        sessionId = session.id;
        set({ currentSessionId: session.id, error: null, activeContext: requestedContext });
      }
    } catch {
      set({ error: "新会话创建失败，请稍后重试。" });
      return { ok: false, error: "新会话创建失败，请稍后重试。" };
    }

    set({ isUploadingMaterial: true, error: null });

    try {
      const material = await sessionService.uploadMaterial(sessionId, file);
      set((state) => ({
        materials: [material, ...state.materials.filter((item) => item.id !== material.id)],
        isUploadingMaterial: false
      }));
      return { ok: true, sessionId };
    } catch (error) {
      const message = error instanceof Error ? error.message : "资料上传失败，请稍后重试。";
      set({ isUploadingMaterial: false, error: message });
      return { ok: false, error: message };
    }
  },

  async deleteMaterial(materialId) {
    const { currentSessionId, deletingMaterialIds } = get();
    if (!currentSessionId || deletingMaterialIds.includes(materialId)) {
      return false;
    }

    set({ deletingMaterialIds: [...deletingMaterialIds, materialId], error: null });

    try {
      await sessionService.deleteMaterial(currentSessionId, materialId);
      set((state) => ({
        materials: state.materials.filter((item) => item.id !== materialId),
        deletingMaterialIds: state.deletingMaterialIds.filter((id) => id !== materialId)
      }));
      return true;
    } catch {
      set((state) => ({
        deletingMaterialIds: state.deletingMaterialIds.filter((id) => id !== materialId),
        error: "资料删除失败，请稍后重试。"
      }));
      return false;
    }
  },

  stopStreaming() {
    set({ isStreaming: false });
  }
}));

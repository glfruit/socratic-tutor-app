import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { MessageInput } from "@/components/dialogue/MessageInput";
import { MessageList } from "@/components/dialogue/MessageList";
import { useSessionStore } from "@/stores/sessionStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { DEFAULT_LEARNING_LEVEL, getLearningLevelLabel } from "@/utils/learningLevel";

export function SessionChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject") ?? "通用";
  const levelFromQuery = searchParams.get("level");
  const defaultLevel = usePreferencesStore((state) => state.defaultLevel);
  const routeSessionKeyRef = useRef<string | null>(null);

  const {
    currentSessionId,
    messages,
    isStreaming,
    isLoadingSession,
    error,
    loadSession,
    resetSession,
    clearError,
    sendMessage,
    stopStreaming
  } = useSessionStore((state) => ({
    currentSessionId: state.currentSessionId,
    messages: state.messages,
    isStreaming: state.isStreaming,
    isLoadingSession: state.isLoadingSession,
    error: state.error,
    loadSession: state.loadSession,
    resetSession: state.resetSession,
    clearError: state.clearError,
    sendMessage: state.sendMessage,
    stopStreaming: state.stopStreaming
  }));

  useEffect(() => {
    if (id && id !== "new") {
      void loadSession(id);
      return;
    }

    resetSession();
  }, [id, loadSession, resetSession]);

  useEffect(() => {
    const routeLevel = levelFromQuery ?? defaultLevel ?? DEFAULT_LEARNING_LEVEL;
    const nextRouteKey = `${subject}::${routeLevel}`;

    if (routeSessionKeyRef.current === null) {
      routeSessionKeyRef.current = nextRouteKey;
      return;
    }

    if (routeSessionKeyRef.current === nextRouteKey) {
      return;
    }

    routeSessionKeyRef.current = nextRouteKey;
    resetSession();

    if (id !== "new") {
      navigate(`/sessions/new?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(routeLevel)}`, {
        replace: true
      });
    }
  }, [defaultLevel, id, levelFromQuery, navigate, resetSession, subject]);

  useEffect(() => {
    if (id === "new" && currentSessionId) {
      navigate(`/sessions/${currentSessionId}?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(levelFromQuery ?? defaultLevel)}`, {
        replace: true
      });
    }
  }, [currentSessionId, defaultLevel, id, levelFromQuery, navigate, subject]);

  useEffect(() => {
    clearError();
  }, [clearError, id]);

  const levelValue = levelFromQuery ?? defaultLevel ?? DEFAULT_LEARNING_LEVEL;
  const levelLabel = getLearningLevelLabel(levelValue);
  const sessionStatus = isLoadingSession ? "正在载入会话" : isStreaming ? "导师正在生成回应" : "可以继续提问";

  return (
    <div className="space-y-4">
      <header className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-800 to-primary p-6 text-white shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-blue-100/80">Socratic Tutor</p>
            <h1 className="mt-2 text-2xl font-semibold">苏格拉底对话</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-50/85">
              围绕当前问题持续追问、拆解前提与推理路径，把模糊想法整理成清晰论证。
            </p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-100/70">学科</p>
              <p className="mt-1 font-medium text-white">{subject}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-100/70">层级</p>
              <p className="mt-1 font-medium text-white">{levelLabel}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-blue-100/70">状态</p>
              <p className="mt-1 font-medium text-white">{sessionStatus}</p>
            </div>
          </div>
        </div>
      </header>
      <MessageList messages={messages} isLoading={isLoadingSession} />

      <MessageInput
        onSend={(content) => sendMessage(content, { subject, level: levelValue })}
        isStreaming={isStreaming}
        isDisabled={isLoadingSession}
        error={error}
        onStop={stopStreaming}
      />
    </div>
  );
}

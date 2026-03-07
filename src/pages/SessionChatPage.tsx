import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageInput } from "@/components/dialogue/MessageInput";
import { MessageList } from "@/components/dialogue/MessageList";
import { useSessionStore } from "@/stores/sessionStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { DEFAULT_LEARNING_LEVEL, getLearningLevelLabel } from "@/utils/learningLevel";

export function SessionChatPage() {
  const { id } = useParams();
  const location = useLocation();
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

  const levelValue = levelFromQuery ?? defaultLevel ?? DEFAULT_LEARNING_LEVEL;
  const routeContextKey = `${subject}::${levelValue}`;
  const routeId = id ?? "new";
  const isFreshRoute = routeId === "new";
  const visibleMessages = isFreshRoute || currentSessionId !== routeId ? [] : messages;

  useLayoutEffect(() => {
    const previousRouteKey = routeSessionKeyRef.current;
    routeSessionKeyRef.current = routeContextKey;

    if (previousRouteKey !== null && previousRouteKey !== routeContextKey) {
      console.info("[SessionChatPage] Subject or level changed, resetting session", {
        from: previousRouteKey,
        to: routeContextKey,
        pathname: location.pathname
      });
      resetSession();

      if (!isFreshRoute) {
        navigate(`/sessions/new?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(levelValue)}`, {
          replace: true
        });
      }
      return;
    }

    if (isFreshRoute) {
      console.info("[SessionChatPage] Entered fresh session route, resetting session", {
        routeContextKey,
        pathname: location.pathname
      });
      resetSession();
    }
  }, [isFreshRoute, levelValue, location.pathname, navigate, resetSession, routeContextKey, subject]);

  useEffect(() => {
    if (!id || isFreshRoute) {
      return;
    }

    void loadSession(id);
  }, [id, isFreshRoute, loadSession]);

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
      <MessageList key={`${routeId}-${routeContextKey}`} messages={visibleMessages} isLoading={isLoadingSession} />

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

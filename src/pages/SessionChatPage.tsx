import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageInput } from "@/components/dialogue/MessageInput";
import { MessageList } from "@/components/dialogue/MessageList";
import { LevelSelector } from "@/components/level/LevelSelector";
import { SessionMaterialUpload } from "@/components/session/SessionMaterialUpload";
import { useSessionStore } from "@/stores/sessionStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import {
  DEFAULT_LEARNING_LEVEL,
  getLearningLevelLabel,
  getLearningLevelOption,
  learningLevelOptions
} from "@/utils/learningLevel";
import type { LearningLevel } from "@/types";

const contextMatchesRoute = (
  activeContext: { subject: string | null; level: string | null } | null,
  subject: string,
  level: string
) => activeContext?.subject === subject && activeContext?.level === level;

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
    materials,
    isStreaming,
    isLoadingSession,
    isLoadingMaterials,
    isUploadingMaterial,
    deletingMaterialIds,
    error,
    activeContext,
    loadSession,
    resetSession,
    clearError,
    sendMessage,
    uploadMaterial,
    deleteMaterial,
    stopStreaming
  } = useSessionStore((state) => ({
    currentSessionId: state.currentSessionId,
    messages: state.messages,
    materials: state.materials,
    isStreaming: state.isStreaming,
    isLoadingSession: state.isLoadingSession,
    isLoadingMaterials: state.isLoadingMaterials,
    isUploadingMaterial: state.isUploadingMaterial,
    deletingMaterialIds: state.deletingMaterialIds,
    error: state.error,
    activeContext: state.activeContext,
    loadSession: state.loadSession,
    resetSession: state.resetSession,
    clearError: state.clearError,
    sendMessage: state.sendMessage,
    uploadMaterial: state.uploadMaterial,
    deleteMaterial: state.deleteMaterial,
    stopStreaming: state.stopStreaming
  }));

  const levelValue = levelFromQuery ?? defaultLevel ?? DEFAULT_LEARNING_LEVEL;
  const routeContextKey = `${subject}::${levelValue}`;
  const routeId = id ?? "new";
  const isFreshRoute = routeId === "new";
  const visibleMessages = isFreshRoute || currentSessionId !== routeId ? [] : messages;
  const visibleMaterials = isFreshRoute || currentSessionId !== routeId ? [] : materials;

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

    void loadSession(id, { subject, level: levelValue });
  }, [id, isFreshRoute, levelValue, loadSession, subject]);

  useEffect(() => {
    if (id === "new" && currentSessionId && contextMatchesRoute(activeContext, subject, levelValue)) {
      navigate(`/sessions/${currentSessionId}?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(levelFromQuery ?? defaultLevel)}`, {
        replace: true
      });
    }
  }, [activeContext, currentSessionId, defaultLevel, id, levelFromQuery, levelValue, navigate, subject]);

  useEffect(() => {
    clearError();
  }, [clearError, id]);

  const levelLabel = getLearningLevelLabel(levelValue);
  const levelOption = getLearningLevelOption(levelValue);
  const sessionStatus = isLoadingSession ? "正在载入会话" : isStreaming ? "导师正在生成回应" : "可以继续提问";
  const currentLevel = (
    learningLevelOptions.find((option) => option.level === levelValue) ?? learningLevelOptions.find((option) => option.level === DEFAULT_LEARNING_LEVEL)!
  ).level;

  const handleLevelChange = (nextLevel: LearningLevel) => {
    if (nextLevel === currentLevel) {
      return;
    }

    navigate(`/sessions/new?subject=${encodeURIComponent(subject)}&level=${encodeURIComponent(nextLevel)}`);
  };

  return (
    <div className="space-y-5">
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

      <section className="grid gap-4 rounded-[32px] border border-[#ddd4c7] bg-[#fbf8f2] p-5 shadow-[0_18px_40px_rgba(68,80,96,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
        <LevelSelector
          value={currentLevel}
          onChange={handleLevelChange}
          title="需要调整这场对话的追问层级吗？"
          description="切换层级会开启新的学习上下文，适合在同一学科下改用更具体或更批判的提问节奏。"
          showDescriptionCard={false}
        />
        <aside className="self-start rounded-[28px] border border-[#ddd3c2] bg-[linear-gradient(180deg,#f8f3ea_0%,#fdfbf7_100%)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">Current Tone</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{levelLabel}</h2>
          <p className="mt-3 text-sm leading-7 text-stone-700">{levelOption.description}</p>
          <div className="mt-5 border-t border-[#e2dbcf] pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">提问重点</p>
            <p className="mt-2 text-sm font-medium leading-7 text-[#5f6f82]">{levelOption.focus}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {levelOption.scenarios.map((scenario) => (
              <span
                key={scenario}
                className="rounded-full border border-[#d9d0c1] bg-[#f3ecdf] px-3 py-1 text-xs font-medium text-stone-700"
              >
                {scenario}
              </span>
            ))}
          </div>
        </aside>
      </section>

      <SessionMaterialUpload
        materials={visibleMaterials}
        isLoading={isLoadingMaterials}
        isUploading={isUploadingMaterial}
        deletingMaterialIds={deletingMaterialIds}
        error={error}
        onUpload={(file) => {
          void uploadMaterial(file, { subject, level: levelValue });
        }}
        onDelete={(materialId) => {
          void deleteMaterial(materialId);
        }}
      />

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

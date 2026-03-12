import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { LevelSelector } from "@/components/level/LevelSelector";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { ThemePreference } from "@/types";
import { getLearningLevelLabel, learningLevelOptions } from "@/utils/learningLevel";

export function SettingsPage() {
  const [savingTarget, setSavingTarget] = useState<"theme" | "level" | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const { defaultLevel, theme, loadPreferences, setDefaultLevel, setTheme } = usePreferencesStore((state) => ({
    defaultLevel: state.defaultLevel,
    theme: state.theme,
    loadPreferences: state.loadPreferences,
    setDefaultLevel: state.setDefaultLevel,
    setTheme: state.setTheme
  }));

  useEffect(() => {
    void loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    if (!savedMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSavedMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [savedMessage]);

  const activeLevel = learningLevelOptions.find((option) => option.level === defaultLevel) ?? learningLevelOptions[0];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(135deg,#efe5d5_0%,#f8f3ea_34%,#dbe6ef_100%)] px-6 py-7 shadow-[0_24px_60px_rgba(44,52,67,0.10)] sm:px-8">
        <div className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full border border-white/55 sm:h-36 sm:w-36" />
        <div className="absolute bottom-[-4rem] left-[10%] h-36 w-36 rounded-full border border-[#cfbea2]/45" />
        <div className="relative grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">Preferences</p>
            <h1 className="mt-4 max-w-[10ch] font-serif text-[clamp(2.4rem,4.5vw,4.6rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-stone-950">
              设定你默认的追问深度
            </h1>
            <p className="mt-4 max-w-[60ch] text-sm leading-8 text-stone-700 sm:text-base">
              这里决定新的学习会话会以什么层级开场。默认水平越清晰，进入一场对话时越不需要反复重新校准节奏。
            </p>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-[#f8f4ec]/85 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6e59]">Current Default</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-stone-950">{getLearningLevelLabel(defaultLevel)}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700">{activeLevel.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {activeLevel.scenarios.map((scenario) => (
                <span key={scenario} className="rounded-full border border-[#d7cebf] bg-white/75 px-3 py-1 text-xs font-medium text-stone-700">
                  {scenario}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[30px] border border-[#ddd4c7] bg-[#fbf8f2] p-5 shadow-[0_18px_40px_rgba(68,80,96,0.08)]">
          <LevelSelector
            value={defaultLevel}
            onChange={async (level) => {
              setSavingTarget("level");
              await setDefaultLevel(level);
              setSavingTarget(null);
              setSavedMessage(`默认提问层级已更新为“${getLearningLevelLabel(level)}”`);
            }}
            title="新的学习会话默认从哪个层级开始？"
            description="这个设置会影响新建学习会话的初始问题深度；你仍然可以在具体会话中单独调整。"
          />
        </div>

        <section className="rounded-[30px] border border-[#ddd4c7] bg-[#fbf8f2] p-5 shadow-[0_18px_40px_rgba(68,80,96,0.08)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Workspace Tone</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">界面主题</h2>
          <p className="mt-2 text-sm leading-7 text-stone-700">阅读与学习区保持同一套视觉语言，但你可以决定它跟随系统还是固定主题。</p>
          <div className="mt-5 flex flex-wrap gap-3">
          {([
            { value: "system", label: "跟随系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" }
          ] as Array<{ value: ThemePreference; label: string }>).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={async () => {
                setSavingTarget("theme");
                await setTheme(option.value);
                setSavingTarget(null);
                setSavedMessage(`界面主题已切换为“${option.label}”`);
              }}
              className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f2] ${
                theme === option.value
                  ? "bg-[#355c7d] text-white"
                  : "bg-white text-stone-700 ring-1 ring-inset ring-[#d6cdbf] hover:bg-[#f4eee4]"
              }`}
            >
              {option.label}
            </button>
          ))}
          </div>
          <div className="mt-5 rounded-[22px] border border-[#e1d7c8] bg-white/80 px-4 py-4 text-sm leading-7 text-stone-700">
            <p className="font-semibold text-stone-950">默认层级预览</p>
            <p className="mt-2">当前为“{getLearningLevelLabel(defaultLevel)}”，新会话会优先采用这种追问力度，再根据具体问题继续深入。</p>
          </div>
        </section>
      </section>

      <Modal
        isOpen={Boolean(savedMessage)}
        onClose={() => setSavedMessage(null)}
        title="偏好已保存"
        description={savingTarget ? "设置正在同步，请稍候。" : savedMessage ?? undefined}
      >
        <div className="space-y-4">
          <p className="text-sm leading-7 text-stone-700">
            {savingTarget ? "更改正在提交，完成后新的学习会话会直接使用这组偏好。" : "新的默认设置会立即应用到后续新建的会话与阅读工作区。"}
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSavedMessage(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[#355c7d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a4963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
            >
              继续
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

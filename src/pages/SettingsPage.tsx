import { useEffect } from "react";
import { LevelSelector } from "@/components/level/LevelSelector";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { ThemePreference } from "@/types";

export function SettingsPage() {
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">偏好设置</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">调整默认提问层级，以及阅读工作区的主题偏好。</p>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">界面主题</h2>
        <div className="mt-4 flex gap-3">
          {([
            { value: "system", label: "跟随系统" },
            { value: "light", label: "浅色" },
            { value: "dark", label: "深色" }
          ] as Array<{ value: ThemePreference; label: string }>).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => void setTheme(option.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium ${
                theme === option.value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <LevelSelector value={defaultLevel} onChange={(level) => void setDefaultLevel(level)} />
      </section>
    </div>
  );
}

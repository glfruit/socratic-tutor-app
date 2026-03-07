import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { LevelSelector } from "@/components/level/LevelSelector";
import { sessionService } from "@/services/sessionService";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { Subject } from "@/types";

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const navigate = useNavigate();
  const { defaultLevel, loadPreferences, setDefaultLevel } = usePreferencesStore((state) => ({
    defaultLevel: state.defaultLevel,
    loadPreferences: state.loadPreferences,
    setDefaultLevel: state.setDefaultLevel
  }));

  useEffect(() => {
    sessionService.getSubjects().then(setSubjects);
    void loadPreferences();
  }, [loadPreferences]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">选择学科</h1>
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <LevelSelector value={defaultLevel} onChange={(level) => void setDefaultLevel(level)} />
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-xl bg-white p-4 shadow-card dark:bg-slate-900">
            <h2 className="text-lg font-medium text-slate-800 dark:text-white">{subject.name}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subject.knowledgePoints.map(kp => kp.name).join(" · ")}</p>
            <Button
              className="mt-4"
              onClick={() => navigate(`/sessions/new?subject=${subject.name}&level=${defaultLevel}`)}
            >
              进入对话
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

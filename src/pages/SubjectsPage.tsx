import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { LevelSelector } from "@/components/level/LevelSelector";
import { sessionService } from "@/services/sessionService";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { getLearningLevelLabel } from "@/utils/learningLevel";
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[40px] border border-[#d9d1c3] bg-[linear-gradient(135deg,#f4edde_0%,#faf6ef_42%,#e1e8f0_100%)] px-6 py-7 shadow-[0_24px_60px_rgba(54,66,84,0.10)] sm:px-8">
        <div className="absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full border border-white/60" />
        <div className="absolute bottom-[-4rem] left-[8%] h-40 w-40 rounded-full border border-[#d9c9ad]/50" />
        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">Study Journey</p>
            <h1 className="mt-4 max-w-[11ch] text-[clamp(2.2rem,4.4vw,4.2rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-stone-900">
              先定学习层级，再进入学科对话。
            </h1>
            <p className="mt-4 max-w-[54ch] text-sm leading-7 text-stone-700">
              水平不会削弱问题质量，只会改变导师追问的角度、抽象程度和示例密度。先把节奏定准，再开始问。
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-[#faf6ef]/85 p-5">
            <div className="flex items-center justify-between border-b border-[#ddd3c3] pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7b6e59]">Current Default</span>
              <span className="text-sm font-semibold text-stone-900">{getLearningLevelLabel(defaultLevel)}</span>
            </div>
            <p className="text-sm leading-7 text-stone-700">
              这个默认水平会带进新的学习会话。你也可以在进入对话后继续调整，并切换到新的上下文。
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#ddd5c7] bg-[#fbf8f2] p-5 shadow-[0_18px_40px_rgba(69,80,96,0.08)] sm:p-6">
        <LevelSelector
          value={defaultLevel}
          onChange={(level) => void setDefaultLevel(level)}
          title="选择这次学习想要的引导层级"
          description="从概念搭建到方法论批判，提问会沿着不同节奏推进。选定之后，再进入具体学科。"
        />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <article
            key={subject.id}
            className="rounded-[28px] border border-[#ddd5c7] bg-[#fcfaf6] p-5 shadow-[0_16px_36px_rgba(73,84,101,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">Subject</p>
            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-stone-900">{subject.name}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              {subject.description || subject.knowledgePoints.map((kp) => kp.name).join(" · ")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {subject.knowledgePoints.slice(0, 4).map((knowledgePoint) => (
                <span
                  key={knowledgePoint.id}
                  className="rounded-full border border-[#ddd3c2] bg-[#f5efe4] px-3 py-1 text-xs font-medium text-stone-700"
                >
                  {knowledgePoint.name}
                </span>
              ))}
            </div>
            <Button
              className="mt-6 rounded-full px-5 py-2.5"
              onClick={() =>
                navigate(
                  `/sessions/new?subject=${encodeURIComponent(subject.name)}&level=${encodeURIComponent(defaultLevel)}`
                )
              }
            >
              进入对话
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

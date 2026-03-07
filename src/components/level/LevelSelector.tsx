import { LevelCard } from "@/components/level/LevelCard";
import { learningLevelOptions } from "@/utils/learningLevel";
import type { LearningLevel } from "@/types";

interface LevelSelectorProps {
  value: LearningLevel;
  onChange: (level: LearningLevel) => void;
}

export const levelOptions = learningLevelOptions;

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">选择提问深度</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">系统会据此调整引导方式，而不是直接降低问题质量。</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-5">
        {levelOptions.map((item) => (
          <LevelCard
            key={item.level}
            level={item.level}
            label={item.label}
            description={item.description}
            selected={item.level === value}
            onSelect={onChange}
          />
        ))}
      </div>
    </section>
  );
}

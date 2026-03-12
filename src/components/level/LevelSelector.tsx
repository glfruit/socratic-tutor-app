import { LevelCard } from "@/components/level/LevelCard";
import { LevelDescriptionCard } from "@/components/level/LevelDescriptionCard";
import { learningLevelOptions } from "@/utils/learningLevel";
import type { LearningLevel } from "@/types";

interface LevelSelectorProps {
  value: LearningLevel;
  onChange: (level: LearningLevel) => void;
  title?: string;
  description?: string;
  showDescriptionCard?: boolean;
}

export function LevelSelector({
  value,
  onChange,
  title = "选择提问深度",
  description = "系统会据此调整引导方式，而不是直接降低问题质量。",
  showDescriptionCard = true
}: LevelSelectorProps) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-stone-900">{title}</h2>
        <p className="mt-2 max-w-[56ch] text-sm leading-7 text-stone-700">{description}</p>
      </div>
      <div role="radiogroup" aria-label={title} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {learningLevelOptions.map((item) => (
          <LevelCard
            key={item.level}
            level={item.level}
            label={item.label}
            description={item.description}
            focus={item.focus}
            selected={item.level === value}
            onSelect={onChange}
          />
        ))}
      </div>
      {showDescriptionCard ? <LevelDescriptionCard level={value} /> : null}
    </section>
  );
}

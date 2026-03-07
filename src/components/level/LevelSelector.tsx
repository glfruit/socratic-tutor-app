import { LevelCard } from "@/components/level/LevelCard";
import type { LearningLevel } from "@/types";

interface LevelSelectorProps {
  value: LearningLevel;
  onChange: (level: LearningLevel) => void;
}

export const levelOptions: Array<{ level: LearningLevel; label: string; description: string }> = [
  { level: "FOUNDATION", label: "启蒙", description: "用更具体的问题帮助建立概念和例子。" },
  { level: "MIDDLE_SCHOOL", label: "初阶", description: "强调现象解释与关键术语辨析。" },
  { level: "HIGH_SCHOOL", label: "标准", description: "平衡抽象推理、结构分析和迁移。" },
  { level: "UNIVERSITY", label: "进阶", description: "追问论证强度、假设边界与方法论。" },
  { level: "ADVANCED", label: "研究", description: "鼓励批判立场、反例构造和跨文本比较。" }
];

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

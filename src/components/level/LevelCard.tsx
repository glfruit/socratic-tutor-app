import type { LearningLevel } from "@/types";

interface LevelCardProps {
  level: LearningLevel;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (level: LearningLevel) => void;
}

export function LevelCard({ level, label, description, selected, onSelect }: LevelCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(level)}
      className={`rounded-[24px] border p-4 text-left transition ${
        selected
          ? "border-primary bg-blue-50 shadow-card dark:border-blue-400 dark:bg-slate-800"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <p className="text-xs tracking-[0.2em] text-slate-400">{label}</p>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </button>
  );
}

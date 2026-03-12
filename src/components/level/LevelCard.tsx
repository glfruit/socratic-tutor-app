import type { LearningLevel } from "@/types";

interface LevelCardProps {
  level: LearningLevel;
  label: string;
  description: string;
  focus: string;
  selected: boolean;
  onSelect: (level: LearningLevel) => void;
}

export function LevelCard({ level, label, description, focus, selected, onSelect }: LevelCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(level)}
      className={`min-h-[168px] rounded-[26px] border px-4 py-4 text-left transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6d86a4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e8] ${
        selected
          ? "border-[#8a9eb8] bg-[linear-gradient(180deg,#f6f9fc_0%,#ecf2f8_100%)] shadow-[0_18px_40px_rgba(78,95,118,0.14)]"
          : "border-[#ddd5c7] bg-[#fcfaf6] hover:border-[#b8ab96] hover:bg-[#f8f3ea]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">Learning Level</p>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-stone-900">{label}</h3>
        </div>
        <span
          className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-[#607998] bg-[#607998] text-[#f6f7fb]" : "border-[#b8ab96] bg-transparent text-transparent"
          }`}
          aria-hidden="true"
        >
          •
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-700">{description}</p>
      <p className="mt-4 text-sm font-medium leading-6 text-[#5f6f82]">{focus}</p>
    </button>
  );
}

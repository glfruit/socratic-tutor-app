import { getLearningLevelOption } from "@/utils/learningLevel";
import type { LearningLevel } from "@/types";

interface LevelDescriptionCardProps {
  level: LearningLevel;
}

export function LevelDescriptionCard({ level }: LevelDescriptionCardProps) {
  const option = getLearningLevelOption(level);

  return (
    <article className="grid gap-5 rounded-[28px] border border-[#d6cec0] bg-[linear-gradient(135deg,#f9f5ec_0%,#f2ede3_48%,#e4ebf2_100%)] p-5 text-stone-900 shadow-[0_20px_50px_rgba(60,72,88,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#786a55]">Level Brief</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">{option.label}</h3>
          <p className="mt-2 max-w-[38ch] text-sm leading-7 text-stone-700">{option.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {option.scenarios.map((scenario) => (
            <div
              key={scenario}
              className="rounded-[20px] border border-white/70 bg-[#fbf7f0] px-4 py-3 text-sm font-medium text-stone-700"
            >
              {scenario}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 self-start rounded-[24px] border border-[#d9d1c2] bg-[#fcfaf6] p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">当前引导重点</p>
          <p className="mt-2 text-base font-semibold text-stone-900">{option.focus}</p>
        </div>
        <div className="border-t border-[#e2dbce] pt-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">导师提问方式</p>
          <p className="mt-2 text-sm leading-7 text-stone-700">{option.guidance}</p>
        </div>
      </div>
    </article>
  );
}

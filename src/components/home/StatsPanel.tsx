import type { HomeStats } from "@/types";

interface StatsPanelProps {
  stats: HomeStats;
}

const statItems = [
  { key: "totalStudyMinutes", label: "专注时长", suffix: "min", note: "本周保持稳定输出" },
  { key: "completedBooks", label: "完成阅读", suffix: "本", note: "从输入走到理解闭环" },
  { key: "currentStreak", label: "连续天数", suffix: "天", note: "节奏比强度更重要" }
] as const;

export function StatsPanel({ stats }: StatsPanelProps) {
  const weeklyMinutes = Math.max(45, Math.round(stats.totalStudyMinutes / 7));

  return (
    <section className="rounded-[32px] border border-[#d6d1c4] bg-[#f7f2e9] p-6 text-stone-900 shadow-[0_18px_40px_rgba(51,61,84,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7b6e59]">Learning Tempo</p>
          <h2 className="max-w-[12ch] font-serif text-[2rem] font-semibold leading-tight tracking-[-0.04em]">
            让今天的学习，有可见的推进感。
          </h2>
          <p className="max-w-md text-sm leading-7 text-stone-700">
            主页不再只是入口。它应该先告诉你最近积累了什么，再把你推向下一步。
          </p>
        </div>
        <div className="rounded-full border border-[#b7c7d7] bg-[#dbe7f1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#284a68]">
          In Rhythm
        </div>
      </div>

      <div className="mt-8 rounded-[28px] bg-[#e4ecf2] p-5 text-[#183248]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#4a647d]">Weekly Cadence</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{weeklyMinutes}</p>
            <p className="mt-1 text-sm text-[#38526a]">平均单日学习分钟</p>
          </div>
          <div className="grid w-full max-w-[12rem] grid-cols-7 items-end gap-2">
            {[0.48, 0.64, 0.52, 0.75, 0.58, 0.82, 0.66].map((height, index) => (
              <div
                key={height}
                className={`rounded-full ${index === 5 ? "bg-[#c4863f]" : "bg-[#284a68]"}`}
                style={{ height: `${Math.round(height * 72)}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {statItems.map((item) => (
          <article key={item.key} className="border-t border-[#d6d1c4] pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-stone-950">
              {stats[item.key]}
              <span className="ml-1 text-sm font-medium text-stone-500">{item.suffix}</span>
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

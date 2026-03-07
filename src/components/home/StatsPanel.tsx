import type { HomeStats } from "@/types";

interface StatsPanelProps {
  stats: HomeStats;
}

const statItems = [
  { key: "totalStudyMinutes", label: "学习分钟", suffix: "min" },
  { key: "completedBooks", label: "完成阅读", suffix: "本" },
  { key: "currentStreak", label: "连续天数", suffix: "天" }
] as const;

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-card dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">你的节奏</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">今天继续沿着问题向前推进。</p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          稳定推进
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {statItems.map((item) => (
          <article key={item.key} className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {stats[item.key]}
              <span className="ml-1 text-sm font-medium text-slate-500">{item.suffix}</span>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

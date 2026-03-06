import { useEffect, useState } from "react";
import { MasteryBar } from "@/components/progress/MasteryBar";
import { RadarChart } from "@/components/progress/RadarChart";
import { progressService } from "@/services/progressService";
import type { MasteryRecord, ProgressStat } from "@/types";

export function ProgressPage() {
  const [stats, setStats] = useState<ProgressStat[]>([]);
  const [radar, setRadar] = useState<Array<{ label: string; value: number }>>([]);
  const [mastery, setMastery] = useState<MasteryRecord[]>([]);

  useEffect(() => {
    progressService.getDashboard().then((data) => {
      setStats(data.stats);
      setRadar(data.radar);
      setMastery(data.mastery);
    });
  }, []);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-slate-900">学习进度</h1>

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-xl bg-white p-4 shadow-card">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <RadarChart points={radar} />

      <section className="space-y-3 rounded-xl bg-white p-5 shadow-card">
        <h2 className="text-lg font-semibold text-slate-900">概念掌握度</h2>
        {mastery.map((item) => (
          <MasteryBar key={item.concept} {...item} />
        ))}
      </section>
    </div>
  );
}

interface RadarPoint {
  label: string;
  value: number;
}

interface RadarChartProps {
  points: RadarPoint[];
}

export function RadarChart({ points }: RadarChartProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-card">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">能力雷达图</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {points.map((point) => (
          <div key={point.label} className="rounded-lg bg-slate-50 p-3 text-center">
            <p className="text-sm text-slate-500">{point.label}</p>
            <p className="text-xl font-semibold text-primary">{point.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

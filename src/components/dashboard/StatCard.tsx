interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-card transition hover:scale-[1.01]">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </article>
  );
}

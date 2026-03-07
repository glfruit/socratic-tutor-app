import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ModeCardProps {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  accent: string;
}

export function ModeCard({ title, description, to, icon, accent }: ModeCardProps) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[28px] border border-white/40 p-6 shadow-card transition duration-200 hover:-translate-y-1 ${accent}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_42%)]" />
      <div className="relative flex min-h-64 flex-col justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/85 text-2xl text-slate-900 shadow-sm">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-700">{description}</p>
          <span className="mt-6 inline-flex items-center text-sm font-semibold text-slate-900">
            进入模式
            <span className="ml-2 transition group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

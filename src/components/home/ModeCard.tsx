import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ModeCardProps {
  eyebrow: string;
  title: string;
  description: string;
  details: string[];
  ctaLabel: string;
  to: string;
  icon: ReactNode;
  tone: "study" | "read";
}

const toneClass = {
  study:
    "bg-[linear-gradient(160deg,oklch(0.89_0.07_82)_0%,oklch(0.8_0.11_72)_55%,oklch(0.72_0.09_62)_100%)] text-stone-950",
  read:
    "bg-[linear-gradient(160deg,oklch(0.88_0.05_240)_0%,oklch(0.78_0.08_228)_55%,oklch(0.68_0.07_218)_100%)] text-slate-950"
} as const;

export function ModeCard({ eyebrow, title, description, details, ctaLabel, to, icon, tone }: ModeCardProps) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-[32px] border border-white/60 p-6 transition duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(38,46,63,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3efe6] focus-visible:ring-[#284a68] ${toneClass[tone]}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.52),transparent_34%)]" />
      <div className="absolute -bottom-10 right-0 h-36 w-36 rounded-full border border-white/35" />
      <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-white/20" />
      <div className="relative flex min-h-[22rem] flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-stone-700/80">{eyebrow}</p>
              <h2 className="max-w-[9ch] font-serif text-[2.6rem] font-semibold leading-[0.92] tracking-[-0.05em]">
                {title}
              </h2>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-white/80 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              {icon}
            </div>
          </div>
          <p className="max-w-sm text-sm leading-7 text-stone-800/88">{description}</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 border-t border-stone-900/10 pt-4">
            {details.map((detail) => (
              <p key={detail} className="text-sm leading-6 text-stone-800/82">
                {detail}
              </p>
            ))}
          </div>
          <span className="inline-flex items-center text-sm font-semibold tracking-[0.02em] text-stone-950">
            {ctaLabel}
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

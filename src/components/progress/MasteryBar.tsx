import type { MasteryRecord } from "@/types";

export function MasteryBar({ concept, level, percent }: MasteryRecord) {
  const colorByLevel: Record<MasteryRecord["level"], string> = {
    BEGINNER: "bg-red-400",
    UNDERSTANDING: "bg-amber-400",
    PROFICIENT: "bg-blue-400",
    MASTERY: "bg-green-500"
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{concept}</span>
        <span className="text-slate-500">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className={`h-2 rounded-full ${colorByLevel[level]}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

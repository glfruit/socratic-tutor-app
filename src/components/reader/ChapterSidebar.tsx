import type { Chapter } from "@/types";

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterId?: string;
  onSelect: (chapterId: string) => void;
}

export function ChapterSidebar({ chapters, activeChapterId, onSelect }: ChapterSidebarProps) {
  return (
    <aside className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h2 className="px-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">目录</h2>
      <div className="mt-3 space-y-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelect(chapter.id)}
            className={`w-full rounded-2xl px-4 py-3 text-left transition ${
              chapter.id === activeChapterId
                ? "bg-blue-50 text-primary dark:bg-slate-800 dark:text-blue-300"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Chapter {chapter.orderIndex + 1}</p>
            <p className="mt-1 font-medium">{chapter.title}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}

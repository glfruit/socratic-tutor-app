import type { Chapter } from "@/types";

interface ProgressBarProps {
  chapters: Chapter[];
  activeChapterId?: string;
  progress: number;
  syncStatus?: "idle" | "saving" | "saved" | "error";
  onSelectChapter: (chapterId: string) => void;
}

const syncStatusLabel = {
  idle: "尚未开始同步",
  saving: "正在保存进度",
  saved: "阅读进度已保存",
  error: "保存失败，稍后会再次尝试"
} as const;

export function ProgressBar({ chapters, activeChapterId, progress, syncStatus = "idle", onSelectChapter }: ProgressBarProps) {
  const activeIndex = chapters.findIndex((chapter) => chapter.id === activeChapterId);
  const previousChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex >= 0 && activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;

  return (
    <section className="overflow-hidden rounded-[30px] border border-[#d8d2c4] bg-[#fcfaf6] px-5 py-5 shadow-[0_18px_44px_rgba(44,52,67,0.07)] sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Reading Progress</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">{progress}%</h2>
            <p className="text-sm leading-7 text-stone-600">
              {activeIndex >= 0 ? `正在第 ${activeIndex + 1} / ${chapters.length} 节` : `共 ${chapters.length} 节`}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                syncStatus === "saved"
                  ? "bg-[#dfe8da] text-[#315444]"
                  : syncStatus === "saving"
                    ? "bg-[#efe2be] text-[#7f5f1f]"
                    : syncStatus === "error"
                      ? "bg-[#ead7d4] text-[#7d3f34]"
                      : "bg-[#eee7da] text-stone-600"
              }`}
            >
              {syncStatusLabel[syncStatus]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => previousChapter && onSelectChapter(previousChapter.id)}
            disabled={!previousChapter}
            className="inline-flex min-h-11 items-center justify-center rounded-[16px] border border-[#d6cdbf] bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-[#f4eee4] disabled:cursor-not-allowed disabled:opacity-45"
          >
            上一节
          </button>
          <button
            type="button"
            onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
            disabled={!nextChapter}
            className="inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[#355c7d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a4963] disabled:cursor-not-allowed disabled:opacity-45"
          >
            下一节
          </button>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#e8dfd2]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,#355c7d_0%,#6f8ba1_100%)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapterId;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onSelectChapter(chapter.id)}
              className={`rounded-[20px] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf6] ${
                isActive
                  ? "border-[#355c7d]/20 bg-[#e7eef5] text-stone-950 shadow-[0_14px_34px_rgba(53,92,125,0.10)]"
                  : "border-[#e2d8c8] bg-white text-stone-700 hover:border-[#d4c8b6] hover:bg-[#fdfaf5]"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isActive ? "text-[#355c7d]" : "text-stone-500"}`}>
                Chapter {chapter.orderIndex + 1}
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6">{chapter.title}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

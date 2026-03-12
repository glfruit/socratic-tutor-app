import type { Chapter } from "@/types";

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterId?: string;
  onSelect: (chapterId: string) => void;
}

export function ChapterSidebar({ chapters, activeChapterId, onSelect }: ChapterSidebarProps) {
  return (
    <aside className="overflow-hidden rounded-[30px] border border-[#d8d2c4] bg-[#f8f4ec]/92 shadow-[0_18px_44px_rgba(44,52,67,0.07)] xl:sticky xl:top-6">
      <div className="border-b border-[#e1d7c8] px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Contents</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <h2 className="font-serif text-[1.55rem] font-semibold leading-tight text-stone-950">章节导航</h2>
          <span className="text-sm text-stone-600">{chapters.length} 节</span>
        </div>
      </div>

      {chapters.length === 0 ? (
        <div className="px-5 py-6 text-sm leading-7 text-stone-600">文档目录还未生成，稍后再进入阅读。</div>
      ) : (
        <div className="overflow-x-auto px-3 py-3 xl:max-h-[calc(100vh-16rem)] xl:overflow-y-auto xl:overflow-x-visible">
          <div className="flex gap-3 xl:flex-col">
            {chapters.map((chapter) => {
              const isActive = chapter.id === activeChapterId;

              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => onSelect(chapter.id)}
                  className={`min-w-[15rem] rounded-[24px] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f4ec] xl:min-w-0 ${
                    isActive
                      ? "border-[#355c7d]/20 bg-[#e7eef5] text-stone-950 shadow-[0_14px_34px_rgba(53,92,125,0.12)]"
                      : "border-transparent bg-[#fbf7f1] text-stone-700 hover:border-[#dfd5c5] hover:bg-white"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isActive ? "text-[#355c7d]" : "text-stone-500"}`}>
                    Chapter {chapter.orderIndex + 1}
                  </p>
                  <p className="mt-2 max-h-12 overflow-hidden text-base font-semibold leading-6">{chapter.title}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    {isActive ? "正在阅读这一节，继续向下深入。" : "切换到本节，围绕章节内容继续提问。"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

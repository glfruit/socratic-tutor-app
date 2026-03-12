import { useEffect, useRef } from "react";
import { TextSelectionToolbar } from "@/components/reader/TextSelectionToolbar";
import type { Chapter } from "@/types";

interface ReadingAreaProps {
  chapter: Chapter | null;
  isLoading?: boolean;
  selectedText: string;
  onSelectText: (text: string) => void;
  onAskAboutSelection: () => void;
}

export function ReadingArea({ chapter, isLoading = false, selectedText, onSelectText, onAskAboutSelection }: ReadingAreaProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onSelectText("");
  }, [chapter?.id, onSelectText]);

  const captureSelection = () => {
    const selection = window.getSelection()?.toString().trim() ?? "";
    if (!contentRef.current?.contains(window.getSelection()?.anchorNode ?? null)) {
      return;
    }
    onSelectText(selection);
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#d8d2c4] bg-[#fcfaf6] shadow-[0_18px_44px_rgba(44,52,67,0.08)]">
      <div className="border-b border-[#e5ddcf] px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Reading Focus</p>
            <h2 className="mt-3 font-serif text-[clamp(2rem,3vw,3rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-stone-950">
              {chapter?.title ?? (isLoading ? "载入章节中" : "选择一个章节开始阅读")}
            </h2>
          </div>

          <div className="grid max-w-full grid-cols-2 gap-3 text-sm text-stone-600 sm:max-w-[20rem]">
            <div className="rounded-[20px] border border-[#e2d8c8] bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">当前位置</p>
              <p className="mt-2 font-semibold text-stone-950">{chapter ? `第 ${chapter.orderIndex + 1} 节` : "--"}</p>
            </div>
            <div className="rounded-[20px] border border-[#e2d8c8] bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">操作提示</p>
              <p className="mt-2 font-semibold text-stone-950">{selectedText ? "已选中段落" : "拖选文本提问"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7 sm:py-7">
        <div
          ref={contentRef}
          onMouseUp={captureSelection}
          onTouchEnd={captureSelection}
          className="mx-auto max-w-[72ch]"
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-[#e8dece]" />
              <div className="h-4 w-full animate-pulse rounded-full bg-[#efe6d8]" />
              <div className="h-4 w-[94%] animate-pulse rounded-full bg-[#efe6d8]" />
              <div className="h-4 w-[90%] animate-pulse rounded-full bg-[#efe6d8]" />
              <div className="h-4 w-[72%] animate-pulse rounded-full bg-[#efe6d8]" />
            </div>
          ) : chapter?.content ? (
            <div className="space-y-5 whitespace-pre-wrap text-[1.04rem] leading-8 text-stone-700 sm:text-[1.08rem] sm:leading-9">
              {chapter.content.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={`${chapter.id}-${index}`} className="text-pretty">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d9cfbe] bg-[#f6f0e6] px-5 py-6 text-sm leading-7 text-stone-600 sm:px-6">
              当前文档还没有可展示的章节内容。可以先切换章节，或等待解析完成后再进入阅读。
            </div>
          )}
        </div>
      </div>

      <TextSelectionToolbar
        selectedText={selectedText}
        onAsk={onAskAboutSelection}
        onClear={() => onSelectText("")}
      />
    </section>
  );
}

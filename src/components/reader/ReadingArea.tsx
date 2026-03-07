import { useEffect, useRef } from "react";
import { TextSelectionToolbar } from "@/components/reader/TextSelectionToolbar";
import type { Chapter } from "@/types";

interface ReadingAreaProps {
  chapter: Chapter | null;
  selectedText: string;
  onSelectText: (text: string) => void;
  onAskAboutSelection: () => void;
}

export function ReadingArea({ chapter, selectedText, onSelectText, onAskAboutSelection }: ReadingAreaProps) {
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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">正在阅读</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{chapter?.title ?? "选择章节"}</h2>
        </div>
      </div>
      <div
        ref={contentRef}
        onMouseUp={captureSelection}
        onTouchEnd={captureSelection}
        className="prose max-w-none whitespace-pre-wrap leading-8 text-slate-700 dark:prose-invert dark:text-slate-200"
      >
        {chapter?.content ?? "当前文档还没有可展示的章节内容。"}
      </div>
      <TextSelectionToolbar
        selectedText={selectedText}
        onAsk={onAskAboutSelection}
        onClear={() => onSelectText("")}
      />
    </section>
  );
}

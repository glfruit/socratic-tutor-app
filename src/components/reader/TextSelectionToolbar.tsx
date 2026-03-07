interface TextSelectionToolbarProps {
  selectedText: string;
  onAsk: () => void;
  onClear: () => void;
}

export function TextSelectionToolbar({ selectedText, onAsk, onClear }: TextSelectionToolbarProps) {
  if (!selectedText) {
    return null;
  }

  return (
    <div className="sticky bottom-4 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-card backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">已选文本</p>
        <p className="truncate text-sm text-slate-700 dark:text-slate-200">{selectedText}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onAsk}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
        >
          提问
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          清除
        </button>
      </div>
    </div>
  );
}

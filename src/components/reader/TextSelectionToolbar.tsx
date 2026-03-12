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
    <div className="sticky bottom-4 mx-5 mb-5 flex flex-col gap-4 rounded-[24px] border border-[#d8cfbf] bg-[#fbf7f1]/96 p-4 shadow-[0_20px_42px_rgba(44,52,67,0.12)] backdrop-blur sm:mx-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b6e59]">Selected Passage</p>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-stone-700">“{selectedText}”</p>
        <p className="mt-2 text-xs leading-6 text-stone-500">围绕这段原文继续追问，比跳出文本直接求答案更有效。</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onAsk}
          className="inline-flex min-h-11 items-center justify-center rounded-[16px] bg-[#355c7d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a4963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
        >
          围绕这段提问
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center justify-center rounded-[16px] border border-[#d6cdbf] bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-[#f4eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
        >
          清除选择
        </button>
      </div>
    </div>
  );
}

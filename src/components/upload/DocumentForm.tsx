import type { ChangeEvent } from "react";
import type { DocumentType } from "@/types";

export interface DocumentFormValue {
  title: string;
  description: string;
  type: DocumentType;
}

interface DocumentFormProps {
  value: DocumentFormValue;
  onChange: (value: DocumentFormValue) => void;
  disabled?: boolean;
  fileName?: string | null;
}

const typeCards = [
  {
    value: "BOOK" as const,
    label: "书籍",
    description: "适合章节化阅读、逐段提问与长期阅读进度。"
  },
  {
    value: "MATERIAL" as const,
    label: "学习资料",
    description: "适合讲义、课堂资料、论文摘录与参考文本。"
  }
];

export function DocumentForm({ value, onChange, disabled = false, fileName }: DocumentFormProps) {
  const update =
    (key: keyof DocumentFormValue) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: event.target.value });

  return (
    <section className="rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(180deg,rgba(248,244,236,0.96)_0%,rgba(241,236,226,0.98)_100%)] p-6 shadow-[0_20px_52px_rgba(44,52,67,0.10)] dark:border-slate-800 dark:bg-slate-900">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7b6e59]">Metadata</p>
      <h2 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white">文档信息</h2>
      <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-slate-400">
        为上传内容补充标题与背景，后续在文档库与阅读界面里会更容易识别。
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {typeCards.map((card) => {
          const selected = value.type === card.value;

          return (
            <button
              key={card.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ ...value, type: card.value })}
              className={`rounded-[24px] border px-4 py-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f5674] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4eee3] disabled:cursor-not-allowed disabled:opacity-60 ${
                selected
                  ? "border-[#365a74] bg-[#dfe7ef]"
                  : "border-white/70 bg-white/75 text-stone-700 hover:border-[#c8baa0] hover:bg-[#f6f0e5]"
              }`}
            >
              <p className="text-sm font-semibold text-stone-900">{card.label}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">{card.description}</p>
            </button>
          );
        })}
      </div>

      {fileName ? (
        <div className="mt-5 rounded-[22px] border border-white/80 bg-white/75 px-4 py-3 text-sm leading-6 text-stone-700 dark:bg-slate-950 dark:text-slate-300">
          当前文件：<span className="font-semibold text-stone-900 dark:text-white">{fileName}</span>
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-stone-800 dark:text-slate-300">标题</span>
          <input
            value={value.title}
            onChange={update("title")}
            placeholder="例如：批判性思维导论"
            disabled={disabled}
            className="min-h-12 w-full rounded-2xl border border-[#d5cec1] bg-white/80 px-4 py-3 text-sm text-stone-900 outline-none ring-[#284a68] placeholder:text-stone-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-stone-800 dark:text-slate-300">描述</span>
          <textarea
            value={value.description}
            onChange={update("description")}
            placeholder="补充作者、用途、课程背景或希望重点关注的章节"
            rows={5}
            disabled={disabled}
            className="w-full rounded-2xl border border-[#d5cec1] bg-white/80 px-4 py-3 text-sm leading-7 text-stone-900 outline-none ring-[#284a68] placeholder:text-stone-400 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>
    </section>
  );
}

import type { ChangeEvent } from "react";
import type { DocumentType } from "@/types";

interface DocumentFormValue {
  title: string;
  description: string;
  type: DocumentType;
}

interface DocumentFormProps {
  value: DocumentFormValue;
  onChange: (value: DocumentFormValue) => void;
}

export function DocumentForm({ value, onChange }: DocumentFormProps) {
  const update =
    (key: keyof DocumentFormValue) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...value, [key]: event.target.value });

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">文档信息</h2>
      <div className="mt-4 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">类型</span>
          <select
            value={value.type}
            onChange={update("type")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="BOOK">书籍</option>
            <option value="MATERIAL">学习资料</option>
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">标题</span>
          <input
            value={value.title}
            onChange={update("title")}
            placeholder="例如：批判性思维导论"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">描述</span>
          <textarea
            value={value.description}
            onChange={update("description")}
            placeholder="补充作者、用途或课堂背景"
            rows={4}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import type { DocumentSummary } from "@/types";

interface DocumentCardProps {
  document: DocumentSummary;
  onDelete?: (documentId: string) => void;
}

const statusLabel = {
  PROCESSING: "解析中",
  READY: "可阅读",
  ERROR: "异常"
} as const;

const typeLabel = {
  BOOK: "书籍",
  MATERIAL: "学习资料"
} as const;

const statusClass = {
  PROCESSING: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-200",
  READY: "bg-emerald-100 text-emerald-900 ring-1 ring-inset ring-emerald-200",
  ERROR: "bg-rose-100 text-rose-900 ring-1 ring-inset ring-rose-200"
} as const;

const typeAccent = {
  BOOK: "from-[#d8c29b] via-[#f4ebdb] to-[#f7f3ec]",
  MATERIAL: "from-[#b8cad8] via-[#e7eef5] to-[#f5f7fa]"
} as const;

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-[#d9d2c5] bg-[#fbf7f1] p-5 shadow-[0_20px_44px_rgba(50,56,70,0.08)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(50,56,70,0.13)]">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${typeAccent[document.type]} opacity-95`} />
      <div className="absolute right-4 top-4 h-20 w-20 rounded-full border border-white/55" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {typeLabel[document.type]}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[document.status]}`}>
                {statusLabel[document.status]}
              </span>
            </div>
            <h3 className="mt-4 line-clamp-2 text-[1.55rem] font-semibold leading-[1.05] tracking-[-0.04em] text-stone-950">
              {document.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              {document.author || document.description || "暂无作者与补充说明，仍可进入文档库统一管理。"}
            </p>
          </div>
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white/80 text-sm font-semibold text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:flex">
            {document.type === "BOOK" ? "BK" : "MD"}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-white/75 bg-white/80 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">导入日期</p>
            <p className="mt-2 text-sm font-medium text-stone-900">{new Date(document.createdAt).toLocaleDateString("zh-CN")}</p>
          </div>
          <div className="rounded-[20px] border border-white/75 bg-white/80 px-4 py-3">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
              <span>阅读进度</span>
              <span className="text-stone-700">{document.progress}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7dfd2]">
              <div
                className={`h-full rounded-full ${
                  document.status === "READY" ? "bg-[#355c7d]" : document.status === "ERROR" ? "bg-[#b4534f]" : "bg-[#af8f4d]"
                }`}
                style={{ width: `${document.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#ddd5c7] pt-4">
          <p className="text-sm text-stone-600">
            {document.status === "READY"
              ? "已进入可搜索、可阅读状态。"
              : document.status === "PROCESSING"
                ? "系统正在解析内容与建立索引。"
                : "处理出现异常，建议重新上传。"}
          </p>
          <div className="flex flex-wrap gap-2">
            {document.type === "BOOK" && document.status === "READY" ? (
              <Link
                to={`/reader/${document.id}`}
                className="rounded-[16px] bg-[#355c7d] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a4963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
              >
                进入阅读
              </Link>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(document.id)}
                className="rounded-[16px] border border-[#d6cdbf] bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-[#f4eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
              >
                删除
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

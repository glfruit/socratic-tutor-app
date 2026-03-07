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

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{document.type}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{document.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{document.author || document.description || "暂无补充信息"}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {statusLabel[document.status]}
        </span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>进度</span>
          <span>{document.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-primary" style={{ width: `${document.progress}%` }} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-slate-400">{new Date(document.createdAt).toLocaleDateString("zh-CN")}</span>
        <div className="flex gap-2">
          {document.type === "BOOK" && document.status === "READY" ? (
            <Link
              to={`/reader/${document.id}`}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              打开
            </Link>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(document.id)}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              删除
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

import { DocumentCard } from "@/components/documents/DocumentCard";
import type { DocumentSummary } from "@/types";

interface DocumentListProps {
  documents: DocumentSummary[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentList({ documents, isLoading = false, hasMore = false, onLoadMore, onDelete }: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[300px] animate-pulse rounded-[30px] border border-[#d9d2c5] bg-[linear-gradient(180deg,#f8f3eb_0%,#f2ecdf_100%)]"
          />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-[#cfc5b4] bg-[#f7f1e6] px-6 py-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">No Match</p>
        <h2 className="mt-3 text-2xl font-semibold text-stone-900">当前筛选条件下没有文档</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-600">
          可以放宽关键词、切换类型或状态，也可以继续上传新的书籍与资料，把它们纳入统一阅读库。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <DocumentCard key={document.id} document={document} onDelete={onDelete} />
        ))}
      </div>

      {hasMore && onLoadMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className="inline-flex min-h-12 items-center justify-center rounded-[18px] border border-[#d6cdbf] bg-[#fbf7f1] px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e6]"
          >
            加载更多
          </button>
        </div>
      ) : null}
    </div>
  );
}

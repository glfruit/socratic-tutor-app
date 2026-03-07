import { DocumentCard } from "@/components/documents/DocumentCard";
import type { DocumentSummary } from "@/types";

interface DocumentListProps {
  documents: DocumentSummary[];
  onDelete?: (documentId: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        没有匹配的文档，尝试调整筛选条件或上传新内容。
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} onDelete={onDelete} />
      ))}
    </div>
  );
}

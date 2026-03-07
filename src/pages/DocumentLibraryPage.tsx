import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocumentsStore } from "@/stores/useDocumentsStore";

export function DocumentLibraryPage() {
  const { items, filters, loadDocuments, setFilters, deleteDocument } = useDocumentsStore((state) => ({
    items: state.items,
    filters: state.filters,
    loadDocuments: state.loadDocuments,
    setFilters: state.setFilters,
    deleteDocument: state.deleteDocument
  }));

  useEffect(() => {
    void loadDocuments();
  }, [filters.search, filters.status, filters.type, loadDocuments]);

  const counts = useMemo(
    () => ({
      total: items.length,
      ready: items.filter((item) => item.status === "READY").length,
      processing: items.filter((item) => item.status === "PROCESSING").length
    }),
    [items]
  );

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">文档库</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">搜索书籍、课堂讲义和正在处理的阅读材料。</p>
        </div>
        <Link to="/upload" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
          上传文档
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <input
          value={filters.search}
          onChange={(event) => setFilters({ search: event.target.value })}
          placeholder="搜索标题、作者或描述"
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <select
          value={filters.type}
          onChange={(event) => setFilters({ type: event.target.value as typeof filters.type })}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">全部类型</option>
          <option value="BOOK">书籍</option>
          <option value="MATERIAL">学习资料</option>
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="ALL">全部状态</option>
          <option value="READY">可阅读</option>
          <option value="PROCESSING">处理中</option>
          <option value="ERROR">异常</option>
        </select>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">总数</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.total}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">可阅读</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.ready}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">处理中</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{counts.processing}</p>
        </div>
      </section>

      <DocumentList documents={items} onDelete={(documentId) => void deleteDocument(documentId)} />
    </div>
  );
}

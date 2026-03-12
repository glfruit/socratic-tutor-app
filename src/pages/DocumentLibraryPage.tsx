import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DocumentList } from "@/components/documents/DocumentList";
import { useDocumentsStore } from "@/stores/useDocumentsStore";

const typeOptions = [
  { value: "ALL", label: "全部类型" },
  { value: "BOOK", label: "书籍" },
  { value: "MATERIAL", label: "学习资料" }
] as const;

const statusOptions = [
  { value: "ALL", label: "全部状态" },
  { value: "READY", label: "可阅读" },
  { value: "PROCESSING", label: "处理中" },
  { value: "ERROR", label: "异常" }
] as const;

export function DocumentLibraryPage() {
  const { items, filteredItems, filters, isLoading, error, loadDocuments, setFilters, deleteDocument } = useDocumentsStore((state) => ({
    items: state.items,
    filteredItems: state.filteredItems,
    filters: state.filters,
    isLoading: state.isLoading,
    error: state.error,
    loadDocuments: state.loadDocuments,
    setFilters: state.setFilters,
    deleteDocument: state.deleteDocument
  }));

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const counts = useMemo(
    () => ({
      total: items.length,
      visible: filteredItems.length,
      ready: items.filter((item) => item.status === "READY").length,
      processing: items.filter((item) => item.status === "PROCESSING").length
    }),
    [filteredItems.length, items]
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[40px] border border-[#d8d2c4] bg-[linear-gradient(135deg,#efe5d5_0%,#f8f3ea_38%,#dfe7ef_100%)] px-6 py-8 shadow-[0_24px_60px_rgba(44,52,67,0.10)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute left-[12%] top-[-4rem] h-40 w-40 rounded-full border border-white/45" />
        <div className="absolute bottom-[-5rem] right-[-1rem] h-52 w-52 rounded-full border border-[#cfbea2]/45" />
        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b6e59]">Document Library</p>
            <h1 className="mt-4 max-w-[10ch] text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-stone-950">
              把上传后的资料整理成可阅读的馆藏
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-8 text-stone-700">
              这里承接上传后的所有内容。你可以按类型、处理状态与关键词快速收拢结果，再进入阅读、回看讲义或清理失效文档。
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-[#f8f4ec]/85 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#d8d2c4] pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Overview</span>
              <span className="text-sm font-medium text-stone-700">
                {counts.visible} / {counts.total} 可见
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="flex items-end justify-between rounded-[20px] border border-white/70 bg-white/78 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">总文档</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">{counts.total}</p>
                </div>
                <span className="text-sm text-stone-600">全部馆藏</span>
              </div>
              <div className="flex items-end justify-between rounded-[20px] border border-white/70 bg-white/78 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">可阅读</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">{counts.ready}</p>
                </div>
                <span className="text-sm text-stone-600">已完成解析</span>
              </div>
              <div className="flex items-end justify-between rounded-[20px] border border-white/70 bg-white/78 px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">处理中</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">{counts.processing}</p>
                </div>
                <span className="text-sm text-stone-600">等待就绪</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-[#d8d2c4] bg-[#fbf7f1] p-5 shadow-[0_18px_44px_rgba(44,52,67,0.07)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Find & Filter</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">按内容、类型和状态缩小范围</h2>
          </div>
          <Link
            to="/upload"
            className="inline-flex min-h-12 items-center justify-center rounded-[18px] bg-[#355c7d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a4963] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
          >
            上传新文档
          </Link>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">搜索文档</span>
            <input
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              placeholder="搜索标题、作者或描述"
              className="min-h-12 w-full rounded-[18px] border border-[#d5ccbd] bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#355c7d] focus:ring-2 focus:ring-[#355c7d]/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">文档类型</span>
            <select
              value={filters.type}
              onChange={(event) => setFilters({ type: event.target.value as typeof filters.type })}
              className="min-h-12 w-full rounded-[18px] border border-[#d5ccbd] bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#355c7d] focus:ring-2 focus:ring-[#355c7d]/20"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">处理状态</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}
              className="min-h-12 w-full rounded-[18px] border border-[#d5ccbd] bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#355c7d] focus:ring-2 focus:ring-[#355c7d]/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {typeOptions.slice(1).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFilters({
                  type: filters.type === option.value ? "ALL" : option.value
                })
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1] ${
                filters.type === option.value ? "bg-[#355c7d] text-white" : "bg-[#efe7db] text-stone-700 hover:bg-[#e7ddcd]"
              }`}
            >
              {option.label}
            </button>
          ))}
          {statusOptions.slice(1).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFilters({
                  status: filters.status === option.value ? "ALL" : option.value
                })
              }
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1] ${
                filters.status === option.value ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-inset ring-[#d6cdbf] hover:bg-[#f3eee5]"
              }`}
            >
              {option.label}
            </button>
          ))}
          {(filters.search || filters.type !== "ALL" || filters.status !== "ALL") && (
            <button
              type="button"
              onClick={() => setFilters({ search: "", type: "ALL", status: "ALL" })}
              className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 underline decoration-[#b4a690] underline-offset-4 transition hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf7f1]"
            >
              清除筛选
            </button>
          )}
        </div>
      </section>

      {error ? (
        <section className="rounded-[24px] border border-[#e4c7c4] bg-[#f9ecea] px-5 py-4 text-sm text-[#8a4942]">
          {error}
        </section>
      ) : null}

      <DocumentList
        documents={filteredItems}
        isLoading={isLoading}
        onDelete={(documentId) => void deleteDocument(documentId)}
      />
    </div>
  );
}

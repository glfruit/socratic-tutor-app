import { useRef, type ChangeEvent } from "react";
import type { SessionMaterial } from "@/types";

interface SessionMaterialUploadProps {
  materials: SessionMaterial[];
  isLoading: boolean;
  isUploading: boolean;
  deletingMaterialIds: string[];
  error?: string | null;
  onUpload: (file: File) => void;
  onDelete: (materialId: string) => void;
}

const maxFileSize = 50 * 1024 * 1024;
const acceptedExtensions = [".epub", ".pdf", ".docx", ".txt"];

const statusLabel = {
  PROCESSING: "解析中",
  READY: "可引用",
  ERROR: "异常"
} as const;

const statusClass = {
  PROCESSING: "bg-[#efe2be] text-[#7f5f1f]",
  READY: "bg-[#dce8da] text-[#315444]",
  ERROR: "bg-[#ead7d4] text-[#7d3f34]"
} as const;

const formatBytes = (size?: number) => {
  if (!size) {
    return "未记录大小";
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const isAcceptedFile = (file: File) => {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return acceptedExtensions.includes(extension);
};

export function SessionMaterialUpload({
  materials,
  isLoading,
  isUploading,
  deletingMaterialIds,
  error,
  onUpload,
  onDelete
}: SessionMaterialUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isAcceptedFile(file) || file.size > maxFileSize) {
      event.target.value = "";
      return;
    }

    onUpload(file);
    event.target.value = "";
  };

  return (
    <section className="overflow-hidden rounded-[32px] border border-[#ddd4c7] bg-[linear-gradient(180deg,#f8f3ea_0%,#fdfbf7_100%)] p-5 shadow-[0_18px_40px_rgba(68,80,96,0.08)]">
      <div className="flex flex-col gap-4 border-b border-[#e2dbcf] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b7c67]">Session Materials</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-stone-900">参考资料</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-700">
            上传讲义、笔记或原始文本，让当前对话在追问时引用更具体的依据。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#d8d0c2] bg-[#f3ecdf] px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-700">
            EPUB / PDF / DOCX / TXT
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex min-h-11 items-center justify-center rounded-[18px] bg-[#284a68] px-4 py-3 text-sm font-semibold text-[#f7f2e9] transition hover:bg-[#1f3b54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#284a68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdfbf7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "上传中..." : "上传资料"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedExtensions.join(",")}
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.72fr_1fr]">
        <div className="rounded-[24px] border border-[#e0d7ca] bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">Upload Notes</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li>单文件上限 50MB，适合上传课堂讲义、习题说明和原始文本。</li>
            <li>上传后会先进入解析状态，稍后可被会话引用。</li>
            <li>资料只挂在当前学习会话，不会替代文档库里的正式书籍。</li>
          </ul>
          {error ? (
            <p className="mt-4 rounded-[18px] border border-[#d8b0a8] bg-[#f5e6e1] px-4 py-3 text-sm text-[#8d3f32]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="rounded-[24px] border border-[#e0d7ca] bg-[#fcfaf6] p-4">
          <div className="flex items-center justify-between border-b border-[#ebe3d7] pb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b7c67]">Attached Files</p>
            <span className="text-sm font-medium text-stone-700">{materials.length} 份资料</span>
          </div>

          {isLoading ? (
            <p className="py-6 text-sm text-stone-600">正在读取资料列表...</p>
          ) : materials.length === 0 ? (
            <p className="py-6 text-sm leading-7 text-stone-600">当前会话还没有参考资料。上传一份讲义或笔记后，列表会显示在这里。</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="flex flex-col gap-3 rounded-[22px] border border-[#e6ddd0] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(68,80,96,0.05)] sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[material.status]}`}>
                        {statusLabel[material.status]}
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                        {new Date(material.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="mt-3 truncate text-base font-semibold text-stone-900">{material.title}</p>
                    <p className="mt-1 truncate text-sm text-stone-600">{material.filename}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-500">{formatBytes(material.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(material.id)}
                    disabled={deletingMaterialIds.includes(material.id)}
                    className="inline-flex min-h-10 items-center justify-center self-start rounded-[16px] border border-[#d6cdbf] bg-[#fbf7f1] px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-[#f4eee4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfaf6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingMaterialIds.includes(material.id) ? "删除中..." : "删除"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

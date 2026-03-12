import { useMemo } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import type { DocumentType } from "@/types";

interface FileUploadProps {
  file: File | null;
  type: DocumentType;
  onFileSelect: (file: File) => void;
  error?: string | null;
  onError?: (message: string | null) => void;
  disabled?: boolean;
}

const maxFileSize = 50 * 1024 * 1024;
const acceptedFileTypes = {
  "application/epub+zip": [".epub"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"]
};

const extensionMeta = {
  epub: { badge: "EPUB", tint: "bg-[#dce9df] text-[#315444]" },
  pdf: { badge: "PDF", tint: "bg-[#ead7d4] text-[#7d3f34]" },
  docx: { badge: "DOCX", tint: "bg-[#dbe4f2] text-[#2d4e79]" },
  txt: { badge: "TXT", tint: "bg-[#e7dfcf] text-[#67563a]" }
} as const;

const formatBytes = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(size / 1024)} KB`;
};

const getFileExtension = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const validateFile = (candidate: File) => {
  const extension = getFileExtension(candidate.name);

  if (!(extension in extensionMeta)) {
    return "仅支持 EPUB、PDF、DOCX 或 TXT 文件。";
  }

  if (candidate.size > maxFileSize) {
    return "文件大小不能超过 50MB。";
  }

  return null;
};

const getRejectionMessage = (rejection: FileRejection) => {
  if (rejection.errors.some((error) => error.code === "file-too-large")) {
    return "文件大小不能超过 50MB。";
  }

  if (rejection.errors.some((error) => error.code === "file-invalid-type")) {
    return "仅支持 EPUB、PDF、DOCX 或 TXT 文件。";
  }

  return rejection.errors[0]?.message ?? "文件暂时无法上传，请重试。";
};

export function FileUpload({ file, type, onFileSelect, error, onError, disabled = false }: FileUploadProps) {
  const fileMeta = useMemo(() => {
    if (!file) {
      return null;
    }

    return extensionMeta[getFileExtension(file.name) as keyof typeof extensionMeta] ?? null;
  }, [file]);

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    accept: acceptedFileTypes,
    multiple: false,
    maxSize: maxFileSize,
    disabled,
    noClick: true,
    onDropAccepted: (acceptedFiles) => {
      const picked = acceptedFiles[0];
      const validationError = validateFile(picked);

      if (validationError) {
        onError?.(validationError);
        return;
      }

      onError?.(null);
      onFileSelect(picked);
    },
    onDropRejected: (rejections) => {
      onError?.(getRejectionMessage(rejections[0]));
    }
  });

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(180deg,rgba(248,244,236,0.96)_0%,rgba(241,235,224,0.96)_100%)] p-6 shadow-[0_24px_60px_rgba(44,52,67,0.10)] dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full border border-white/60" />
      <div className="absolute bottom-[-3.5rem] left-[-1rem] h-36 w-36 rounded-full border border-[#d9c9a8]/50" />
      <div className="relative mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#7b6e59]">Document Intake</p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-900 dark:text-white">上传文档</h2>
          <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-slate-400">
            支持 EPUB、PDF、TXT、DOCX，单文件上限 50MB。
          </p>
        </div>
        <span className="rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold text-stone-800 shadow-sm dark:bg-slate-800 dark:text-blue-300">
          {type === "BOOK" ? "阅读模式" : "学习资料"}
        </span>
      </div>

      <div
        {...getRootProps({
          role: "group",
          "aria-label": "文档上传拖拽区域"
        })}
        className={`relative rounded-[28px] border border-dashed px-6 py-9 transition duration-300 ease-out focus-within:ring-2 focus-within:ring-[#2f5674] focus-within:ring-offset-4 focus-within:ring-offset-[#f4eee3] ${
          disabled
            ? "cursor-not-allowed border-[#d5cec1] bg-[#ece6dc]/80 opacity-70"
            : isDragReject || error
              ? "border-[#b85c4c] bg-[#f3e0db]"
              : isDragActive
                ? "border-[#365a74] bg-[#dfe7ef]"
                : "border-[#cbbda5] bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(244,238,227,0.92)_100%)] hover:border-[#365a74] hover:bg-[#eef2f6]"
        }`}
      >
        <input {...getInputProps()} />
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/70 bg-white/80 text-xl text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]">
              {fileMeta?.badge ?? "↑"}
            </div>
            <strong className="mt-5 block text-xl font-semibold text-stone-900 dark:text-white">
              {isDragActive ? "松开以上传文件" : "拖拽文件到这里，或从本机选择"}
            </strong>
            <p className="mt-2 max-w-[36rem] text-sm leading-7 text-stone-700 dark:text-slate-400">
              上传后会自动进入解析与索引流程，适合阅读书籍与课堂资料。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.values(extensionMeta).map((meta) => (
                <span
                  key={meta.badge}
                  className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] ${meta.tint}`}
                >
                  {meta.badge}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between text-sm text-stone-700">
              <span>上传方式</span>
              <span className="font-semibold text-stone-900">{isDragActive ? "拖拽中" : "单文件"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-700">
              <span>建议内容</span>
              <span className="font-semibold text-stone-900">{type === "BOOK" ? "章节型文档" : "讲义 / 资料"}</span>
            </div>
            {file ? (
              <div className="rounded-[20px] bg-[#f5efe3] px-4 py-3 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-white">{file.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                      {fileMeta?.badge ?? "FILE"} · {formatBytes(file.size)}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#dfe7ef] px-2.5 py-1 text-[11px] font-semibold text-[#365a74]">
                    已选择
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-[20px] bg-[#f5efe3] px-4 py-3 text-sm leading-6 text-stone-600 dark:bg-slate-950 dark:text-slate-300">
                还未选择文件。优先上传结构清晰的电子书、讲义或原始文本。
              </p>
            )}
            <button
              type="button"
              onClick={open}
              disabled={disabled}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-[#284a68] px-4 py-3 text-sm font-semibold text-[#f7f2e9] transition hover:bg-[#1f3b54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#284a68] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              选择文件
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-[#d8b0a8] bg-[#f5e6e1] px-4 py-3 text-sm text-[#8d3f32]">{error}</p>
      ) : (
        <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-slate-400">
          系统会先校验格式与大小，再开始解析文本与建立索引。
        </p>
      )}
    </section>
  );
}

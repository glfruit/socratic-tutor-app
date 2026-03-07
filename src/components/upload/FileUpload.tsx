import { useRef, useState, type DragEvent } from "react";
import type { DocumentType } from "@/types";

interface FileUploadProps {
  file: File | null;
  type: DocumentType;
  onFileSelect: (file: File) => void;
}

const acceptedExtensions = ".epub,.pdf,.txt,.docx";

export function FileUpload({ file, type, onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const picked = files?.[0];
    if (picked) {
      onFileSelect(picked);
    }
  };

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">上传文档</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">支持 EPUB、PDF、TXT、DOCX，最大 50MB。</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-slate-800 dark:text-blue-300">
          {type === "BOOK" ? "阅读模式" : "学习资料"}
        </span>
      </div>

      <button
        type="button"
        onClick={pickFile}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed px-6 py-12 text-center transition ${
          isDragging
            ? "border-primary bg-blue-50 dark:bg-slate-800"
            : "border-slate-300 bg-slate-50 hover:border-primary hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800"
        }`}
      >
        <span className="text-4xl">⇪</span>
        <strong className="mt-4 text-lg text-slate-900 dark:text-white">拖拽文件到这里，或点击选择</strong>
        <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">根据文件内容自动进入解析流程</span>
        {file ? (
          <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-left shadow-sm dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(file.size / 1024)} KB</p>
          </div>
        ) : null}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={acceptedExtensions}
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </section>
  );
}

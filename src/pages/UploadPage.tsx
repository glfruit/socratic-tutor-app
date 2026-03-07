import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { DocumentForm } from "@/components/upload/DocumentForm";
import { FileUpload } from "@/components/upload/FileUpload";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { useDocumentsStore } from "@/stores/useDocumentsStore";
import type { DocumentType } from "@/types";

export function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; type: DocumentType }>({
    title: "",
    description: "",
    type: "BOOK"
  });
  const { uploadDocument, isUploading, uploadProgress } = useDocumentsStore((state) => ({
    uploadDocument: state.uploadDocument,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress
  }));

  const canSubmit = useMemo(() => Boolean(file), [file]);

  const handleSubmit = async () => {
    if (!file) {
      return;
    }
    await uploadDocument({
      file,
      type: form.type,
      title: form.title,
      description: form.description
    });
    navigate("/library");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <FileUpload file={file} type={form.type} onFileSelect={setFile} />
        <UploadProgress progress={uploadProgress} isUploading={isUploading} />
      </div>
      <div className="space-y-5">
        <DocumentForm value={form} onChange={setForm} />
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">上传后会发生什么</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>1. 校验文件格式与体积。</li>
            <li>2. 建立章节或文本切片。</li>
            <li>3. 为阅读与语义提问生成索引。</li>
          </ol>
          <Button className="mt-6 w-full" onClick={handleSubmit} disabled={!canSubmit} isLoading={isUploading}>
            开始上传
          </Button>
        </section>
      </div>
    </div>
  );
}

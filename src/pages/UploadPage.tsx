import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { DocumentForm, type DocumentFormValue } from "@/components/upload/DocumentForm";
import { FileUpload } from "@/components/upload/FileUpload";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { useDocumentsStore } from "@/stores/useDocumentsStore";

type UploadStage = "idle" | "validating" | "uploading" | "processing" | "success" | "error";

const pause = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const fileBaseName = (file: File) => file.name.replace(/\.[^.]+$/, "");

export function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<DocumentFormValue>({
    title: "",
    description: "",
    type: "BOOK"
  });
  const [stage, setStage] = useState<UploadStage>("idle");
  const [localProgress, setLocalProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const previousFileNameRef = useRef<string | null>(null);
  const { uploadDocument, isUploading, uploadProgress } = useDocumentsStore((state) => ({
    uploadDocument: state.uploadDocument,
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress
  }));

  useEffect(() => {
    if (!file) {
      previousFileNameRef.current = null;
      return;
    }

    const baseName = fileBaseName(file);
    const shouldHydrateTitle = form.title.trim().length === 0 || form.title === previousFileNameRef.current;

    if (shouldHydrateTitle) {
      setForm((current) => ({ ...current, title: baseName }));
    }

    previousFileNameRef.current = baseName;
  }, [file, form.title]);

  useEffect(() => {
    if (!isUploading || stage !== "uploading") {
      return;
    }

    setLocalProgress((current) => Math.max(current, Math.min(uploadProgress, 72)));
  }, [isUploading, stage, uploadProgress]);

  const canSubmit = useMemo(() => Boolean(file) && !error, [error, file]);

  const handleSubmit = async () => {
    if (!file) {
      setError("请先选择一个可上传的文件。");
      return;
    }

    setError(null);
    setStage("validating");
    setLocalProgress(12);

    await pause(180);
    setStage("uploading");
    setLocalProgress(38);

    await uploadDocument({
      file,
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim()
    })
      .then(async () => {
        setStage("processing");
        setLocalProgress(82);
        await pause(260);
        setStage("success");
        setLocalProgress(100);
        await pause(320);
        navigate("/library");
      })
      .catch(() => {
        setStage("error");
        setLocalProgress(100);
        setError("上传失败，请稍后重试。");
      });
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[40px] border border-[#d8d2c4] bg-[linear-gradient(135deg,#f2ebde_0%,#f8f4ec_38%,#dfe8f1_100%)] px-6 py-8 text-stone-900 shadow-[0_24px_60px_rgba(44,52,67,0.10)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute right-[-3rem] top-[-2rem] h-32 w-32 rounded-full border border-white/50" />
        <div className="absolute bottom-[-5rem] left-[10%] h-52 w-52 rounded-full border border-[#d3c2a3]/40" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#7b6e59]">Reading Intake</p>
            <h1 className="mt-4 max-w-[11ch] text-[clamp(2.6rem,5vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
              把文档送进你的阅读与提问轨道
            </h1>
            <p className="mt-5 max-w-[56ch] text-base leading-8 text-stone-700">
              上传不是孤立动作。文件会被校验、解析、切片，再进入可搜索、可对话、可持续阅读的文档库。
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-[#f8f4ec]/80 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#d8d2c4] pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Checklist</span>
              <span className="text-sm font-medium text-stone-700">{file ? "已选文件" : "等待文件"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-700">
              <span>支持格式</span>
              <span className="font-semibold text-stone-900">EPUB / PDF / DOCX / TXT</span>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-700">
              <span>当前类型</span>
              <span className="font-semibold text-stone-900">{form.type === "BOOK" ? "书籍" : "学习资料"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-stone-700">
              <span>标题状态</span>
              <span className="font-semibold text-stone-900">{form.title.trim() ? "已填写" : "待补充"}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-5">
          <FileUpload
            file={file}
            type={form.type}
            onFileSelect={(nextFile) => {
              setFile(nextFile);
              setStage("idle");
              setLocalProgress(0);
              setError(null);
            }}
            error={error}
            onError={(message) => {
              setError(message);
              setStage(message ? "error" : "idle");
              if (message) {
                setLocalProgress(0);
              }
            }}
            disabled={isUploading}
          />
          <UploadProgress
            progress={stage === "uploading" ? Math.max(localProgress, uploadProgress) : localProgress}
            isUploading={isUploading}
            stage={stage}
            fileName={file?.name}
            error={error}
          />
        </div>
        <div className="space-y-5">
          <DocumentForm value={form} onChange={setForm} disabled={isUploading} fileName={file?.name ?? null} />
          <section className="rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(180deg,rgba(248,244,236,0.98)_0%,rgba(237,230,219,0.98)_100%)] p-6 shadow-[0_20px_52px_rgba(44,52,67,0.10)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">What Happens Next</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-900">上传后会发生什么</h2>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-stone-700">
              <li>1. 校验文件格式、大小与基础元数据。</li>
              <li>2. 解析章节结构或文本片段，准备阅读内容。</li>
              <li>3. 建立语义索引，供阅读检索与苏格拉底式提问使用。</li>
            </ol>
            <div className="mt-5 rounded-[22px] border border-white/80 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">
              {form.type === "BOOK"
                ? "书籍上传后更适合进入章节阅读与逐段提问。"
                : "学习资料上传后适合在学习会话里作为参考依据使用。"}
            </div>
            <Button className="mt-6 min-h-12 w-full" onClick={handleSubmit} disabled={!canSubmit} isLoading={isUploading}>
              开始上传
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

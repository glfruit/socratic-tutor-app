type UploadStage = "idle" | "validating" | "uploading" | "processing" | "success" | "error";

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  stage?: UploadStage;
  fileName?: string;
  error?: string | null;
}

const stageLabel: Record<UploadStage, string> = {
  idle: "准备中",
  validating: "校验中",
  uploading: "上传中",
  processing: "处理中",
  success: "已完成",
  error: "出现问题"
};

const stageDescription: Record<UploadStage, string> = {
  idle: "选择文件后即可开始上传，系统会先校验格式与体积。",
  validating: "正在核对文件格式、体积与基础元数据。",
  uploading: "文件已进入传输阶段，准备交给解析服务。",
  processing: "文件已到达服务器，系统正在切片并建立检索索引。",
  success: "上传流程完成，可以前往文档库继续阅读或提问。",
  error: "上传未完成，请调整文件或元数据后重试。"
};

const stageAccent: Record<UploadStage, string> = {
  idle: "text-stone-700 bg-[#efe6d6]",
  validating: "text-[#6f5a2d] bg-[#eee2bd]",
  uploading: "text-[#365a74] bg-[#dfe7ef]",
  processing: "text-[#3f4f36] bg-[#dfe7d8]",
  success: "text-[#315444] bg-[#dce9df]",
  error: "text-[#8d3f32] bg-[#f1d9d4]"
};

const milestones = [
  { key: "validating", label: "校验" },
  { key: "uploading", label: "传输" },
  { key: "processing", label: "索引" },
  { key: "success", label: "完成" }
] as const;

export function UploadProgress({
  progress,
  isUploading,
  stage = "idle",
  fileName,
  error
}: UploadProgressProps) {
  const normalizedProgress = Math.max(0, Math.min(progress, 100));

  return (
    <section className="rounded-[34px] border border-[#d8d2c4] bg-[linear-gradient(180deg,rgba(248,244,236,0.94)_0%,rgba(236,229,216,0.94)_100%)] p-5 shadow-[0_18px_48px_rgba(44,52,67,0.10)] dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Pipeline Status</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-white">处理进度</h2>
          <p className="mt-2 text-sm leading-7 text-stone-700 dark:text-slate-400">
            {error ?? stageDescription[stage]}
          </p>
        </div>
        <div className="text-right">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stageAccent[stage]}`}>
            {stageLabel[stage]}
          </span>
          <p className="mt-3 text-lg font-semibold text-stone-900 dark:text-white">{normalizedProgress}%</p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/70 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            stage === "error"
              ? "bg-[#b85c4c]"
              : "bg-[linear-gradient(90deg,#284a68_0%,#7c9a69_55%,#d0a558_100%)]"
          }`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {milestones.map((milestone, index) => {
          const reached =
            stage === "error" ? index === 0 && normalizedProgress > 0 : normalizedProgress >= [12, 48, 82, 100][index];

          return (
            <div
              key={milestone.key}
              className={`rounded-[20px] border px-3 py-3 text-sm ${
                reached
                  ? "border-white/80 bg-white/85 text-stone-900"
                  : "border-[#ddd3c3] bg-transparent text-stone-500"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-semibold">{milestone.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700 dark:bg-slate-950 dark:text-slate-300">
        {fileName ? `${fileName} 正在进入处理队列。` : "选择文件后，这里会显示上传阶段与完成状态。"}
        {!isUploading && stage === "idle" ? " 当前尚未开始上传。" : ""}
      </div>
    </section>
  );
}

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
}

export function UploadProgress({ progress, isUploading }: UploadProgressProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">处理进度</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isUploading ? "文件已上传，系统正在建立可检索阅读索引。" : "准备好后即可开始上传。"}
          </p>
        </div>
        <span className="text-sm font-semibold text-primary">{progress}%</span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
}

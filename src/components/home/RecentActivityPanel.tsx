import { Link } from "react-router-dom";
import type { HomeData } from "@/types";

interface RecentActivityPanelProps {
  recent: HomeData["recent"];
}

const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));

export function RecentActivityPanel({ recent }: RecentActivityPanelProps) {
  const latestStudy = recent.learning.slice(0, 3);
  const latestReading = recent.reading.slice(0, 3);

  return (
    <section className="rounded-[32px] border border-[#cfd7e1] bg-[#e7edf3] p-6 text-slate-900 shadow-[0_18px_40px_rgba(38,46,63,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#4a647d]">Recent Moves</p>
          <h2 className="mt-3 max-w-[14ch] font-serif text-[1.9rem] font-semibold leading-tight tracking-[-0.04em]">
            从最近一次动作，直接继续。
          </h2>
        </div>
        <Link
          to="/sessions"
          className="rounded-full border border-[#aebfd1] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#284a68] transition hover:border-[#284a68] hover:bg-[#d9e5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#284a68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e7edf3]"
        >
          全部记录
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between border-b border-[#b7c7d7] pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#38526a]">学习会话</h3>
            <Link to="/subjects" className="text-sm font-medium text-[#284a68] underline-offset-4 hover:underline">
              新建学习
            </Link>
          </div>
          <div className="mt-2">
            {latestStudy.map((item) => (
              <Link
                key={item.id}
                to={`/sessions/${item.id}`}
                className="grid gap-2 border-b border-[#cad4df] py-4 transition hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#284a68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e7edf3]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">{item.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7186]">
                    {formatSessionDate(item.updatedAt)}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-700">{item.subject}</p>
                <p className="text-sm leading-6 text-slate-600">{item.preview ?? "继续沿着上次的问题往下追问。"}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-b border-[#b7c7d7] pb-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-[#38526a]">阅读进度</h3>
            <Link to="/upload" className="text-sm font-medium text-[#284a68] underline-offset-4 hover:underline">
              上传文档
            </Link>
          </div>
          <div className="mt-2">
            {latestReading.map((item) => (
              <Link
                key={item.id}
                to={item.status === "READY" ? `/reader/${item.id}` : "/library"}
                className="grid gap-2 border-b border-[#cad4df] py-4 transition hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#284a68] focus-visible:ring-offset-2 focus-visible:ring-offset-[#e7edf3]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-slate-950">{item.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a7186]">
                    {item.progress}%
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-700">{item.author ?? "个人文档"}</p>
                <p className="text-sm leading-6 text-slate-600">
                  {item.status === "READY" ? "打开阅读器，继续当前章节。" : "文档处理中，先回文档库查看状态。"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

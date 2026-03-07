import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ModeCard } from "@/components/home/ModeCard";
import { StatsPanel } from "@/components/home/StatsPanel";
import { mockHomeData } from "@/services/mockData";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import type { HomeData } from "@/types";

export function HomeSelectionPage() {
  const [homeData, setHomeData] = useState<HomeData>(mockHomeData);
  const user = useAuthStore((state) => state.user);
  const loadPreferences = usePreferencesStore((state) => state.loadPreferences);

  useEffect(() => {
    setHomeData((current) => ({
      ...current,
      user: user ?? current.user
    }));
    void loadPreferences();
  }, [loadPreferences, user]);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-[linear-gradient(135deg,#f4efe3_0%,#dce7f7_48%,#f8f9fa_100%)] p-6 shadow-card dark:bg-[linear-gradient(135deg,#172033_0%,#0f172a_50%,#111827_100%)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-300">Socratic Tutor</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {homeData.user.name}，今天你要进入学习对话，还是沉浸式阅读？
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          学习模式用于围绕学科问题展开逐步追问，阅读模式则把文档、章节和文本证据放进同一个推理空间。
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 md:grid-cols-2">
          <ModeCard
            title="Study"
            description="从学科或主题出发，选择难度层级，进入逐步追问的学习会话。"
            to="/subjects"
            icon="◌"
            accent="bg-[linear-gradient(145deg,#ffe7b8_0%,#f8c45c_45%,#f7d991_100%)]"
          />
          <ModeCard
            title="Read"
            description="上传电子书或讲义，在阅读、选段提问与对话之间来回切换。"
            to="/library"
            icon="▣"
            accent="bg-[linear-gradient(145deg,#cfe1ff_0%,#93b4ea_45%,#dbe9ff_100%)]"
          />
        </div>
        <StatsPanel stats={homeData.stats} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">最近学习</h2>
            <Link to="/sessions" className="text-sm font-medium text-primary">
              查看全部
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {homeData.recent.learning.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subject}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">最近阅读</h2>
            <Link to="/upload" className="text-sm font-medium text-primary">
              上传新文档
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {homeData.recent.reading.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.progress}% 已完成</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

import { useEffect, useState } from "react";
import { ModeCard } from "@/components/home/ModeCard";
import { RecentActivityPanel } from "@/components/home/RecentActivityPanel";
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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[40px] border border-[#d8d2c4] bg-[linear-gradient(135deg,#f2ebde_0%,#f8f4ec_38%,#dfe8f1_100%)] px-6 py-8 text-stone-900 shadow-[0_24px_60px_rgba(44,52,67,0.10)] sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute right-[-4rem] top-[-3rem] h-40 w-40 rounded-full border border-white/50" />
        <div className="absolute bottom-[-5rem] right-[18%] h-56 w-56 rounded-full border border-[#d3c2a3]/50" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-[#7b6e59]">Socratic Tutor</p>
            <h1 className="mt-4 max-w-[11ch] font-serif text-[clamp(2.8rem,6vw,5.4rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
              {homeData.user.name}，今天从哪一种思考开始？
            </h1>
            <p className="mt-5 max-w-[52ch] text-base leading-8 text-stone-700">
              学习模式适合围绕学科问题推进推理链条，阅读模式则把章节、证据与提问放进同一条阅读轨迹。入口应该明确，不该像通用后台。
            </p>
          </div>

          <div className="grid gap-4 rounded-[30px] border border-white/70 bg-[#f8f4ec]/80 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#d8d2c4] pb-3">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b6e59]">Today Focus</span>
              <span className="text-sm font-medium text-stone-700">
                {homeData.stats.currentStreak} 天连续学习
              </span>
            </div>
            <p className="text-sm leading-7 text-stone-700">
              先选路径，再开始动作。减少分心，比堆更多按钮更重要。
            </p>
            <div className="grid gap-3 text-sm leading-6 text-stone-700">
              <div className="flex items-center justify-between">
                <span>默认水平</span>
                <span className="font-semibold text-stone-900">高中</span>
              </div>
              <div className="flex items-center justify-between">
                <span>最近阅读完成度</span>
                <span className="font-semibold text-stone-900">{homeData.recent.reading[0]?.progress ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5 md:grid-cols-2">
          <ModeCard
            eyebrow="Study Mode"
            title="学习"
            description="从学科、主题和水平出发，进入一条更像导师带练、而不是问答工具的学习路径。"
            details={["选择学科与水平后进入会话。", "适合做概念拆解、例题追问与迁移训练。"]}
            ctaLabel="进入学习模式"
            to="/subjects"
            icon="学"
            tone="study"
          />
          <ModeCard
            eyebrow="Reading Mode"
            title="阅读"
            description="上传电子书或讲义，在章节、选段与问题之间来回切换，把阅读过程变成一条可追踪的推理轨迹。"
            details={["适合围绕章节内容做苏格拉底式阅读。", "从文档库继续，也可以直接上传新材料。"]}
            ctaLabel="进入阅读模式"
            to="/library"
            icon="读"
            tone="read"
          />
        </div>
        <StatsPanel stats={homeData.stats} />
      </section>

      <RecentActivityPanel recent={homeData.recent} />
    </div>
  );
}

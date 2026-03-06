import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QuickStart } from "@/components/dashboard/QuickStart";
import { SessionList } from "@/components/dashboard/SessionList";
import { StatCard } from "@/components/dashboard/StatCard";
import { sessionService } from "@/services/sessionService";
import { useAuthStore } from "@/stores/authStore";
import type { SessionSummary } from "@/types";

export function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    sessionService.getSessions().then(setSessions);
  }, []);

  const stats = [
    { title: "总会话", value: sessions.length, icon: "📚" },
    { title: "活跃学科", value: new Set(sessions.map((s) => s.subject)).size, icon: "🧠" },
    { title: "本周提问", value: sessions.reduce((sum, item) => sum + (item.messageCount ?? 0), 0), icon: "💬" }
  ];

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">你好，{user?.name ?? "学习者"}</h1>
        <p className="text-slate-500">今天也来用问题推动思考。</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <StatCard key={item.title} title={item.title} value={item.value} icon={item.icon} />
        ))}
      </section>

      <QuickStart onStartSession={() => navigate("/subjects")} onPickSubject={() => navigate("/subjects")} />
      <SessionList sessions={sessions.slice(0, 3)} onResume={(id) => navigate(`/sessions/${id}`)} />
    </div>
  );
}

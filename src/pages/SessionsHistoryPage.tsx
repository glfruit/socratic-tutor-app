import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { sessionService } from "@/services/sessionService";
import type { SessionSummary } from "@/types";

export function SessionsHistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [subjectFilter, setSubjectFilter] = useState("全部");
  const navigate = useNavigate();

  useEffect(() => {
    sessionService.getSessions().then(setSessions);
  }, []);

  const subjects = useMemo(
    () => ["全部", ...Array.from(new Set(sessions.map((session) => session.subject)))],
    [sessions]
  );

  const filtered = sessions.filter((session) => subjectFilter === "全部" || session.subject === subjectFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">历史会话</h1>
        <select
          value={subjectFilter}
          onChange={(event) => setSubjectFilter(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((session) => (
          <article key={session.id} className="rounded-xl bg-white p-4 shadow-card">
            <p className="text-xs text-slate-500">{session.subject}</p>
            <h2 className="mt-1 font-medium text-slate-900">{session.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{session.preview}</p>
            <p className="mt-2 text-xs text-slate-400">{session.updatedAt}</p>
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" onClick={() => navigate(`/sessions/${session.id}`)}>
                继续
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

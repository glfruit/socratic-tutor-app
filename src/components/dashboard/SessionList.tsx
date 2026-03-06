import type { SessionSummary } from "@/types";
import { Button } from "@/components/common/Button";

interface SessionListProps {
  sessions: SessionSummary[];
  onResume: (id: string) => void;
}

export function SessionList({ sessions, onResume }: SessionListProps) {
  if (!sessions.length) {
    return (
      <section className="rounded-xl bg-white p-5 shadow-card">
        <p className="text-slate-500">还没有历史会话，开始第一场思考吧。</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-5 shadow-card">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">最近会话</h2>
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li key={session.id} className="rounded-lg border border-slate-200 p-3">
            <p className="font-medium text-slate-800">{session.title}</p>
            <p className="text-sm text-slate-500">
              {session.subject} · {session.updatedAt}
            </p>
            <Button className="mt-2" variant="ghost" onClick={() => onResume(session.id)}>
              继续
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

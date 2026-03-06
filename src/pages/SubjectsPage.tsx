import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { sessionService } from "@/services/sessionService";
import type { Subject } from "@/types";

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    sessionService.getSubjects().then(setSubjects);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">选择学科</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-xl bg-white p-4 shadow-card">
            <h2 className="text-lg font-medium text-slate-800">{subject.name}</h2>
            <p className="mt-2 text-sm text-slate-500">{subject.domains.join(" · ")}</p>
            <Button className="mt-4" onClick={() => navigate(`/sessions/new?subject=${subject.name}`)}>
              进入对话
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

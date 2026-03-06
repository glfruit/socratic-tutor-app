import { Button } from "@/components/common/Button";

interface QuickStartProps {
  onStartSession: () => void;
  onPickSubject: () => void;
}

export function QuickStart({ onStartSession, onPickSubject }: QuickStartProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-card">
      <h2 className="text-lg font-semibold text-slate-900">快速开始</h2>
      <p className="mt-1 text-sm text-slate-500">继续提问，或探索一个新学科。</p>
      <div className="mt-4 flex gap-3">
        <Button onClick={onStartSession}>开始新会话</Button>
        <Button variant="secondary" onClick={onPickSubject}>
          选择学科
        </Button>
      </div>
    </section>
  );
}

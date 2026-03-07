interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  hints?: string[];
  createdAt?: string;
}

export function MessageBubble({ role, content, hints = [], createdAt }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex transition-all duration-200 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm shadow-sm ring-1 ${
          isUser
            ? "bg-primary text-white ring-primary/30"
            : "bg-white text-slate-800 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] opacity-70">
          <span>{isUser ? "你" : "导师"}</span>
          {createdAt ? <span>{new Date(createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span> : null}
        </div>
        <p className="whitespace-pre-wrap leading-6">{content}</p>
        {!isUser && hints.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {hints.map((hint) => (
              <span
                key={hint}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {hint}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

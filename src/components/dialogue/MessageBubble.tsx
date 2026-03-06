interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  hints?: string[];
}

export function MessageBubble({ role, content, hints = [] }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow ${
          isUser ? "bg-primary text-white" : "bg-tutor text-slate-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {!isUser && hints.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {hints.map((hint) => (
              <span key={hint} className="rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600">
                {hint}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

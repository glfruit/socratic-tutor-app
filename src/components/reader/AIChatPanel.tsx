import { useState, type FormEvent } from "react";
import type { ChatMessage } from "@/types";

interface AIChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (content: string) => Promise<void>;
}

export function AIChatPanel({ messages, isStreaming, onSend }: AIChatPanelProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    const next = content;
    setContent("");
    await onSend(next);
  };

  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">苏格拉底对话</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">围绕文本证据发问，不直接给结论。</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-2xl p-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                : "bg-blue-50 text-slate-900 dark:bg-blue-950/50 dark:text-blue-50"
            }`}
          >
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {message.role === "assistant" ? "Tutor" : "You"}
            </p>
            <p>{message.content || (isStreaming && message.role === "assistant" ? "思考中..." : "")}</p>
            {message.metadata?.referencedText ? (
              <p className="mt-2 rounded-xl bg-white/80 px-2 py-1 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                引用：{message.metadata.referencedText}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="输入一个问题，例如：作者的核心前提是什么？"
          className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStreaming ? "导师正在回应..." : "发送问题"}
        </button>
      </form>
    </aside>
  );
}

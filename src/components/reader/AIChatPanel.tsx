import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage } from "@/types";

interface AIChatPanelProps {
  documentTitle?: string;
  currentChapterTitle?: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (content: string) => Promise<void>;
}

export function AIChatPanel({ documentTitle, currentChapterTitle, messages, isStreaming, onSend }: AIChatPanelProps) {
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    if (typeof container.scrollTo === "function") {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, isStreaming]);

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
    <aside className="flex h-full min-h-[32rem] flex-col overflow-hidden rounded-[30px] border border-[#d7d0c3] bg-[#f2ede4] shadow-[0_18px_44px_rgba(44,52,67,0.08)] xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)]">
      <div className="border-b border-[#ddd3c4] px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#4a647d]">Socratic Dialogue</p>
        <h2 className="mt-3 font-serif text-[1.8rem] font-semibold leading-tight text-stone-950">边读边问</h2>
        <p className="mt-2 text-sm leading-7 text-stone-700">问题要回到文本证据本身。先澄清作者如何论证，再继续推进追问。</p>
        <div className="mt-4 rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 text-sm leading-6 text-stone-700">
          <p className="font-semibold text-stone-950">{documentTitle ?? "当前文档"}</p>
          <p className="mt-1 text-stone-600">{currentChapterTitle ?? "尚未选择章节"}</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#d5cab8] bg-[#faf6ef] px-4 py-5 text-sm leading-7 text-stone-600">
            还没有开始对话。可以先选中一段文字，再问“作者在这里的关键假设是什么？”
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`rounded-[24px] px-4 py-3 text-sm leading-7 ${
                  message.role === "assistant"
                    ? "bg-[#fbf7f1] text-stone-800 ring-1 ring-inset ring-[#e1d8ca]"
                    : "bg-[#dfe9f2] text-stone-950 ring-1 ring-inset ring-[#c8d8e6]"
                }`}
              >
                <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${message.role === "assistant" ? "text-[#7b6e59]" : "text-[#355c7d]"}`}>
                  {message.role === "assistant" ? "Tutor" : "You"}
                </p>
                <p>{message.content || (isStreaming && message.role === "assistant" ? "正在沿着原文整理回应..." : "")}</p>
                {message.metadata?.referencedText ? (
                  <p className="mt-3 rounded-[16px] bg-white/80 px-3 py-2 text-xs leading-6 text-stone-600">
                    引用：{message.metadata.referencedText}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        {isStreaming ? <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-[#4a647d]">Streaming response</p> : null}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-[#ddd3c4] bg-[#f6f1e8] px-4 py-4 sm:px-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {["作者的核心前提是什么？", "这一段如何支持上一节？", "这里有没有隐藏假设？"].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setContent(prompt)}
              className="rounded-full bg-white px-3 py-2 text-xs font-medium text-stone-700 ring-1 ring-inset ring-[#d7cdbf] transition hover:bg-[#fcfaf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355c7d]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          placeholder="输入一个问题，例如：作者的核心前提是什么？"
          className="min-h-28 w-full rounded-[22px] border border-[#d5ccbd] bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#355c7d] focus:ring-2 focus:ring-[#355c7d]/20"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[18px] bg-[#355c7d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2a4963] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStreaming ? "导师正在回应..." : "发送问题"}
        </button>
      </form>
    </aside>
  );
}

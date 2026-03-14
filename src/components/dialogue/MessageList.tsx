import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";
import { MessageBubble } from "@/components/dialogue/MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

function MessageListSkeleton() {
  return (
    <section className="space-y-4 rounded-[28px] border border-slate-200 bg-white/95 p-5 shadow-card dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex justify-start">
        <div className="h-24 w-2/3 animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="flex justify-end">
        <div className="h-16 w-1/2 animate-pulse rounded-[24px] bg-blue-100/70 dark:bg-slate-800" />
      </div>
      <div className="flex justify-start">
        <div className="h-20 w-3/4 animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-800" />
      </div>
    </section>
  );
}

export function MessageList({ messages, isLoading = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof bottomRef.current?.scrollIntoView === "function") {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (!messages.length) {
    return (
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-card dark:border-slate-700 dark:from-slate-950 dark:to-slate-900">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-3xl text-primary dark:bg-slate-800">
          S
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">准备好开始思考了吗？</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
          抛出一个问题、一个困惑，或你已经想到的一步推理。导师会继续追问，帮你把思路展开。
        </p>
      </section>
    );
  }

  return (
    <section className="max-h-[calc(100vh-20rem)] space-y-4 overflow-y-auto rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 shadow-card dark:border-slate-800 dark:bg-slate-950/60">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
          hints={message.hints}
          createdAt={message.createdAt}
        />
      ))}
      <div ref={bottomRef} />
    </section>
  );
}

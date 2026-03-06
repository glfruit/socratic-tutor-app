import type { ChatMessage } from "@/types";
import { MessageBubble } from "@/components/dialogue/MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (!messages.length) {
    return (
      <section className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <p className="text-slate-500">准备好开始思考了吗？</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl bg-white p-4 shadow-card">
      {messages.map((message) => (
        <MessageBubble key={message.id} role={message.role} content={message.content} hints={message.hints} />
      ))}
    </section>
  );
}

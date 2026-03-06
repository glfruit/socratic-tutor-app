import { useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { MessageInput } from "@/components/dialogue/MessageInput";
import { MessageList } from "@/components/dialogue/MessageList";
import { useSessionStore } from "@/stores/sessionStore";

export function SessionChatPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const subject = searchParams.get("subject") ?? "通用";

  const { messages, isStreaming, loadSession, sendMessage, stopStreaming } = useSessionStore((state) => ({
    messages: state.messages,
    isStreaming: state.isStreaming,
    loadSession: state.loadSession,
    sendMessage: state.sendMessage,
    stopStreaming: state.stopStreaming
  }));

  useEffect(() => {
    if (id && id !== "new") {
      loadSession(id);
    }
  }, [id, loadSession]);

  return (
    <div className="space-y-4">
      <header className="rounded-xl bg-white p-4 shadow-card">
        <h1 className="text-xl font-semibold text-slate-900">苏格拉底对话</h1>
        <p className="text-sm text-slate-500">学科：{subject}</p>
      </header>
      <MessageList messages={messages} />
      {isStreaming ? <p className="text-sm text-primary">导师正在思考...</p> : null}
      <MessageInput onSend={sendMessage} isStreaming={isStreaming} onStop={stopStreaming} />
    </div>
  );
}

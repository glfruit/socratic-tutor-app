import { useState } from "react";
import { Button } from "@/components/common/Button";

interface MessageInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function MessageInput({ onSend, isStreaming, onStop }: MessageInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const content = value.trim();
    if (!content || isStreaming) {
      return;
    }
    onSend(content);
    setValue("");
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <label htmlFor="chat-input" className="sr-only">
        消息输入
      </label>
      <textarea
        id="chat-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        className="h-24 w-full resize-none rounded-lg border border-slate-300 p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="输入你的思考，按 Enter 发送..."
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{value.length}/5000</span>
        <div className="flex gap-2">
          {isStreaming ? (
            <Button variant="ghost" onClick={onStop}>
              停止
            </Button>
          ) : null}
          <Button onClick={submit} disabled={!value.trim() || isStreaming}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}

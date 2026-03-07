import { useState } from "react";
import { Button } from "@/components/common/Button";

interface MessageInputProps {
  onSend: (content: string) => Promise<{ ok: boolean }>;
  isStreaming: boolean;
  isDisabled?: boolean;
  error?: string | null;
  onStop: () => void;
}

export function MessageInput({ onSend, isStreaming, isDisabled = false, error = null, onStop }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const content = value.trim();
    if (!content || isStreaming || isSubmitting || isDisabled) {
      return;
    }

    setIsSubmitting(true);
    setValue("");
    try {
      const result = await onSend(content);
      if (!result.ok) {
        setValue(content);
      }
    } catch {
      setValue(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-card">
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
            void submit();
          }
        }}
        className="h-28 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm text-slate-900 caret-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
        placeholder="输入你的思考，按 Enter 发送..."
        disabled={isDisabled || isSubmitting}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">{value.length}/5000</span>
        <div className="flex gap-2">
          {isStreaming ? (
            <Button variant="ghost" onClick={onStop}>
              停止
            </Button>
          ) : null}
          <Button onClick={() => void submit()} disabled={!value.trim() || isStreaming || isDisabled} isLoading={isSubmitting}>
            发送
          </Button>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

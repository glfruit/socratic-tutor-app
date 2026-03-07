import { useState } from "react";
import { Button } from "@/components/common/Button";
import { RichTextEditor } from "@/components/dialogue/RichTextEditor";

interface MessageInputProps {
  onSend: (content: string) => Promise<{ ok: boolean }>;
  isStreaming: boolean;
  isDisabled?: boolean;
  error?: string | null;
  onStop: () => void;
}

export function MessageInput({ onSend, isStreaming, isDisabled = false, error = null, onStop }: MessageInputProps) {
  const [value, setValue] = useState("");
  const [valueHtml, setValueHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    const content = value.trim();
    if (!content || isStreaming || isSubmitting || isDisabled) {
      return;
    }

    const previousValue = value;
    const previousValueHtml = valueHtml;
    setIsSubmitting(true);
    setValue("");
    setValueHtml("");
    try {
      const result = await onSend(content);
      if (!result.ok) {
        setValue(previousValue);
        setValueHtml(previousValueHtml);
      }
    } catch {
      setValue(previousValue);
      setValueHtml(previousValueHtml);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-card">
      <label htmlFor="chat-input" className="sr-only">
        消息输入
      </label>
      <RichTextEditor
        valueHtml={valueHtml}
        disabled={isDisabled || isSubmitting}
        onSubmit={() => void submit()}
        onChange={({ markdown, html }) => {
          setValue(markdown);
          setValueHtml(html);
        }}
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

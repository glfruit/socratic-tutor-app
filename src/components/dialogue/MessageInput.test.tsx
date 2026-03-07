import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "./MessageInput";

describe("MessageInput", () => {
  it("clears the input immediately after sending with the button", async () => {
    let resolveSend: ((value: { ok: boolean }) => void) | undefined;
    const onSend = vi.fn(
      () =>
        new Promise<{ ok: boolean }>((resolve) => {
          resolveSend = resolve;
        })
    );

    render(<MessageInput onSend={onSend} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(onSend).toHaveBeenCalledWith("你好");
    expect(textarea).toHaveValue("");

    resolveSend?.({ ok: true });
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  it("clears the input after sending with the button", async () => {
    const onSend = vi.fn().mockResolvedValue({ ok: true });
    render(<MessageInput onSend={onSend} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(onSend).toHaveBeenCalledWith("你好");
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  it("clears the input after sending with Enter", async () => {
    const onSend = vi.fn().mockResolvedValue({ ok: true });
    render(<MessageInput onSend={onSend} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "按回车发送{enter}");

    expect(onSend).toHaveBeenCalledWith("按回车发送");
    await waitFor(() => expect(textarea).toHaveValue(""));
  });

  it("shows stop when streaming", async () => {
    const onStop = vi.fn();
    render(<MessageInput onSend={vi.fn().mockResolvedValue({ ok: true })} isStreaming onStop={onStop} />);

    await userEvent.click(screen.getByRole("button", { name: "停止" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("keeps draft when send fails", async () => {
    render(<MessageInput onSend={vi.fn().mockResolvedValue({ ok: false })} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "失败保留");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(textarea).toHaveValue("失败保留");
  });

  it("restores draft when send rejects", async () => {
    const onSend = vi.fn().mockRejectedValue(new Error("network"));
    render(<MessageInput onSend={onSend} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "重试内容");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    await waitFor(() => expect(textarea).toHaveValue("重试内容"));
  });
});

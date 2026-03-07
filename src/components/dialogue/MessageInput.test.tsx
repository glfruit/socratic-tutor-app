import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageInput } from "./MessageInput";

describe("MessageInput", () => {
  it("sends message with button", async () => {
    const onSend = vi.fn().mockResolvedValue({ ok: true });
    render(<MessageInput onSend={onSend} isStreaming={false} onStop={() => {}} />);

    const textarea = screen.getByLabelText("消息输入");
    await userEvent.type(textarea, "你好");
    await userEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(onSend).toHaveBeenCalledWith("你好");
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
});

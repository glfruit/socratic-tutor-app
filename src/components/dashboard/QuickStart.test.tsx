import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickStart } from "./QuickStart";

describe("QuickStart", () => {
  it("triggers quick actions", async () => {
    const onStartSession = vi.fn();
    const onPickSubject = vi.fn();
    render(<QuickStart onStartSession={onStartSession} onPickSubject={onPickSubject} />);

    await userEvent.click(screen.getByRole("button", { name: "开始新会话" }));
    await userEvent.click(screen.getByRole("button", { name: "选择学科" }));

    expect(onStartSession).toHaveBeenCalledTimes(1);
    expect(onPickSubject).toHaveBeenCalledTimes(1);
  });
});

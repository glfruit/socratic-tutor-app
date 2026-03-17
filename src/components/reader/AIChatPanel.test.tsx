import { render, screen, fireEvent } from "@testing-library/react";
import { AIChatPanel } from "./AIChatPanel";
import type { ChatMessage } from "@/types";

describe("AIChatPanel", () => {
  const defaultProps = {
    documentTitle: "批判性思维导论",
    currentChapterTitle: "第一章",
    messages: [] as ChatMessage[],
    isStreaming: false,
    onSend: vi.fn().mockResolvedValue(undefined),
  };

  it("renders document title and chapter", () => {
    render(<AIChatPanel {...defaultProps} />);
    expect(screen.getByText("批判性思维导论")).toBeInTheDocument();
    expect(screen.getByText("第一章")).toBeInTheDocument();
  });

  it("shows empty conversation state", () => {
    render(<AIChatPanel {...defaultProps} />);
    expect(screen.getByText(/还没有开始对话/)).toBeInTheDocument();
  });

  it("renders messages", () => {
    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "核心前提是什么？", createdAt: "2026-03-10" },
      { id: "2", role: "assistant", content: "作者认为...", createdAt: "2026-03-10" },
    ];
    render(<AIChatPanel {...defaultProps} messages={messages} />);
    expect(screen.getByText("核心前提是什么？")).toBeInTheDocument();
    expect(screen.getByText("作者认为...")).toBeInTheDocument();
  });

  it("submits user input", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(<AIChatPanel {...defaultProps} onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/输入一个问题/);
    fireEvent.change(textarea, { target: { value: "为什么？" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(onSend).toHaveBeenCalledWith("为什么？");
  });

  it("fills textarea from quick prompt buttons", () => {
    render(<AIChatPanel {...defaultProps} />);
    fireEvent.click(screen.getByText("作者的核心前提是什么？"));
    expect(screen.getByDisplayValue("作者的核心前提是什么？")).toBeInTheDocument();
  });

  it("shows streaming indicator", () => {
    render(<AIChatPanel {...defaultProps} isStreaming />);
    expect(screen.getByText("导师正在回应...")).toBeInTheDocument();
    expect(screen.getByText("Streaming response")).toBeInTheDocument();
  });
});

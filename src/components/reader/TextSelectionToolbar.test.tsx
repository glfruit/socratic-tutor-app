import { fireEvent, render, screen } from "@testing-library/react";
import { TextSelectionToolbar } from "./TextSelectionToolbar";

describe("TextSelectionToolbar", () => {
  it("returns null when selectedText is empty", () => {
    const { container } = render(
      <TextSelectionToolbar selectedText="" onAsk={vi.fn()} onClear={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows selected text", () => {
    render(
      <TextSelectionToolbar
        selectedText="逻辑是研究推理有效性的学科"
        onAsk={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/逻辑是研究推理有效性的学科/),
    ).toBeInTheDocument();
  });

  it("calls onAsk on button click", () => {
    const onAsk = vi.fn();
    render(
      <TextSelectionToolbar
        selectedText="一段选中文本"
        onAsk={onAsk}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("围绕这段提问"));
    expect(onAsk).toHaveBeenCalledTimes(1);
  });

  it("calls onClear on button click", () => {
    const onClear = vi.fn();
    render(
      <TextSelectionToolbar
        selectedText="一段选中文本"
        onAsk={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByText("清除选择"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

import { render, screen } from "@testing-library/react";
import { ReadingArea } from "./ReadingArea";
import type { Chapter } from "@/types";

const chapter: Chapter = {
  id: "ch-1",
  title: "第一章：认知偏差",
  orderIndex: 0,
  content: "段落一内容\n\n段落二内容",
};

describe("ReadingArea", () => {
  const defaultProps = {
    chapter,
    totalChapters: 3,
    isLoading: false,
    selectedText: "",
    onSelectText: vi.fn(),
    onReadingProgress: vi.fn(),
    onAskAboutSelection: vi.fn(),
  };

  it("renders chapter title and content", () => {
    render(<ReadingArea {...defaultProps} />);
    expect(screen.getByText("第一章：认知偏差")).toBeInTheDocument();
    expect(screen.getByText("段落一内容")).toBeInTheDocument();
    expect(screen.getByText("段落二内容")).toBeInTheDocument();
  });

  it("shows loading skeleton when isLoading", () => {
    const { container } = render(<ReadingArea {...defaultProps} isLoading chapter={null} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
    expect(screen.getByText("载入章节中")).toBeInTheDocument();
  });

  it("shows empty content placeholder when chapter has no content", () => {
    render(<ReadingArea {...defaultProps} chapter={{ id: "ch-2", title: "空章节", orderIndex: 1 }} />);
    expect(screen.getByText(/当前文档还没有可展示的章节内容/)).toBeInTheDocument();
  });

  it("shows position info", () => {
    render(<ReadingArea {...defaultProps} />);
    expect(screen.getByText("第 1 节")).toBeInTheDocument();
  });

  it("shows selected text hint when text is selected", () => {
    render(<ReadingArea {...defaultProps} selectedText="一段选中的文字" />);
    expect(screen.getByText("已选中段落")).toBeInTheDocument();
  });

  it("shows default reading hint", () => {
    render(<ReadingArea {...defaultProps} />);
    expect(screen.getByText("滚动内容会自动保存进度")).toBeInTheDocument();
  });
});

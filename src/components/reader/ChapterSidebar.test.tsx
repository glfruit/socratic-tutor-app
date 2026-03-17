import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterSidebar } from "./ChapterSidebar";
import type { Chapter } from "@/types";

const chapters: Chapter[] = [
  { id: "ch-1", title: "引言", orderIndex: 0 },
  { id: "ch-2", title: "方法论", orderIndex: 1 },
  { id: "ch-3", title: "结论", orderIndex: 2 },
];

describe("ChapterSidebar", () => {
  it("renders all chapters", () => {
    render(<ChapterSidebar chapters={chapters} onSelect={vi.fn()} />);
    expect(screen.getByText("引言")).toBeInTheDocument();
    expect(screen.getByText("方法论")).toBeInTheDocument();
    expect(screen.getByText("结论")).toBeInTheDocument();
    expect(screen.getByText("3 节")).toBeInTheDocument();
  });

  it("calls onSelect when a chapter is clicked", () => {
    const onSelect = vi.fn();
    render(<ChapterSidebar chapters={chapters} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("方法论"));
    expect(onSelect).toHaveBeenCalledWith("ch-2");
  });

  it("highlights active chapter", () => {
    render(<ChapterSidebar chapters={chapters} activeChapterId="ch-1" onSelect={vi.fn()} />);
    expect(screen.getByText("正在阅读这一节，继续向下深入。")).toBeInTheDocument();
  });

  it("shows empty state when no chapters", () => {
    render(<ChapterSidebar chapters={[]} onSelect={vi.fn()} />);
    expect(screen.getByText(/文档目录还未生成/)).toBeInTheDocument();
  });
});

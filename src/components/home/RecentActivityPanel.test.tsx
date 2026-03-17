import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { HomeData, SessionSummary, DocumentSummary } from "@/types";
import { RecentActivityPanel } from "./RecentActivityPanel";

const makeSession = (id: string, title: string): SessionSummary => ({
  id,
  title,
  subject: "逻辑学",
  updatedAt: "2026-03-15T10:00:00Z",
  preview: "上次讨论了命题逻辑的基本规则。",
});

const makeDocument = (id: string, title: string): DocumentSummary => ({
  id,
  type: "BOOK",
  title,
  author: "作者",
  status: "READY",
  progress: 42,
  createdAt: "2026-03-14T08:00:00Z",
});

const makeRecent = (
  learningCount: number,
  readingCount: number,
): HomeData["recent"] => ({
  learning: Array.from({ length: learningCount }, (_, i) =>
    makeSession(`s${i + 1}`, `学习会话 ${i + 1}`),
  ),
  reading: Array.from({ length: readingCount }, (_, i) =>
    makeDocument(`d${i + 1}`, `文档 ${i + 1}`),
  ),
});

const renderPanel = (recent: HomeData["recent"]) =>
  render(
    <MemoryRouter>
      <RecentActivityPanel recent={recent} />
    </MemoryRouter>,
  );

describe("RecentActivityPanel", () => {
  it("renders learning session titles", () => {
    renderPanel(makeRecent(2, 0));

    expect(screen.getByText("学习会话 1")).toBeInTheDocument();
    expect(screen.getByText("学习会话 2")).toBeInTheDocument();
  });

  it("renders reading document titles", () => {
    renderPanel(makeRecent(0, 2));

    expect(screen.getByText("文档 1")).toBeInTheDocument();
    expect(screen.getByText("文档 2")).toBeInTheDocument();
  });

  it("shows at most 3 learning sessions", () => {
    renderPanel(makeRecent(5, 0));

    expect(screen.getByText("学习会话 1")).toBeInTheDocument();
    expect(screen.getByText("学习会话 2")).toBeInTheDocument();
    expect(screen.getByText("学习会话 3")).toBeInTheDocument();
    expect(screen.queryByText("学习会话 4")).not.toBeInTheDocument();
    expect(screen.queryByText("学习会话 5")).not.toBeInTheDocument();
  });

  it("shows at most 3 reading documents", () => {
    renderPanel(makeRecent(0, 5));

    expect(screen.getByText("文档 1")).toBeInTheDocument();
    expect(screen.getByText("文档 2")).toBeInTheDocument();
    expect(screen.getByText("文档 3")).toBeInTheDocument();
    expect(screen.queryByText("文档 4")).not.toBeInTheDocument();
    expect(screen.queryByText("文档 5")).not.toBeInTheDocument();
  });

  it("shows the '全部记录' link", () => {
    renderPanel(makeRecent(1, 1));

    const link = screen.getByText("全部记录");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/sessions");
  });
});

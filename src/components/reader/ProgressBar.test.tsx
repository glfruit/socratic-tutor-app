import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressBar } from "./ProgressBar";

const chapters = [
  { id: "c-1", title: "第 1 章 问题的起点", orderIndex: 0 },
  { id: "c-2", title: "第 2 章 论证与证据", orderIndex: 1 },
  { id: "c-3", title: "第 3 章 迁移与应用", orderIndex: 2 }
];

describe("ProgressBar", () => {
  it("renders progress and supports chapter navigation", async () => {
    const onSelectChapter = vi.fn();

    render(<ProgressBar chapters={chapters} activeChapterId="c-2" progress={67} onSelectChapter={onSelectChapter} />);

    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("正在第 2 / 3 节")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "上一节" }));
    expect(onSelectChapter).toHaveBeenCalledWith("c-1");

    await userEvent.click(screen.getByRole("button", { name: /第 3 章 迁移与应用/i }));
    expect(onSelectChapter).toHaveBeenCalledWith("c-3");
  });
});

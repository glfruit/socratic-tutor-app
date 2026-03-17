import { render, screen } from "@testing-library/react";
import type { HomeStats } from "@/types";
import { StatsPanel } from "./StatsPanel";

const makeStats = (overrides: Partial<HomeStats> = {}): HomeStats => ({
  totalStudyMinutes: 210,
  completedBooks: 3,
  currentStreak: 5,
  ...overrides,
});

describe("StatsPanel", () => {
  it("renders all three stat values", () => {
    render(<StatsPanel stats={makeStats()} />);

    expect(screen.getByText("210")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders stat labels", () => {
    render(<StatsPanel stats={makeStats()} />);

    expect(screen.getByText("专注时长")).toBeInTheDocument();
    expect(screen.getByText("完成阅读")).toBeInTheDocument();
    expect(screen.getByText("连续天数")).toBeInTheDocument();
  });

  it("renders suffixes", () => {
    render(<StatsPanel stats={makeStats()} />);

    expect(screen.getByText("min")).toBeInTheDocument();
    expect(screen.getByText("本")).toBeInTheDocument();
    expect(screen.getByText("天")).toBeInTheDocument();
  });

  it("renders weekly cadence as Math.max(45, round(totalStudyMinutes / 7))", () => {
    render(<StatsPanel stats={makeStats({ totalStudyMinutes: 210 })} />);
    // 210 / 7 = 30, but Math.max(45, 30) = 45
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("shows computed cadence when larger than 45", () => {
    render(<StatsPanel stats={makeStats({ totalStudyMinutes: 700 })} />);
    // 700 / 7 = 100, Math.max(45, 100) = 100
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders section labels", () => {
    render(<StatsPanel stats={makeStats()} />);

    expect(screen.getByText("Learning Tempo")).toBeInTheDocument();
    expect(screen.getByText("Weekly Cadence")).toBeInTheDocument();
    expect(screen.getByText("平均单日学习分钟")).toBeInTheDocument();
  });
});

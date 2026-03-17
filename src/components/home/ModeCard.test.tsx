import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ModeCard } from "./ModeCard";

const defaultProps = {
  eyebrow: "苏格拉底式学习",
  title: "深度学习",
  description: "通过连续追问，把一个概念从模糊推到清晰。",
  details: ["自适应难度", "概念图谱追踪"],
  ctaLabel: "开始学习",
  to: "/subjects",
  icon: <span data-testid="icon">📖</span>,
  tone: "study" as const,
};

const renderCard = (overrides: Partial<typeof defaultProps> = {}) =>
  render(
    <MemoryRouter>
      <ModeCard {...defaultProps} {...overrides} />
    </MemoryRouter>,
  );

describe("ModeCard", () => {
  it("renders all text props", () => {
    renderCard();

    expect(screen.getByText("苏格拉底式学习")).toBeInTheDocument();
    expect(screen.getByText("深度学习")).toBeInTheDocument();
    expect(screen.getByText("通过连续追问，把一个概念从模糊推到清晰。")).toBeInTheDocument();
    expect(screen.getByText("自适应难度")).toBeInTheDocument();
    expect(screen.getByText("概念图谱追踪")).toBeInTheDocument();
    expect(screen.getByText("开始学习")).toBeInTheDocument();
  });

  it("renders icon", () => {
    renderCard();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("links to the correct destination", () => {
    renderCard({ to: "/reader/abc" });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/reader/abc");
  });

  it("renders with study tone", () => {
    renderCard({ tone: "study" });
    const link = screen.getByRole("link");
    expect(link.className).toContain("text-stone-950");
  });

  it("renders with read tone", () => {
    renderCard({ tone: "read" });
    const link = screen.getByRole("link");
    expect(link.className).toContain("text-slate-950");
  });
});

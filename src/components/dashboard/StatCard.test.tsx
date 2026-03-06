import { render, screen } from "@testing-library/react";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="总会话" value="12" icon="📚" />);

    expect(screen.getByText("总会话")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});

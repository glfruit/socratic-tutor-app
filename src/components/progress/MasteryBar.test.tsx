import { render, screen } from "@testing-library/react";
import { MasteryBar } from "./MasteryBar";

describe("MasteryBar", () => {
  it("renders progress with percent", () => {
    render(<MasteryBar concept="函数" level="PROFICIENT" percent={75} />);

    expect(screen.getByText("函数")).toBeInTheDocument();
    expect(screen.getByText("75%")) .toBeInTheDocument();
  });
});

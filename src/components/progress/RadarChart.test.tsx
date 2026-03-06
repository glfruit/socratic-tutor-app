import { render, screen } from "@testing-library/react";
import { RadarChart } from "./RadarChart";

describe("RadarChart", () => {
  it("renders all axes labels", () => {
    render(
      <RadarChart
        points={[
          { label: "数学", value: 80 },
          { label: "科学", value: 70 },
          { label: "人文", value: 65 }
        ]}
      />
    );

    expect(screen.getByText("数学")).toBeInTheDocument();
    expect(screen.getByText("科学")).toBeInTheDocument();
    expect(screen.getByText("人文")).toBeInTheDocument();
  });
});

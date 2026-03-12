import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LevelSelector } from "./LevelSelector";

describe("LevelSelector", () => {
  it("renders five levels, a description card, and emits changes", async () => {
    const onChange = vi.fn();
    render(<LevelSelector value="HIGH_SCHOOL" onChange={onChange} />);

    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByText("综合训练")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: /研究生/i }));

    expect(onChange).toHaveBeenCalledWith("GRADUATE");
  });
});

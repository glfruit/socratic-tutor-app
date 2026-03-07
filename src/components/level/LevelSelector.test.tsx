import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LevelSelector } from "./LevelSelector";

describe("LevelSelector", () => {
  it("renders five levels and emits changes", async () => {
    const onChange = vi.fn();
    render(<LevelSelector value="HIGH_SCHOOL" onChange={onChange} />);

    expect(screen.getAllByRole("button")).toHaveLength(5);
    await userEvent.click(screen.getByRole("button", { name: /研究/i }));

    expect(onChange).toHaveBeenCalledWith("ADVANCED");
  });
});

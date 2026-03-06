import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Send</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables interaction", () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole("button", { name: "处理中..." });
    expect(button).toBeDisabled();
    expect(screen.getByText("处理中...")).toBeInTheDocument();
  });
});

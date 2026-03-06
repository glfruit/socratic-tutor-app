import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./Input";

describe("Input", () => {
  it("renders label and updates value", async () => {
    const onChange = vi.fn();
    render(<Input label="邮箱" value="" onChange={onChange} />);

    const input = screen.getByLabelText("邮箱");
    await userEvent.type(input, "a");

    expect(onChange).toHaveBeenCalled();
  });

  it("shows helper text and error message", () => {
    render(
      <Input
        label="密码"
        value=""
        onChange={() => {}}
        helperText="至少8位"
        error="密码过短"
      />
    );

    expect(screen.getByText("至少8位")).toBeInTheDocument();
    expect(screen.getByText("密码过短")).toBeInTheDocument();
  });
});

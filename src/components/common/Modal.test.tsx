import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Title">
        body
      </Modal>
    );

    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });

  it("renders and closes", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Confirm">
        body
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

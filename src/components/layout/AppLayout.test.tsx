import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("renders navigation and logout action", async () => {
    const onLogout = vi.fn();
    render(
      <MemoryRouter>
        <AppLayout onLogout={onLogout}>
          <div>content</div>
        </AppLayout>
      </MemoryRouter>
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "退出登录" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

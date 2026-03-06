import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionList } from "./SessionList";

describe("SessionList", () => {
  it("renders sessions and handles resume", async () => {
    const onResume = vi.fn();
    render(
      <SessionList
        sessions={[{ id: "s1", title: "代数讨论", subject: "数学", updatedAt: "2026-03-01" }]}
        onResume={onResume}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "继续" }));
    expect(onResume).toHaveBeenCalledWith("s1");
  });
});

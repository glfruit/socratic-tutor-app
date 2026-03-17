import { render, screen } from "@testing-library/react";
import { MessageList } from "./MessageList";

describe("MessageList", () => {
  it("renders empty state", () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText("准备好开始思考了吗？")).toBeInTheDocument();
    expect(screen.getByText(/抛出一个问题/)).toBeInTheDocument();
  });

  it("renders loading skeleton", () => {
    const { container } = render(<MessageList messages={[]} isLoading />);
    const skeletonBlocks = container.querySelectorAll(".animate-pulse");
    expect(skeletonBlocks.length).toBe(3);
  });

  it("renders message items", () => {
    render(
      <MessageList
        messages={[
          { id: "1", role: "user", content: "Q", createdAt: "2026-03-01" },
          { id: "2", role: "assistant", content: "A", createdAt: "2026-03-01" }
        ]}
      />
    );

    expect(screen.getByText("Q")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("does not show skeleton or empty state when messages exist", () => {
    const { container } = render(
      <MessageList
        messages={[
          { id: "1", role: "user", content: "Hello", createdAt: "2026-03-01" }
        ]}
      />
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBe(0);
    expect(screen.queryByText("准备好开始思考了吗？")).not.toBeInTheDocument();
  });
});

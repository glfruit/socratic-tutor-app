import { render, screen } from "@testing-library/react";
import { MessageList } from "./MessageList";

describe("MessageList", () => {
  it("renders empty state", () => {
    render(<MessageList messages={[]} />);
    expect(screen.getByText("准备好开始思考了吗？")).toBeInTheDocument();
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
});

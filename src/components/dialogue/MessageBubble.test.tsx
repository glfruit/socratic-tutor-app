import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
  it("renders user message", () => {
    render(<MessageBubble role="user" content="hello" />);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders assistant hints", () => {
    render(<MessageBubble role="assistant" content="think" hints={["提示1"]} />);
    expect(screen.getByText("提示1")).toBeInTheDocument();
  });
});

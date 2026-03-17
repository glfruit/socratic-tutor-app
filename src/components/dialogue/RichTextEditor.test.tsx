import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// Mock tiptap — the editor is complex, so we test the component shell + toolbar interactions
const mockChain = {
  focus: vi.fn(() => mockChain),
  toggleBold: vi.fn(() => mockChain),
  toggleItalic: vi.fn(() => mockChain),
  toggleBulletList: vi.fn(() => mockChain),
  toggleOrderedList: vi.fn(() => mockChain),
  insertInlineMath: vi.fn(() => mockChain),
  insertBlockMath: vi.fn(() => mockChain),
  insertContent: vi.fn(() => mockChain),
  setContent: vi.fn(() => mockChain),
  run: vi.fn(),
};

const mockEditor = {
  isActive: vi.fn(() => false),
  chain: vi.fn(() => mockChain),
  getHTML: vi.fn(() => "<p>test</p>"),
  getJSON: vi.fn(() => ({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "test" }] }] })),
  setEditable: vi.fn(),
  commands: { setContent: vi.fn() },
};

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: vi.fn(({ editor }: { editor: unknown }) =>
    editor ? <div data-testid="editor-content">Editor</div> : null
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: { configure: vi.fn(() => ({})) },
}));

vi.mock("@tiptap/extension-placeholder", () => ({
  Placeholder: { configure: vi.fn(() => ({})) },
}));

vi.mock("@tiptap/extension-mathematics", () => ({
  Mathematics: { configure: vi.fn(() => ({})) },
}));

import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor", () => {
  const defaultProps = {
    valueHtml: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders editor content and toolbar buttons", () => {
    render(<RichTextEditor {...defaultProps} />);

    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
    expect(screen.getByTitle("加粗")).toBeInTheDocument();
    expect(screen.getByTitle("斜体")).toBeInTheDocument();
    expect(screen.getByTitle("无序列表")).toBeInTheDocument();
    expect(screen.getByTitle("有序列表")).toBeInTheDocument();
    expect(screen.getByTitle("插入行内公式")).toBeInTheDocument();
    expect(screen.getByTitle("插入块级公式")).toBeInTheDocument();
  });

  it("toggles bold on toolbar click", () => {
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("加粗"));
    expect(mockChain.toggleBold).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("toggles italic on toolbar click", () => {
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("斜体"));
    expect(mockChain.toggleItalic).toHaveBeenCalled();
  });

  it("toggles bullet list on toolbar click", () => {
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("无序列表"));
    expect(mockChain.toggleBulletList).toHaveBeenCalled();
  });

  it("toggles ordered list on toolbar click", () => {
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("有序列表"));
    expect(mockChain.toggleOrderedList).toHaveBeenCalled();
  });

  it("inserts inline math via prompt", () => {
    vi.spyOn(window, "prompt").mockReturnValueOnce("x^2");
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("插入行内公式"));
    expect(mockChain.insertInlineMath).toHaveBeenCalledWith({ latex: "x^2" });
  });

  it("does not insert inline math when prompt is cancelled", () => {
    vi.spyOn(window, "prompt").mockReturnValueOnce(null);
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("插入行内公式"));
    expect(mockChain.insertInlineMath).not.toHaveBeenCalled();
  });

  it("inserts block math via prompt", () => {
    vi.spyOn(window, "prompt").mockReturnValueOnce("E = mc^2");
    render(<RichTextEditor {...defaultProps} />);
    fireEvent.click(screen.getByTitle("插入块级公式"));
    expect(mockChain.insertBlockMath).toHaveBeenCalledWith({ latex: "E = mc^2" });
  });

  it("renders special character buttons and inserts on click", () => {
    render(<RichTextEditor {...defaultProps} />);

    const alphaButton = screen.getByText("α");
    expect(alphaButton).toBeInTheDocument();

    fireEvent.click(alphaButton);
    expect(mockChain.insertContent).toHaveBeenCalledWith("α");
  });

  it("renders all 14 special character buttons", () => {
    render(<RichTextEditor {...defaultProps} />);
    const chars = ["α", "β", "γ", "Δ", "λ", "μ", "π", "∞", "≈", "≠", "≤", "≥", "→", "°"];
    for (const char of chars) {
      expect(screen.getByText(char)).toBeInTheDocument();
    }
  });
});

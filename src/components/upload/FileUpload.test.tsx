import { fireEvent, render, screen } from "@testing-library/react";
import { FileUpload } from "./FileUpload";

describe("FileUpload", () => {
  it("shows selected file metadata", () => {
    const file = new File(["demo"], "logic.pdf", { type: "application/pdf" });
    render(<FileUpload file={file} type="BOOK" onFileSelect={vi.fn()} />);

    expect(screen.getByText("logic.pdf")).toBeInTheDocument();
    expect(screen.getByText(/阅读模式/)).toBeInTheDocument();
  });

  it("handles dropped files", () => {
    const onFileSelect = vi.fn();
    render(<FileUpload file={null} type="MATERIAL" onFileSelect={onFileSelect} />);

    fireEvent.drop(screen.getByRole("button", { name: /拖拽文件到这里/i }), {
      dataTransfer: {
        files: [new File(["physics"], "notes.txt", { type: "text/plain" })]
      }
    });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect.mock.calls[0][0].name).toBe("notes.txt");
  });
});

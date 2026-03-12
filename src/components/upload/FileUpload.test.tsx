import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FileUpload } from "./FileUpload";

const createDropPayload = (file: File) => ({
  dataTransfer: {
    files: [file],
    items: [
      {
        kind: "file",
        type: file.type,
        getAsFile: () => file
      }
    ],
    types: ["Files"]
  }
});

describe("FileUpload", () => {
  it("shows selected file metadata", () => {
    const file = new File(["demo"], "logic.pdf", { type: "application/pdf" });
    render(<FileUpload file={file} type="BOOK" onFileSelect={vi.fn()} />);

    expect(screen.getByText("logic.pdf")).toBeInTheDocument();
    expect(screen.getByText(/阅读模式/)).toBeInTheDocument();
  });

  it("handles dropped files", async () => {
    const onFileSelect = vi.fn();
    render(<FileUpload file={null} type="MATERIAL" onFileSelect={onFileSelect} />);

    const file = new File(["physics"], "notes.txt", { type: "text/plain" });
    fireEvent.drop(screen.getByRole("group", { name: "文档上传拖拽区域" }), createDropPayload(file));

    await waitFor(() => expect(onFileSelect).toHaveBeenCalledTimes(1));
    expect(onFileSelect.mock.calls[0][0].name).toBe("notes.txt");
  });

  it("reports invalid file types", async () => {
    const onError = vi.fn();
    render(<FileUpload file={null} type="BOOK" onFileSelect={vi.fn()} onError={onError} />);

    const file = new File(["zip"], "archive.zip", { type: "application/zip" });
    fireEvent.drop(screen.getByRole("group", { name: "文档上传拖拽区域" }), createDropPayload(file));

    await waitFor(() => expect(onError).toHaveBeenCalledWith("仅支持 EPUB、PDF、DOCX 或 TXT 文件。"));
  });
});

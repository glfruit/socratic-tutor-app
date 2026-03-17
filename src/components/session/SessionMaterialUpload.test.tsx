import { render, screen, fireEvent } from "@testing-library/react";
import { SessionMaterialUpload } from "./SessionMaterialUpload";
import type { SessionMaterial } from "@/types";

const makeMaterial = (overrides: Partial<SessionMaterial> = {}): SessionMaterial => ({
  id: "mat-1",
  sessionId: "session-1",
  filename: "lecture.pdf",
  title: "批判性思维导论",
  status: "READY",
  createdAt: "2026-03-10T08:00:00Z",
  size: 2_500_000,
  ...overrides,
});

describe("SessionMaterialUpload", () => {
  const defaultProps = {
    materials: [] as SessionMaterial[],
    isLoading: false,
    isUploading: false,
    deletingMaterialIds: [] as string[],
    onUpload: vi.fn(),
    onDelete: vi.fn(),
  };

  it("shows empty state when no materials", () => {
    render(<SessionMaterialUpload {...defaultProps} />);
    expect(screen.getByText(/当前会话还没有参考资料/)).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(<SessionMaterialUpload {...defaultProps} isLoading />);
    expect(screen.getByText("正在读取资料列表...")).toBeInTheDocument();
  });

  it("renders material list with status badges", () => {
    const materials = [
      makeMaterial({ id: "m1", status: "READY", title: "讲义 A" }),
      makeMaterial({ id: "m2", status: "PROCESSING", title: "讲义 B" }),
    ];
    render(<SessionMaterialUpload {...defaultProps} materials={materials} />);

    expect(screen.getByText("讲义 A")).toBeInTheDocument();
    expect(screen.getByText("讲义 B")).toBeInTheDocument();
    expect(screen.getByText("可引用")).toBeInTheDocument();
    expect(screen.getByText("解析中")).toBeInTheDocument();
    expect(screen.getByText("2 份资料")).toBeInTheDocument();
  });

  it("formats file sizes correctly", () => {
    const materials = [
      makeMaterial({ id: "m1", size: 2_500_000 }),
      makeMaterial({ id: "m2", size: 512_000 }),
      makeMaterial({ id: "m3", size: undefined }),
    ];
    render(<SessionMaterialUpload {...defaultProps} materials={materials} />);

    expect(screen.getByText("2.4 MB")).toBeInTheDocument();
    expect(screen.getByText("500 KB")).toBeInTheDocument();
    expect(screen.getByText("未记录大小")).toBeInTheDocument();
  });

  it("calls onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(
      <SessionMaterialUpload
        {...defaultProps}
        materials={[makeMaterial()]}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByText("删除"));
    expect(onDelete).toHaveBeenCalledWith("mat-1");
  });

  it("shows deleting state for specific material", () => {
    render(
      <SessionMaterialUpload
        {...defaultProps}
        materials={[makeMaterial()]}
        deletingMaterialIds={["mat-1"]}
      />
    );

    expect(screen.getByText("删除中...")).toBeInTheDocument();
  });

  it("validates file type on upload", () => {
    render(<SessionMaterialUpload {...defaultProps} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const badFile = new File(["zip"], "archive.zip", { type: "application/zip" });

    fireEvent.change(input, { target: { files: [badFile] } });
    expect(screen.getByText("仅支持 EPUB、PDF、DOCX 或 TXT 文件。")).toBeInTheDocument();
    expect(defaultProps.onUpload).not.toHaveBeenCalled();
  });

  it("validates file size on upload", () => {
    render(<SessionMaterialUpload {...defaultProps} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = new File(["x".repeat(100)], "huge.pdf", { type: "application/pdf" });
    Object.defineProperty(bigFile, "size", { value: 60 * 1024 * 1024 });

    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByText("文件大小不能超过 50MB。")).toBeInTheDocument();
  });

  it("calls onUpload for valid file", () => {
    const onUpload = vi.fn();
    render(<SessionMaterialUpload {...defaultProps} onUpload={onUpload} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "notes.pdf", { type: "application/pdf" });

    fireEvent.change(input, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("shows error prop message", () => {
    render(<SessionMaterialUpload {...defaultProps} error="服务器错误" />);
    expect(screen.getByText("服务器错误")).toBeInTheDocument();
  });

  it("disables upload button when uploading", () => {
    render(<SessionMaterialUpload {...defaultProps} isUploading />);
    expect(screen.getByText("上传中...")).toBeInTheDocument();
    expect(screen.getByText("上传中...").closest("button")).toBeDisabled();
  });

  it("shows ERROR status badge", () => {
    render(
      <SessionMaterialUpload
        {...defaultProps}
        materials={[makeMaterial({ status: "ERROR" })]}
      />
    );
    expect(screen.getByText("异常")).toBeInTheDocument();
  });
});

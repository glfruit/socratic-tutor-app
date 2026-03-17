import { render, screen } from "@testing-library/react";
import { UploadProgress } from "./UploadProgress";

describe("UploadProgress", () => {
  it("renders progress percentage", () => {
    render(<UploadProgress progress={64} isUploading={true} stage="uploading" />);
    expect(screen.getByText("64%")).toBeInTheDocument();
  });

  it("shows stage labels", () => {
    const { rerender } = render(
      <UploadProgress progress={0} isUploading={false} stage="idle" />,
    );
    expect(screen.getByText("准备中")).toBeInTheDocument();

    rerender(<UploadProgress progress={10} isUploading={true} stage="validating" />);
    expect(screen.getByText("校验中")).toBeInTheDocument();

    rerender(<UploadProgress progress={50} isUploading={true} stage="uploading" />);
    expect(screen.getByText("上传中")).toBeInTheDocument();

    rerender(<UploadProgress progress={85} isUploading={true} stage="processing" />);
    expect(screen.getByText("处理中")).toBeInTheDocument();

    rerender(<UploadProgress progress={100} isUploading={false} stage="success" />);
    expect(screen.getByText("已完成")).toBeInTheDocument();

    rerender(<UploadProgress progress={30} isUploading={false} stage="error" />);
    expect(screen.getByText("出现问题")).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(
      <UploadProgress
        progress={30}
        isUploading={false}
        stage="error"
        error="文件格式不支持"
      />,
    );
    expect(screen.getByText("文件格式不支持")).toBeInTheDocument();
  });

  it("shows fileName in status text", () => {
    render(
      <UploadProgress
        progress={50}
        isUploading={true}
        stage="uploading"
        fileName="逻辑学导论.pdf"
      />,
    );
    expect(
      screen.getByText("逻辑学导论.pdf 正在进入处理队列。"),
    ).toBeInTheDocument();
  });

  it("clamps progress to 0-100", () => {
    const { rerender } = render(
      <UploadProgress progress={-20} isUploading={true} stage="uploading" />,
    );
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(
      <UploadProgress progress={150} isUploading={true} stage="uploading" />,
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});

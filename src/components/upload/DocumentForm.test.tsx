import { fireEvent, render, screen } from "@testing-library/react";
import { DocumentForm } from "./DocumentForm";
import type { DocumentFormValue } from "./DocumentForm";

const defaultValue: DocumentFormValue = {
  title: "",
  description: "",
  type: "BOOK",
};

const renderForm = (overrides: {
  value?: DocumentFormValue;
  onChange?: (v: DocumentFormValue) => void;
  disabled?: boolean;
  fileName?: string | null;
} = {}) =>
  render(
    <DocumentForm
      value={overrides.value ?? defaultValue}
      onChange={overrides.onChange ?? vi.fn()}
      disabled={overrides.disabled}
      fileName={overrides.fileName}
    />,
  );

describe("DocumentForm", () => {
  it("renders type selection cards", () => {
    renderForm();

    expect(screen.getByText("书籍")).toBeInTheDocument();
    expect(screen.getByText("学习资料")).toBeInTheDocument();
  });

  it("calls onChange when type card is clicked", () => {
    const onChange = vi.fn();
    renderForm({ onChange });

    fireEvent.click(screen.getByText("学习资料"));

    expect(onChange).toHaveBeenCalledWith({
      title: "",
      description: "",
      type: "MATERIAL",
    });
  });

  it("renders title and description inputs", () => {
    renderForm();

    expect(screen.getByPlaceholderText("例如：批判性思维导论")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("补充作者、用途、课程背景或希望重点关注的章节"),
    ).toBeInTheDocument();
  });

  it("shows fileName when provided", () => {
    renderForm({ fileName: "认知科学导论.pdf" });

    expect(screen.getByText("认知科学导论.pdf")).toBeInTheDocument();
  });

  it("does not show fileName section when absent", () => {
    renderForm({ fileName: null });

    expect(screen.queryByText("当前文件：")).not.toBeInTheDocument();
  });

  it("disables inputs and buttons in disabled state", () => {
    renderForm({ disabled: true });

    const titleInput = screen.getByPlaceholderText("例如：批判性思维导论");
    expect(titleInput).toBeDisabled();

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});

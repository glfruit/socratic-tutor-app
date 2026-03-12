import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BookReaderPage } from "./BookReaderPage";

describe("BookReaderPage", () => {
  it("loads reader layout, supports chapter jump, and sends a question", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("network disabled"));

    render(
      <MemoryRouter initialEntries={["/reader/doc-book-1"]}>
        <Routes>
          <Route path="/reader/:documentId" element={<BookReaderPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "第 1 章 问题的起点" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "下一节" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "第 2 章 论证与证据" })).toBeInTheDocument();
    });

    await userEvent.type(screen.getByPlaceholderText(/输入一个问题/i), "这段文字真正的中心论点是什么？");
    await userEvent.click(screen.getByRole("button", { name: /发送问题/i }));

    await waitFor(() => {
      expect(screen.getByText(/这段文字真正的中心论点/)).toBeInTheDocument();
    });

    vi.restoreAllMocks();
  });
});

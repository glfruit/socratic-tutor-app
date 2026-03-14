import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlansPage } from "@/pages/PlansPage";
import { planService } from "@/services/planService";

vi.mock("@/services/planService", () => ({
  planService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

const mockedPlanService = vi.mocked(planService);

const samplePlans = [
  {
    id: "plan-1",
    title: "完成牛顿力学复盘",
    subject: "物理",
    status: "PENDING" as const,
    description: "整理受力分析与典型题型",
    createdAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-03-10T00:00:00Z"
  },
  {
    id: "plan-2",
    title: "打磨英文摘要写作",
    subject: "英语",
    status: "COMPLETED" as const,
    createdAt: "2026-03-08T00:00:00Z",
    updatedAt: "2026-03-09T00:00:00Z"
  }
];

describe("PlansPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPlanService.list.mockResolvedValue(samplePlans);
    mockedPlanService.create.mockResolvedValue(samplePlans[0]);
    mockedPlanService.update.mockResolvedValue({ ...samplePlans[0], status: "IN_PROGRESS" });
    mockedPlanService.delete.mockResolvedValue();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("loads plans and filters by status", async () => {
    render(
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("完成牛顿力学复盘")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "已完成" }));

    expect(screen.queryByText("完成牛顿力学复盘")).not.toBeInTheDocument();
    expect(screen.getByText("打磨英文摘要写作")).toBeInTheDocument();
  });

  it("creates a new plan from the form", async () => {
    render(
      <MemoryRouter>
        <PlansPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("完成牛顿力学复盘")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "新建学习计划" }));
    await userEvent.type(screen.getByLabelText("计划标题"), "两周内完成电磁学错题清单");
    await userEvent.type(screen.getByLabelText("学科"), "物理");
    await userEvent.click(screen.getByRole("button", { name: "保存计划" }));

    await waitFor(() => {
      expect(mockedPlanService.create).toHaveBeenCalledWith({
        title: "两周内完成电磁学错题清单",
        subject: "物理",
        description: undefined,
        targetDate: undefined
      });
    });
  });
});

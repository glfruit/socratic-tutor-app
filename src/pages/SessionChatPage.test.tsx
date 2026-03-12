import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { SessionChatPage } from "@/pages/SessionChatPage";
import { usePreferencesStore } from "@/stores/usePreferencesStore";
import { useSessionStore } from "@/stores/sessionStore";

vi.mock("@/components/dialogue/MessageList", () => ({
  MessageList: ({ messages }: { messages: Array<{ content: string }> }) => (
    <div data-testid="message-list">{messages.map((message) => message.content).join("|")}</div>
  )
}));

vi.mock("@/components/dialogue/MessageInput", () => ({
  MessageInput: () => <div data-testid="message-input">input</div>
}));

function SessionRouteHarness() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <button type="button" onClick={() => navigate("/sessions/session-physics?subject=数学&level=HIGH_SCHOOL")}>
        切换到数学
      </button>
      <div data-testid="route-state">{`${location.pathname}${location.search}`}</div>
      <SessionChatPage />
    </>
  );
}

describe("SessionChatPage", () => {
  const resetSessionMock = vi.fn(() => {
    useSessionStore.setState({
      currentSessionId: null,
      messages: [],
      materials: [],
      isStreaming: false,
      isLoadingSession: false,
      isLoadingMaterials: false,
      isUploadingMaterial: false,
      deletingMaterialIds: [],
      error: null,
      activeContext: null
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    usePreferencesStore.setState({
      defaultLevel: "HIGH_SCHOOL",
      theme: "system",
      isLoading: false,
      loadPreferences: vi.fn(),
      setDefaultLevel: vi.fn(),
      setTheme: vi.fn()
    });

    useSessionStore.setState({
      currentSessionId: "session-physics",
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "物理旧消息",
          createdAt: "2026-03-07T08:00:00Z"
        }
      ],
      materials: [],
      isStreaming: false,
      isLoadingSession: false,
      isLoadingMaterials: false,
      isUploadingMaterial: false,
      deletingMaterialIds: [],
      error: null,
      activeContext: null,
      loadSession: vi.fn(),
      loadSessionMaterials: vi.fn(),
      resetSession: resetSessionMock,
      clearError: vi.fn(),
      sendMessage: vi.fn(),
      uploadMaterial: vi.fn(),
      deleteMaterial: vi.fn(),
      stopStreaming: vi.fn()
    });
  });

  it("shows Chinese labels for the selected level", () => {
    render(
      <MemoryRouter initialEntries={["/sessions/new?subject=数学&level=HIGH_SCHOOL"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionChatPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getAllByText("高中").length).toBeGreaterThan(0);
    expect(screen.queryByText("HIGH_SCHOOL")).not.toBeInTheDocument();
  });

  it("does not render stale messages when entering a fresh subject route", () => {
    render(
      <MemoryRouter initialEntries={["/sessions/new?subject=数学&level=HIGH_SCHOOL"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionChatPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("message-list")).toHaveTextContent("");
    expect(resetSessionMock).toHaveBeenCalled();
  });

  it("resets the current session and routes to a fresh session when the subject changes", async () => {
    render(
      <MemoryRouter initialEntries={["/sessions/session-physics?subject=物理&level=HIGH_SCHOOL"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionRouteHarness />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: "切换到数学" }));

    await waitFor(() => {
      expect(screen.getByTestId("route-state")).toHaveTextContent(
        "/sessions/new?subject=%E6%95%B0%E5%AD%A6&level=HIGH_SCHOOL"
      );
    });

    expect(useSessionStore.getState().messages).toEqual([]);
    expect(resetSessionMock).toHaveBeenCalled();
  });
});

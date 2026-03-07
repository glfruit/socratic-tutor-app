import { useSessionStore } from "@/stores/sessionStore";
import { sessionService } from "@/services/sessionService";

vi.mock("@/services/sessionService", () => ({
  sessionService: {
    getSessionMessages: vi.fn(),
    createSession: vi.fn(),
    sendMessage: vi.fn()
  }
}));

describe("sessionStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionStore.setState({
      currentSessionId: null,
      messages: [],
      isStreaming: false,
      isLoadingSession: false,
      error: null
    });
  });

  it("creates a new session before sending the first message", async () => {
    vi.mocked(sessionService.createSession).mockResolvedValue({
      id: "session-123",
      title: "数学对话",
      subject: "数学",
      updatedAt: "2026-03-07T08:00:00Z"
    });
    vi.mocked(sessionService.sendMessage).mockResolvedValue({
      id: "assistant-1",
      role: "assistant",
      content: "",
      createdAt: "2026-03-07T08:00:01Z"
    });

    const result = await useSessionStore.getState().sendMessage("先从条件开始", {
      subject: "数学",
      level: "HIGH_SCHOOL"
    });

    expect(result).toEqual({ ok: true, sessionId: "session-123" });
    expect(sessionService.createSession).toHaveBeenCalledWith({
      subject: "数学",
      level: "HIGH_SCHOOL",
      title: "数学对话"
    });
    expect(sessionService.sendMessage).toHaveBeenCalledWith("session-123", "先从条件开始");
    expect(useSessionStore.getState().currentSessionId).toBe("session-123");
    expect(useSessionStore.getState().messages).toHaveLength(2);
  });

  it("surfaces an error when creating a session fails", async () => {
    vi.mocked(sessionService.createSession).mockRejectedValue(new Error("network"));

    const result = await useSessionStore.getState().sendMessage("测试消息", {
      subject: "科学",
      level: "MIDDLE_SCHOOL"
    });

    expect(result).toEqual({ ok: false, error: "新会话创建失败，请稍后重试。" });
    expect(sessionService.sendMessage).not.toHaveBeenCalled();
    expect(useSessionStore.getState().error).toBe("新会话创建失败，请稍后重试。");
    expect(useSessionStore.getState().messages).toEqual([]);
  });

  it("returns a failed result when sending the message fails", async () => {
    useSessionStore.setState({
      currentSessionId: "session-123",
      messages: [],
      isStreaming: false,
      isLoadingSession: false,
      error: null
    });
    vi.mocked(sessionService.sendMessage).mockRejectedValue(new Error("发送失败"));

    const result = await useSessionStore.getState().sendMessage("测试消息");

    expect(result).toEqual({ ok: false, error: "发送失败" });
    expect(useSessionStore.getState().error).toBe("发送失败");
    expect(useSessionStore.getState().messages).toEqual([]);
    expect(useSessionStore.getState().isStreaming).toBe(false);
  });
});

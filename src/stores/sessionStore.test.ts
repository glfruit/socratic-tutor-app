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
      error: null,
      activeContext: null
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

  it("resetSession clears all session state", () => {
    useSessionStore.setState({
      currentSessionId: "session-123",
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "旧消息",
          createdAt: "2026-03-07T08:00:00Z"
        }
      ],
      isStreaming: true,
      isLoadingSession: true,
      error: "错误",
      activeContext: {
        subject: "物理",
        level: "HIGH_SCHOOL"
      }
    });

    useSessionStore.getState().resetSession();

    expect(useSessionStore.getState()).toMatchObject({
      currentSessionId: null,
      messages: [],
      isStreaming: false,
      isLoadingSession: false,
      error: null,
      activeContext: null
    });
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
      error: null,
      activeContext: null
    });
    vi.mocked(sessionService.sendMessage).mockRejectedValue(new Error("发送失败"));

    const result = await useSessionStore.getState().sendMessage("测试消息");

    expect(result).toEqual({ ok: false, error: "发送失败" });
    expect(useSessionStore.getState().error).toBe("发送失败");
    expect(useSessionStore.getState().messages).toEqual([]);
    expect(useSessionStore.getState().isStreaming).toBe(false);
  });

  it("creates a fresh session when the subject context changes", async () => {
    useSessionStore.setState({
      currentSessionId: "session-physics",
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "旧会话内容",
          createdAt: "2026-03-07T08:00:00Z"
        }
      ],
      isStreaming: false,
      isLoadingSession: false,
      error: null,
      activeContext: {
        subject: "物理",
        level: "HIGH_SCHOOL"
      }
    });
    vi.mocked(sessionService.createSession).mockResolvedValue({
      id: "session-math",
      title: "数学对话",
      subject: "数学",
      updatedAt: "2026-03-07T08:10:00Z"
    });
    vi.mocked(sessionService.sendMessage).mockResolvedValue({
      id: "assistant-2",
      role: "assistant",
      content: "",
      createdAt: "2026-03-07T08:10:01Z"
    });

    const result = await useSessionStore.getState().sendMessage("新问题", {
      subject: "数学",
      level: "HIGH_SCHOOL"
    });

    expect(result).toEqual({ ok: true, sessionId: "session-math" });
    expect(sessionService.createSession).toHaveBeenCalledWith({
      subject: "数学",
      level: "HIGH_SCHOOL",
      title: "数学对话"
    });
    expect(sessionService.sendMessage).toHaveBeenCalledWith("session-math", "新问题");
    expect(useSessionStore.getState().currentSessionId).toBe("session-math");
    expect(useSessionStore.getState().messages).toHaveLength(2);
    expect(useSessionStore.getState().messages[0]?.content).toBe("新问题");
  });

  it("ignores stale session loads after a reset", async () => {
    let resolveMessages: ((value: Array<{
      id: string;
      role: "user";
      content: string;
      createdAt: string;
    }>) => void) | undefined;

    vi.mocked(sessionService.getSessionMessages).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMessages = resolve;
        })
    );

    const loadPromise = useSessionStore.getState().loadSession("session-physics");
    useSessionStore.getState().resetSession();
    resolveMessages?.([
      {
        id: "message-1",
        role: "user",
        content: "不应显示",
        createdAt: "2026-03-07T08:00:00Z"
      }
    ]);

    await loadPromise;

    expect(useSessionStore.getState()).toMatchObject({
      currentSessionId: null,
      messages: [],
      isLoadingSession: false
    });
  });
});

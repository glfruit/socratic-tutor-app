import type {
  Chapter,
  ChatMessage,
  DocumentDetail,
  DocumentSummary,
  HomeData,
  MasteryRecord,
  ProgressStat,
  ReadingSession,
  SessionSummary,
  Subject,
  UserPreferences
} from "@/types";

export const mockSessions: SessionSummary[] = [
  {
    id: "s-1",
    title: "代数方程入门",
    subject: "数学",
    updatedAt: "2026-03-05",
    status: "ACTIVE",
    preview: "你能先定义一下未知数吗？",
    messageCount: 8
  },
  {
    id: "s-2",
    title: "力学基本定律",
    subject: "科学",
    updatedAt: "2026-03-04",
    status: "PAUSED",
    preview: "如果没有外力会发生什么？",
    messageCount: 12
  }
];

export const mockSubjects: Subject[] = [
  {
    id: "math",
    name: "数学",
    description: "数学思维与问题解决",
    knowledgePoints: [
      { id: "kp-1", subjectId: "math", name: "代数", createdAt: "2024-01-01" },
      { id: "kp-2", subjectId: "math", name: "几何", createdAt: "2024-01-01" },
      { id: "kp-3", subjectId: "math", name: "微积分", createdAt: "2024-01-01" }
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "science",
    name: "科学",
    description: "自然科学探索",
    knowledgePoints: [
      { id: "kp-4", subjectId: "science", name: "物理", createdAt: "2024-01-01" },
      { id: "kp-5", subjectId: "science", name: "化学", createdAt: "2024-01-01" },
      { id: "kp-6", subjectId: "science", name: "生物", createdAt: "2024-01-01" }
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "humanity",
    name: "人文",
    description: "人文社科素养",
    knowledgePoints: [
      { id: "kp-7", subjectId: "humanity", name: "哲学", createdAt: "2024-01-01" },
      { id: "kp-8", subjectId: "humanity", name: "文学", createdAt: "2024-01-01" },
      { id: "kp-9", subjectId: "humanity", name: "历史", createdAt: "2024-01-01" }
    ],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  }
];

export const mockMessages: Record<string, ChatMessage[]> = {
  "s-1": [
    { id: "m-1", role: "assistant", content: "你会如何描述这个问题？", createdAt: "2026-03-05T09:00:00Z", hints: ["定义变量", "列出已知条件"] },
    { id: "m-2", role: "user", content: "我先设x为苹果数量", createdAt: "2026-03-05T09:01:00Z" }
  ],
  "s-2": [
    { id: "m-3", role: "assistant", content: "牛顿第一定律告诉了我们什么？", createdAt: "2026-03-04T08:00:00Z", hints: ["惯性", "受力分析"] }
  ]
};

export const mockProgressStats: ProgressStat[] = [
  { label: "总会话", value: 24 },
  { label: "学习天数", value: 13 },
  { label: "总提问", value: 196 }
];

export const mockRadar = [
  { label: "数学", value: 82 },
  { label: "科学", value: 71 },
  { label: "人文", value: 64 }
];

export const mockMastery: MasteryRecord[] = [
  { concept: "方程求解", level: "PROFICIENT", percent: 78 },
  { concept: "受力分析", level: "UNDERSTANDING", percent: 56 },
  { concept: "逻辑论证", level: "MASTERY", percent: 91 }
];

export const mockChapters: Chapter[] = [
  {
    id: "c-1",
    title: "第 1 章 问题的起点",
    orderIndex: 0,
    content:
      "苏格拉底式阅读并不急于寻找答案，而是先校准问题。阅读时先识别作者提出了什么核心问题，再观察论证依赖了哪些前提。"
  },
  {
    id: "c-2",
    title: "第 2 章 论证与证据",
    orderIndex: 1,
    content:
      "当一个观点看起来可信时，真正值得追问的是：它依赖了什么证据？这些证据是否足够支持结论，是否还存在更强的反例。"
  },
  {
    id: "c-3",
    title: "第 3 章 迁移与应用",
    orderIndex: 2,
    content:
      "理解不是复述。真正的理解意味着把原文中的概念迁移到新场景中，并解释为什么在新场景下依然成立，或者为什么会失效。"
  }
];

export const mockDocuments: DocumentSummary[] = [
  {
    id: "doc-book-1",
    type: "BOOK",
    title: "批判性思维导论",
    author: "D. Fisher",
    description: "一本适合用苏格拉底式提问阅读的入门书。",
    status: "READY",
    progress: 42,
    createdAt: "2026-03-01T09:00:00Z"
  },
  {
    id: "doc-book-2",
    type: "BOOK",
    title: "科学革命的结构",
    author: "Thomas Kuhn",
    description: "围绕范式转换与科学史进行阅读讨论。",
    status: "READY",
    progress: 18,
    createdAt: "2026-02-28T11:30:00Z"
  },
  {
    id: "doc-material-1",
    type: "MATERIAL",
    title: "牛顿定律课堂讲义",
    description: "配合力学学习对话使用。",
    status: "PROCESSING",
    progress: 0,
    createdAt: "2026-03-06T15:10:00Z"
  }
];

export const mockDocumentDetails: Record<string, DocumentDetail> = {
  "doc-book-1": {
    ...mockDocuments[0],
    chapters: mockChapters
  },
  "doc-book-2": {
    ...mockDocuments[1],
    chapters: mockChapters.map((chapter, index) => ({
      ...chapter,
      id: `kuhn-${index + 1}`,
      title: chapter.title.replace("第", "Kuhn 第"),
      content: `${chapter.content} 这段内容用于模拟另一本文档的章节载荷。`
    }))
  },
  "doc-material-1": {
    ...mockDocuments[2],
    chapters: []
  }
};

export const mockReadingSessions: Record<string, ReadingSession> = {
  "doc-book-1": {
    id: "read-1",
    document: { id: "doc-book-1", title: "批判性思维导论" },
    currentChapter: mockChapters[0],
    messages: [
      {
        id: "read-m-1",
        role: "assistant",
        content: "如果作者要你只带走一个判断标准，你觉得会是哪一个？",
        createdAt: "2026-03-06T09:00:00Z",
        metadata: { referencedText: "先校准问题", pageNumber: 3 }
      }
    ],
    progress: 42,
    status: "ACTIVE",
    createdAt: "2026-03-06T09:00:00Z"
  }
};

export const mockHomeData: HomeData = {
  user: {
    id: "u-1",
    email: "learner@example.com",
    name: "学习者",
    role: "STUDENT",
    level: "HIGH_SCHOOL"
  },
  stats: {
    totalStudyMinutes: 320,
    completedBooks: 3,
    currentStreak: 5
  },
  recent: {
    learning: mockSessions,
    reading: mockDocuments.filter((item) => item.type === "BOOK")
  }
};

export const mockPreferences: UserPreferences = {
  defaultLevel: "HIGH_SCHOOL",
  theme: "system"
};

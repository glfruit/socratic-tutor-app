import type { ChatMessage, MasteryRecord, ProgressStat, SessionSummary, Subject } from "@/types";

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
  { id: "math", name: "数学", domains: ["代数", "几何", "微积分"] },
  { id: "science", name: "科学", domains: ["物理", "化学", "生物"] },
  { id: "humanity", name: "人文", domains: ["哲学", "文学", "历史"] }
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

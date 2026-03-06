export type UserRole = "GUEST" | "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SessionSummary {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  status?: "ACTIVE" | "PAUSED" | "ARCHIVED";
  preview?: string;
  messageCount?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  hints?: string[];
}

export interface Subject {
  id: string;
  name: string;
  domains: string[];
}

export interface ProgressStat {
  label: string;
  value: number;
}

export interface MasteryRecord {
  concept: string;
  level: "BEGINNER" | "UNDERSTANDING" | "PROFICIENT" | "MASTERY";
  percent: number;
}

export type UserRole = "GUEST" | "STUDENT" | "TEACHER" | "ADMIN";
export type LearningLevel = "ELEMENTARY" | "MIDDLE_SCHOOL" | "HIGH_SCHOOL" | "UNIVERSITY" | "GRADUATE";
export type DocumentType = "BOOK" | "MATERIAL";
export type DocumentStatus = "PROCESSING" | "READY" | "ERROR";
export type ThemePreference = "system" | "light" | "dark";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  level?: LearningLevel;
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
  metadata?: {
    referencedText?: string;
    pageNumber?: number;
  };
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

export interface HomeStats {
  totalStudyMinutes: number;
  completedBooks: number;
  currentStreak: number;
}

export interface HomeData {
  user: User;
  stats: HomeStats;
  recent: {
    learning: SessionSummary[];
    reading: DocumentSummary[];
  };
}

export interface DocumentSummary {
  id: string;
  type: DocumentType;
  title: string;
  author?: string;
  description?: string;
  status: DocumentStatus;
  progress: number;
  coverUrl?: string;
  createdAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  content?: string;
}

export interface DocumentDetail extends DocumentSummary {
  chapters: Chapter[];
}

export interface DocumentFilters {
  search: string;
  type: DocumentType | "ALL";
  status: DocumentStatus | "ALL";
}

export interface ReadingSession {
  id: string;
  document: Pick<DocumentSummary, "id" | "title">;
  currentChapter: Chapter;
  messages: ChatMessage[];
  progress: number;
  status: "ACTIVE" | "PAUSED" | "DONE";
  createdAt: string;
}

export interface ReadingMessageContext {
  selectedText?: string;
  pageNumber?: number;
}

export interface UserPreferences {
  defaultLevel: LearningLevel;
  theme: ThemePreference;
}

export interface UploadDocumentInput {
  file: File;
  type: DocumentType;
  title?: string;
  description?: string;
}

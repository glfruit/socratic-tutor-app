import {
  DocumentStatus,
  DocumentType,
  Level,
  MasteryLevel,
  Role,
  SessionStatus
} from '@prisma/client';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.nativeEnum(Role).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const sessionCreateSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().optional(),
  title: z.string().min(1)
});

export const sessionUpdateSchema = z.object({
  subject: z.string().min(1).optional(),
  topic: z.string().optional(),
  title: z.string().min(1).optional(),
  status: z.nativeEnum(SessionStatus).optional()
});

export const messageSchema = z.object({
  content: z.string().min(1)
});

export const learningRecordSchema = z.object({
  concept: z.string().min(1),
  masteryLevel: z.nativeEnum(MasteryLevel)
});

export const oauthSchema = z.object({
  accessToken: z.string().min(1)
});

export const documentUploadSchema = z.object({
  type: z.nativeEnum(DocumentType),
  title: z.string().min(1).optional(),
  description: z.string().max(2000).optional()
});

export const documentListSchema = z.object({
  type: z.nativeEnum(DocumentType).optional(),
  status: z.nativeEnum(DocumentStatus).optional(),
  page: z.coerce.number().int().positive().default(1)
});

export const documentSearchSchema = z.object({
  query: z.string().min(1),
  topK: z.coerce.number().int().positive().max(20).default(5),
  chapterId: z.string().uuid().optional()
});

export const readingSessionCreateSchema = z.object({
  documentId: z.string().uuid(),
  chapterId: z.string().uuid().optional()
});

export const readingMessageSchema = z.object({
  content: z.string().min(1),
  level: z.nativeEnum(Level).optional(),
  context: z
    .object({
      selectedText: z.string().min(1).optional(),
      pageNumber: z.number().int().positive().optional()
    })
    .optional()
});

export const readingProgressSchema = z.object({
  chapterId: z.string().uuid(),
  progress: z.number().min(0).max(100)
});

export const preferenceUpdateSchema = z.object({
  level: z.nativeEnum(Level)
});

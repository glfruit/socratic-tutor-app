import { MasteryLevel, Role, SessionStatus } from '@prisma/client';
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

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type PrismaLike = Pick<
  PrismaClient,
  'user' | 'session' | 'message' | 'learningRecord' | 'subject' | '$transaction'
>;

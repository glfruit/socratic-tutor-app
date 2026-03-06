import { SessionStatus } from '@prisma/client';
import { PrismaLike } from '../config/prisma';
import { AppError } from '../utils/appError';

export class SessionService {
  constructor(private readonly prisma: PrismaLike) {}

  async createSession(userId: string, input: { subject: string; topic?: string; title: string }) {
    return this.prisma.session.create({
      data: {
        userId,
        subject: input.subject,
        topic: input.topic,
        title: input.title
      }
    });
  }

  async listSessions(userId: string) {
    return this.prisma.session.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) {
      throw new AppError('Session not found', 404);
    }
    return session;
  }

  async updateSession(
    userId: string,
    sessionId: string,
    input: { subject?: string; topic?: string; title?: string; status?: SessionStatus }
  ) {
    const result = await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: input
    });
    if (result.count === 0) {
      throw new AppError('Session not found', 404);
    }
    return this.getSession(userId, sessionId);
  }

  async deleteSession(userId: string, sessionId: string) {
    await this.getSession(userId, sessionId);
    await this.prisma.$transaction([
      this.prisma.message.deleteMany({ where: { sessionId } }),
      this.prisma.session.delete({ where: { id: sessionId } })
    ]);
  }
}

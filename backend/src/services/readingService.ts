import { BookMessageRole, Level, ReadingSessionStatus } from '@prisma/client';
import { PrismaLike } from '../config/prisma';
import { AppError } from '../utils/appError';
import { SocraticConversationService } from './socraticConversationService';

export class ReadingService {
  constructor(
    private readonly prisma: PrismaLike,
    private readonly socraticConversationService: SocraticConversationService
  ) {}

  async createSession(userId: string, input: { documentId: string; chapterId?: string }) {
    const document = await this.prisma.document.findFirst({
      where: { id: input.documentId, userId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    const chapterId = input.chapterId ?? document.chapters[0]?.id;

    return this.prisma.bookReadingSession.create({
      data: {
        userId,
        documentId: input.documentId,
        currentChapterId: chapterId
      },
      include: {
        document: true,
        currentChapter: true
      }
    });
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.bookReadingSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        document: true,
        currentChapter: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new AppError('Reading session not found', 404);
    }

    return session;
  }

  async streamMessage(
    userId: string,
    sessionId: string,
    input: {
      content: string;
      level?: Level;
      context?: {
        selectedText?: string;
        pageNumber?: number;
      };
    }
  ) {
    const session = await this.getSession(userId, sessionId);
    await this.prisma.bookMessage.create({
      data: {
        sessionId,
        role: BookMessageRole.USER,
        content: input.content,
        metadata: input.context
      }
    });

    const generator = this.socraticConversationService.generateQuestion(
      session.currentChapter?.content ?? '',
      session.messages.map((message) => ({
        role: message.role === BookMessageRole.USER ? 'user' : 'assistant',
        content: message.content
      })),
      input.level ?? Level.HIGH_SCHOOL,
      {
        style: 'reading',
        referencedText: input.context?.selectedText
      }
    );

    const self = this;

    async function* streamAndPersist() {
      let fullContent = '';

      for await (const chunk of generator) {
        fullContent += chunk;
        yield chunk;
      }

      await self.prisma.bookMessage.create({
        data: {
          sessionId,
          role: BookMessageRole.ASSISTANT,
          content: fullContent
        }
      });
    }

    return streamAndPersist();
  }

  async updateProgress(
    userId: string,
    sessionId: string,
    input: { chapterId: string; progress: number }
  ) {
    const result = await this.prisma.bookReadingSession.updateMany({
      where: { id: sessionId, userId },
      data: {
        currentChapterId: input.chapterId,
        progress: input.progress,
        status: input.progress >= 100 ? ReadingSessionStatus.COMPLETED : ReadingSessionStatus.ACTIVE
      }
    });

    if (result.count === 0) {
      throw new AppError('Reading session not found', 404);
    }

    return this.getSession(userId, sessionId);
  }
}

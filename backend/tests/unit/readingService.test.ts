import { BookMessageRole, Level, ReadingSessionStatus } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { ReadingService } from '../../src/services/readingService';
import { createPrismaMock } from '../mocks/factories';

describe('ReadingService', () => {
  it('creates a reading session from a ready document', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue({
      id: 'doc1',
      title: 'Book',
      chapters: [{ id: 'c1', title: 'Chapter 1', content: 'Body' }]
    });
    prisma.bookReadingSession.create.mockResolvedValue({ id: 'rs1', status: ReadingSessionStatus.ACTIVE });

    const service = new ReadingService(prisma as never, {
      generateQuestion: vi.fn()
    } as never);

    const session = await service.createSession('u1', { documentId: 'doc1' });

    expect(session.id).toBe('rs1');
    expect(prisma.bookReadingSession.create).toHaveBeenCalled();
  });

  it('streams a Socratic reply and stores the full assistant message', async () => {
    const prisma = createPrismaMock();
    prisma.bookReadingSession.findFirst.mockResolvedValue({
      id: 'rs1',
      userId: 'u1',
      document: { id: 'doc1', title: 'Book' },
      currentChapter: { id: 'c1', title: 'Chapter 1', content: 'content' },
      messages: []
    });
    prisma.bookMessage.create
      .mockResolvedValueOnce({ id: 'bm1', role: BookMessageRole.USER, content: 'Question' })
      .mockResolvedValueOnce({ id: 'bm2', role: BookMessageRole.ASSISTANT, content: 'Prompt?' });

    async function* gen() {
      yield 'Prompt';
      yield '?';
    }

    const socraticConversationService = {
      generateQuestion: vi.fn().mockReturnValue(gen())
    };

    const service = new ReadingService(prisma as never, socraticConversationService as never);
    const stream = await service.streamMessage('u1', 'rs1', {
      content: 'Question',
      level: Level.HIGH_SCHOOL
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['Prompt', '?']);
    expect(prisma.bookMessage.create).toHaveBeenCalledTimes(2);
  });

  it('updates progress and throws when the session is missing', async () => {
    const prisma = createPrismaMock();
    prisma.bookReadingSession.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    prisma.bookReadingSession.findFirst.mockResolvedValue({
      id: 'rs1',
      messages: [],
      document: { id: 'doc1' },
      currentChapter: { id: 'c2', content: 'body' }
    });

    const service = new ReadingService(prisma as never, {
      generateQuestion: vi.fn()
    } as never);

    const updated = await service.updateProgress('u1', 'rs1', {
      chapterId: 'c2',
      progress: 100
    });

    expect(updated.id).toBe('rs1');
    expect(prisma.bookReadingSession.updateMany).toHaveBeenCalledWith({
      where: { id: 'rs1', userId: 'u1' },
      data: {
        currentChapterId: 'c2',
        progress: 100,
        status: ReadingSessionStatus.COMPLETED
      }
    });

    await expect(
      service.updateProgress('u1', 'missing', {
        chapterId: 'c2',
        progress: 20
      })
    ).rejects.toThrow('Reading session not found');
  });

  it('throws when creating or fetching a missing session', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue(null);
    prisma.bookReadingSession.findFirst.mockResolvedValue(null);
    const service = new ReadingService(prisma as never, {
      generateQuestion: vi.fn()
    } as never);

    await expect(service.createSession('u1', { documentId: 'doc1' })).rejects.toThrow(
      'Document not found'
    );
    await expect(service.getSession('u1', 'rs1')).rejects.toThrow('Reading session not found');
  });
});

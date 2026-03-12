import { DocumentStatus, DocumentType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { DocumentService } from '../../src/services/documentService';
import { createPrismaMock } from '../mocks/factories';

describe('DocumentService', () => {
  it('creates a document record and persists the uploaded file', async () => {
    const prisma = createPrismaMock();
    prisma.document.create.mockResolvedValue({ id: 'doc1', status: DocumentStatus.PROCESSING });
    const queue = { enqueue: vi.fn().mockResolvedValue(undefined) };
    const service = new DocumentService(prisma as never, {
      storageRoot: '/tmp/uploads',
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined),
      queue
    });

    const document = await service.uploadDocument('u1', {
      file: {
        originalname: 'algebra.txt',
        mimetype: 'text/plain',
        size: 12,
        buffer: Buffer.from('hello world')
      },
      type: DocumentType.BOOK,
      title: 'Algebra'
    });

    expect(document.id).toBe('doc1');
    expect(prisma.document.create).toHaveBeenCalled();
    expect(queue.enqueue).toHaveBeenCalledWith({ documentId: 'doc1' });
  });

  it('creates a document without queueing when no processing queue is configured', async () => {
    const prisma = createPrismaMock();
    prisma.document.create.mockResolvedValue({ id: 'doc2', status: DocumentStatus.PROCESSING });
    const service = new DocumentService(prisma as never, {
      storageRoot: '/tmp/uploads',
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      unlink: vi.fn().mockResolvedValue(undefined)
    });

    const document = await service.uploadDocument('u1', {
      file: {
        originalname: 'geometry.pdf',
        mimetype: 'application/pdf',
        size: 24,
        buffer: Buffer.from('pdf')
      },
      type: DocumentType.MATERIAL
    });

    expect(document.id).toBe('doc2');
    expect(prisma.document.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'geometry'
        })
      })
    );
  });

  it('returns a user-scoped document with chapters', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue({ id: 'doc1', chapters: [{ id: 'c1' }] });
    const service = new DocumentService(prisma as never);

    const document = await service.getDocument('u1', 'doc1');

    expect(document.id).toBe('doc1');
  });

  it('deletes document storage and related records', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue({ id: 'doc1', storagePath: '/tmp/uploads/doc1.txt' });
    prisma.document.deleteMany.mockResolvedValue({ count: 1 });
    prisma.$transaction.mockResolvedValue([]);
    const unlink = vi.fn().mockResolvedValue(undefined);
    const service = new DocumentService(prisma as never, {
      storageRoot: '/tmp/uploads',
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      unlink,
      queue: { enqueue: vi.fn() }
    });

    await service.deleteDocument('u1', 'doc1');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(unlink).toHaveBeenCalledWith('/tmp/uploads/doc1.txt');
  });

  it('lists documents with pagination and filters', async () => {
    const prisma = createPrismaMock();
    prisma.document.findMany.mockResolvedValue([{ id: 'doc1' }]);
    prisma.document.count.mockResolvedValue(1);
    const service = new DocumentService(prisma as never);

    const result = await service.listDocuments('u1', {
      page: 2,
      type: DocumentType.MATERIAL,
      status: DocumentStatus.READY
    });

    expect(result.pagination).toEqual({ page: 2, pageSize: 20, total: 1 });
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20
      })
    );
  });

  it('lists documents without optional filters', async () => {
    const prisma = createPrismaMock();
    prisma.document.findMany.mockResolvedValue([]);
    prisma.document.count.mockResolvedValue(0);
    const service = new DocumentService(prisma as never);

    const result = await service.listDocuments('u1', { page: 1 });

    expect(result.pagination).toEqual({ page: 1, pageSize: 20, total: 0 });
    expect(prisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' }
      })
    );
  });

  it('throws when document lookup misses and supports processing helpers', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'doc2' });
    prisma.$queryRaw.mockResolvedValue([{ content: 'match' }]);
    const service = new DocumentService(prisma as never);

    await expect(service.getDocument('u1', 'missing')).rejects.toThrow('Document not found');
    await expect(service.getDocumentForProcessing('doc2')).resolves.toEqual({ id: 'doc2' });
    prisma.document.findFirst.mockResolvedValue({ id: 'doc2', chapters: [] });

    const results = await service.searchSimilar('u1', 'doc2', [0.1, 0.2], 3);

    expect(results).toEqual([{ content: 'match' }]);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });

  it('throws when processing document lookup misses', async () => {
    const prisma = createPrismaMock();
    prisma.document.findFirst.mockResolvedValue(null);
    const service = new DocumentService(prisma as never);

    await expect(service.getDocumentForProcessing('missing')).rejects.toThrow('Document not found');
  });

  it('updates processing result and writes embeddings through raw SQL', async () => {
    const prisma = createPrismaMock();
    prisma.$transaction.mockImplementation(async (callback: (tx: any) => Promise<void>) => {
      await callback(prisma);
    });
    prisma.chapter.deleteMany.mockResolvedValue({ count: 0 });
    prisma.documentChunk.deleteMany.mockResolvedValue({ count: 0 });
    prisma.chapter.createMany.mockResolvedValue({ count: 1 });
    prisma.documentChunk.createMany.mockResolvedValue({ count: 1 });
    prisma.$executeRawUnsafe.mockResolvedValue(1);
    prisma.document.update.mockResolvedValue({ id: 'doc1' });
    const service = new DocumentService(prisma as never);

    await service.updateProcessingResult('doc1', {
      status: DocumentStatus.READY,
      chapters: [
        { id: 'c1', title: 'Chapter 1', content: 'body', orderIndex: 0 }
      ],
      chunks: [
        {
          id: 'chunk1',
          chapterId: 'c1',
          content: 'body',
          orderIndex: 0,
          embedding: [0.1, 0.2]
        }
      ]
    });

    expect(prisma.chapter.createMany).toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).toHaveBeenCalled();
    expect(prisma.document.update).toHaveBeenCalled();
  });

  it('updates processing status without recreating chapters or chunks when parsing fails', async () => {
    const prisma = createPrismaMock();
    prisma.$transaction.mockImplementation(async (callback: (tx: any) => Promise<void>) => {
      await callback(prisma);
    });
    prisma.chapter.deleteMany.mockResolvedValue({ count: 0 });
    prisma.documentChunk.deleteMany.mockResolvedValue({ count: 0 });
    prisma.document.update.mockResolvedValue({ id: 'doc1', status: DocumentStatus.ERROR });
    const service = new DocumentService(prisma as never);

    await service.updateProcessingResult('doc1', {
      status: DocumentStatus.ERROR,
      errorMessage: 'parse failed'
    });

    expect(prisma.chapter.createMany).not.toHaveBeenCalled();
    expect(prisma.documentChunk.createMany).not.toHaveBeenCalled();
    expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    expect(prisma.document.update).toHaveBeenCalledWith({
      where: { id: 'doc1' },
      data: {
        status: DocumentStatus.ERROR,
        errorMessage: 'parse failed',
        processedAt: null
      }
    });
  });
});

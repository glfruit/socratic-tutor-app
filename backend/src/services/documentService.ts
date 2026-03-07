import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { env } from '../config/env';
import { PrismaLike } from '../config/prisma';
import { AppError } from '../utils/appError';

export interface UploadedDocumentFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface UploadQueueLike {
  enqueue: (job: { documentId: string }) => Promise<void>;
}

interface DocumentServiceDependencies {
  storageRoot?: string;
  mkdir?: typeof mkdir;
  writeFile?: typeof writeFile;
  unlink?: typeof unlink;
  queue?: UploadQueueLike;
}

export class DocumentService {
  private readonly storageRoot: string;

  private readonly fsMkdir: typeof mkdir;

  private readonly fsWriteFile: typeof writeFile;

  private readonly fsUnlink: typeof unlink;

  private readonly queue?: UploadQueueLike;

  constructor(
    private readonly prisma: PrismaLike,
    dependencies: DocumentServiceDependencies = {}
  ) {
    this.storageRoot = path.resolve(dependencies.storageRoot ?? env.FILE_STORAGE_PATH);
    this.fsMkdir = dependencies.mkdir ?? mkdir;
    this.fsWriteFile = dependencies.writeFile ?? writeFile;
    this.fsUnlink = dependencies.unlink ?? unlink;
    this.queue = dependencies.queue;
  }

  async uploadDocument(
    userId: string,
    input: {
      file: UploadedDocumentFile;
      type: DocumentType;
      title?: string;
      description?: string;
    }
  ) {
    const documentId = randomUUID();
    const extension = path.extname(input.file.originalname).toLowerCase();
    const storagePath = path.join(this.storageRoot, `${documentId}${extension}`);

    await this.fsMkdir(this.storageRoot, { recursive: true });
    await this.fsWriteFile(storagePath, input.file.buffer);

    const document = await this.prisma.document.create({
      data: {
        id: documentId,
        userId,
        type: input.type,
        status: DocumentStatus.PROCESSING,
        title: input.title ?? path.basename(input.file.originalname, extension),
        description: input.description,
        originalName: input.file.originalname,
        storagePath,
        mimeType: input.file.mimetype,
        fileSize: input.file.size
      }
    });

    if (this.queue) {
      await this.queue.enqueue({ documentId: document.id });
    }

    return document;
  }

  async listDocuments(
    userId: string,
    filters: { type?: DocumentType; status?: DocumentStatus; page: number }
  ) {
    const pageSize = 20;
    const where = {
      userId,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {})
    };
    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * pageSize,
        take: pageSize
      }),
      this.prisma.document.count({
        where
      })
    ]);

    return {
      items,
      pagination: {
        page: filters.page,
        pageSize,
        total
      }
    };
  }

  async getDocument(userId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
      include: {
        chapters: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    return document;
  }

  async getDocumentForProcessing(documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId }
    });

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    return document;
  }

  async deleteDocument(userId: string, documentId: string) {
    const document = await this.getDocument(userId, documentId);

    await this.prisma.$transaction([
      this.prisma.bookMessage.deleteMany({
        where: { session: { documentId: document.id } }
      }),
      this.prisma.bookReadingSession.deleteMany({
        where: { documentId: document.id }
      }),
      this.prisma.documentChunk.deleteMany({
        where: { documentId: document.id }
      }),
      this.prisma.chapter.deleteMany({
        where: { documentId: document.id }
      }),
      this.prisma.document.deleteMany({
        where: { id: document.id, userId }
      })
    ]);

    await this.fsUnlink(document.storagePath);
  }

  async updateProcessingResult(
    documentId: string,
    input: {
      status: DocumentStatus;
      errorMessage?: string;
      chapters?: Array<{
        id: string;
        title: string;
        content: string;
        orderIndex: number;
        startPage?: number;
        endPage?: number;
      }>;
      chunks?: Array<{
        id: string;
        chapterId?: string;
        content: string;
        orderIndex: number;
        tokenCount?: number;
        metadata?: Record<string, unknown>;
        embedding?: number[];
      }>;
    }
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.chapter.deleteMany({ where: { documentId } });
      await tx.documentChunk.deleteMany({ where: { documentId } });

      if (input.chapters && input.chapters.length > 0) {
        await tx.chapter.createMany({
          data: input.chapters.map((chapter) => ({
            id: chapter.id,
            documentId,
            title: chapter.title,
            content: chapter.content,
            orderIndex: chapter.orderIndex,
            startPage: chapter.startPage,
            endPage: chapter.endPage
          }))
        });
      }

      if (input.chunks && input.chunks.length > 0) {
        await tx.documentChunk.createMany({
          data: input.chunks.map((chunk) => ({
            id: chunk.id,
            documentId,
            chapterId: chunk.chapterId,
            content: chunk.content,
            orderIndex: chunk.orderIndex,
            tokenCount: chunk.tokenCount,
            metadata: chunk.metadata
          }))
        });

        for (const chunk of input.chunks) {
          if (chunk.embedding && chunk.embedding.length > 0) {
            await tx.$executeRawUnsafe(
              'UPDATE "DocumentChunk" SET "embedding" = $1::vector WHERE "id" = $2',
              `[${chunk.embedding.join(',')}]`,
              chunk.id
            );
          }
        }
      }

      await tx.document.update({
        where: { id: documentId },
        data: {
          status: input.status,
          errorMessage: input.errorMessage,
          processedAt: input.status === DocumentStatus.READY ? new Date() : null
        }
      });
    });
  }

  async searchSimilar(
    userId: string,
    documentId: string,
    embedding: number[],
    topK: number,
    chapterId?: string
  ) {
    await this.getDocument(userId, documentId);
    const vector = `[${embedding.join(',')}]`;

    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT dc.content,
             dc."chapterId",
             c.title AS "chapterTitle",
             1 - (dc.embedding <=> ${vector}::vector) AS score,
             dc.metadata
      FROM "DocumentChunk" dc
      LEFT JOIN "Chapter" c ON c.id = dc."chapterId"
      WHERE dc."documentId" = ${documentId}
        AND (${chapterId ?? null}::text IS NULL OR dc."chapterId" = ${chapterId ?? null})
      ORDER BY dc.embedding <=> ${vector}::vector
      LIMIT ${topK}
    `;

    return rows;
  }
}

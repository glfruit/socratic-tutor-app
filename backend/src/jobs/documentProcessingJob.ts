import { randomUUID } from 'node:crypto';
import { Queue, Worker } from 'bullmq';
import { DocumentStatus } from '@prisma/client';
import { PrismaLike } from '../config/prisma';
import { DocumentService } from '../services/documentService';
import { EmbeddingService } from '../services/embeddingService';
import { ParsingService } from '../services/parsingService';

interface DocumentProcessingPayload {
  documentId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisConnection = any;

export class DocumentProcessingJob {
  private readonly queue: Queue<DocumentProcessingPayload>;

  constructor(
    connection: RedisConnection,
    private readonly prisma: PrismaLike,
    private readonly documentService: DocumentService,
    private readonly parsingService: ParsingService,
    private readonly embeddingService: EmbeddingService
  ) {
    this.queue = new Queue<DocumentProcessingPayload>('document-processing', {
      connection
    });
  }

  async enqueue(payload: DocumentProcessingPayload) {
    await this.queue.add('parse-document', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 100
    });
  }

  createWorker(connection: RedisConnection) {
    return new Worker<DocumentProcessingPayload>(
      'document-processing',
      async (job) => {
        await this.process(job.data.documentId);
      },
      {
        connection
      }
    );
  }

  private async process(documentId: string) {
    try {
      const document = await this.documentService.getDocumentForProcessing(documentId);
      const parsed = await this.parsingService.parseFile(document.storagePath, document.originalName);

      const chapters = parsed.chapters.map((chapter) => ({
        id: randomUUID(),
        title: chapter.title,
        content: chapter.content,
        orderIndex: chapter.orderIndex,
        startPage: chapter.startPage,
        endPage: chapter.endPage
      }));

      const chunkInputs = chapters.flatMap((chapter) =>
        this.parsingService.chunkText(chapter.content).map((chunk, index) => ({
          id: randomUUID(),
          chapterId: chapter.id,
          content: chunk.content,
          orderIndex: index,
          tokenCount: chunk.tokenCount,
          metadata: {}
        }))
      );

      const embeddings = await this.embeddingService.generateBatch(
        chunkInputs.map((chunk) => chunk.content)
      );

      await this.documentService.updateProcessingResult(documentId, {
        status: DocumentStatus.READY,
        chapters,
        chunks: chunkInputs.map((chunk, index) => ({
          ...chunk,
          embedding: embeddings[index]
        }))
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown processing error';
      await this.documentService.updateProcessingResult(documentId, {
        status: DocumentStatus.ERROR,
        errorMessage: message
      });
      throw error;
    }
  }
}

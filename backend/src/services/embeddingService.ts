import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

interface EmbeddingClientLike {
  embeddings: {
    create: (input: { input: string | string[]; model: string }) => Promise<{
      data: Array<{ embedding: number[] }>;
    }>;
  };
}

interface EmbeddingServiceOptions {
  client?: EmbeddingClientLike;
  model?: string;
  batchSize?: number;
}

export class EmbeddingService {
  private client: EmbeddingClientLike | null = null;

  private readonly options: EmbeddingServiceOptions;

  private readonly batchSize: number;

  constructor(options: EmbeddingServiceOptions = {}) {
    this.options = options;
    this.batchSize = options.batchSize ?? 10;
  }

  private getClient(): EmbeddingClientLike {
    if (this.options.client) {
      return this.options.client;
    }
    if (this.client) {
      return this.client;
    }
    const apiKey = env.DEEPSEEK_API_KEY ?? env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AppError('Embedding service not configured: set DEEPSEEK_API_KEY or OPENAI_API_KEY', 503);
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined
    });
    return this.client;
  }

  private getModel(): string {
    return this.options.model ?? env.DEEPSEEK_EMBEDDING_MODEL;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.getClient().embeddings.create({
      input: text,
      model: this.getModel()
    });

    return response.data[0]?.embedding ?? [];
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    const batches: number[][] = [];

    for (let index = 0; index < texts.length; index += this.batchSize) {
      const input = texts.slice(index, index + this.batchSize);
      const response = await this.getClient().embeddings.create({
        input,
        model: this.getModel()
      });
      batches.push(...response.data.map((item) => item.embedding));
    }

    return batches;
  }
}

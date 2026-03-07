import OpenAI from 'openai';
import { env } from '../config/env';

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
  private readonly client: EmbeddingClientLike;

  private readonly model: string;

  private readonly batchSize: number;

  constructor(options: EmbeddingServiceOptions = {}) {
    this.client =
      options.client ??
      new OpenAI({
        apiKey: env.DEEPSEEK_API_KEY ?? env.OPENAI_API_KEY,
        baseURL: env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined
      });
    this.model = options.model ?? env.DEEPSEEK_EMBEDDING_MODEL;
    this.batchSize = options.batchSize ?? 10;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      input: text,
      model: this.model
    });

    return response.data[0]?.embedding ?? [];
  }

  async generateBatch(texts: string[]): Promise<number[][]> {
    const batches: number[][] = [];

    for (let index = 0; index < texts.length; index += this.batchSize) {
      const input = texts.slice(index, index + this.batchSize);
      const response = await this.client.embeddings.create({
        input,
        model: this.model
      });
      batches.push(...response.data.map((item) => item.embedding));
    }

    return batches;
  }
}

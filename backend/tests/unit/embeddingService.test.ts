import { describe, expect, it, vi } from 'vitest';
import { EmbeddingService } from '../../src/services/embeddingService';

describe('EmbeddingService', () => {
  it('generates a single embedding from the client response', async () => {
    const create = vi.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] });
    const service = new EmbeddingService({
      client: {
        embeddings: {
          create
        }
      } as never,
      model: 'embedding-test'
    });

    const embedding = await service.generateEmbedding('hello');

    expect(embedding).toEqual([0.1, 0.2, 0.3]);
    expect(create).toHaveBeenCalledWith({ input: 'hello', model: 'embedding-test' });
  });

  it('generates embeddings in batches', async () => {
    const create = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ embedding: [1] }, { embedding: [2] }] })
      .mockResolvedValueOnce({ data: [{ embedding: [3] }] });
    const service = new EmbeddingService({
      client: {
        embeddings: {
          create
        }
      } as never,
      model: 'embedding-test',
      batchSize: 2
    });

    const embeddings = await service.generateBatch(['a', 'b', 'c']);

    expect(embeddings).toEqual([[1], [2], [3]]);
    expect(create).toHaveBeenCalledTimes(2);
  });
});

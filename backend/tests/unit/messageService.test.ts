import { MessageRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { MessageService } from '../../src/services/messageService';
import { createPrismaMock } from '../mocks/factories';

describe('MessageService', () => {
  it('sends a message and stores AI response', async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue({ id: 's1', subject: 'math', topic: 'algebra' });
    prisma.message.create
      .mockResolvedValueOnce({ id: 'm1', role: MessageRole.USER })
      .mockResolvedValueOnce({ id: 'm2', role: MessageRole.ASSISTANT, content: 'reply' });

    const aiService = { generateResponse: vi.fn().mockResolvedValue('reply') };
    const contextService = {
      appendMessage: vi.fn(),
      getContext: vi.fn().mockResolvedValue([{ role: 'user', content: 'hello' }])
    };

    const service = new MessageService(prisma as any, aiService as any, contextService as any);

    const result = await service.sendMessage('u1', 's1', 'hello');

    expect(result.assistant.content).toBe('reply');
    expect(contextService.appendMessage).toHaveBeenCalledTimes(2);
  });

  it('throws when session does not belong to user', async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue(null);
    const service = new MessageService(prisma as any, {} as any, {} as any);

    await expect(service.sendMessage('u1', 's1', 'hello')).rejects.toThrow('Session not found');
  });

  it('returns stream generator', async () => {
    const prisma = createPrismaMock();
    prisma.session.findFirst.mockResolvedValue({ id: 's1', subject: 'math' });
    prisma.message.create.mockResolvedValue({ id: 'm1' });

    async function* gen() {
      yield 'a';
    }

    const aiService = { streamResponse: vi.fn().mockReturnValue(gen()) };
    const contextService = { getContext: vi.fn().mockResolvedValue([]) };
    const service = new MessageService(prisma as any, aiService as any, contextService as any);

    const stream = await service.streamMessage('u1', 's1', 'hi');
    const chunks: string[] = [];
    for await (const c of stream) {
      chunks.push(c);
    }

    expect(chunks).toEqual(['a']);
  });
});

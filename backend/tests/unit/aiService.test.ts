import { describe, expect, it, vi } from 'vitest';
import { AIService } from '../../src/services/aiService';

describe('AIService', () => {
  it('generates response using client', async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'reply' } }]
    });

    const service = new AIService({
      chat: { completions: { create } }
    } as any);

    const text = await service.generateResponse({
      subject: 'math',
      conversationHistory: [],
      userInput: 'x?'
    });

    expect(text).toBe('reply');
    expect(create).toHaveBeenCalled();
  });

  it('streams characters', async () => {
    const service = new AIService({
      chat: { completions: { create: vi.fn().mockResolvedValue({ choices: [{ message: { content: 'ab' } }] }) } }
    } as any);

    const out: string[] = [];
    for await (const ch of service.streamResponse({
      subject: 'math',
      conversationHistory: [],
      userInput: 'x'
    })) {
      out.push(ch);
    }

    expect(out).toEqual(['a', 'b']);
  });
});

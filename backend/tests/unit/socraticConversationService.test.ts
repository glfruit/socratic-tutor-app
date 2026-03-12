import { Level } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { SocraticConversationService } from '../../src/services/socraticConversationService';

describe('SocraticConversationService', () => {
  it('streams response chunks from the chat client', async () => {
    async function* stream() {
      yield { choices: [{ delta: { content: 'What' } }] };
      yield { choices: [{ delta: { content: ' if?' } }] };
    }

    const create = vi.fn().mockResolvedValue(stream());
    const service = new SocraticConversationService({
      client: {
        chat: {
          completions: {
            create
          }
        }
      } as never,
      model: 'deepseek-chat'
    });

    const chunks: string[] = [];
    for await (const chunk of service.generateQuestion(
      'Chapter context',
      [{ role: 'user', content: 'Explain gravity' }],
      Level.HIGH_SCHOOL,
      { style: 'reading', referencedText: 'Newton' }
    )) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(['What', ' if?']);
    expect(create).toHaveBeenCalledOnce();
  });

  it('builds a level-aware prompt', () => {
    const service = new SocraticConversationService({
      client: {
        chat: {
          completions: {
            create: vi.fn()
          }
        }
      } as never,
      model: 'deepseek-chat'
    });

    const prompt = service.buildSystemPrompt(Level.MIDDLE_SCHOOL, 'study');

    expect(prompt).toContain('强调关键术语辨析');
    expect(prompt).toContain('模式：学科学习');
  });
});

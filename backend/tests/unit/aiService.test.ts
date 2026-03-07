import { afterEach, describe, expect, it, vi } from 'vitest';

const createOpenAIMock = () => {
  const create = vi.fn();
  const OpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create
      }
    }
  }));

  return { OpenAI, create };
};

describe('AIService', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unmock('openai');
    vi.unmock('../../src/config/env');
  });

  it('uses DeepSeek configuration and returns a fallback response when content is empty', async () => {
    const { OpenAI, create } = createOpenAIMock();
    create.mockResolvedValue({ choices: [] });
    vi.doMock('openai', () => ({ default: OpenAI }));
    vi.doMock('../../src/config/env', () => ({
      env: {
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_API_KEY: 'deepseek-key',
        DEEPSEEK_MODEL: 'deepseek-chat',
        OPENAI_API_KEY: undefined,
        OPENAI_MODEL: 'gpt-4o-mini'
      }
    }));

    const { AIService } = await import('../../src/services/aiService');
    const service = new AIService();
    const response = await service.generateResponse({
      subject: 'math',
      topic: 'algebra',
      conversationHistory: [{ role: 'user', content: 'hello' }],
      userInput: 'help me'
    });

    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: 'deepseek-key',
      baseURL: 'https://api.deepseek.com/v1'
    });
    expect(response).toContain('一步步推理');
    expect(create).toHaveBeenCalledOnce();
  });

  it('streams content with OpenAI configuration', async () => {
    async function* stream() {
      yield { choices: [{ delta: { content: 'A' } }] };
      yield { choices: [{ delta: { content: 'B' } }] };
    }

    const { OpenAI, create } = createOpenAIMock();
    create.mockResolvedValue(stream());
    vi.doMock('openai', () => ({ default: OpenAI }));
    vi.doMock('../../src/config/env', () => ({
      env: {
        AI_PROVIDER: 'openai',
        DEEPSEEK_API_KEY: undefined,
        DEEPSEEK_MODEL: 'deepseek-chat',
        OPENAI_API_KEY: 'openai-key',
        OPENAI_MODEL: 'gpt-4o-mini'
      }
    }));

    const { AIService } = await import('../../src/services/aiService');
    const service = new AIService();
    const chunks: string[] = [];

    for await (const chunk of service.streamResponse({
      subject: 'physics',
      conversationHistory: [],
      userInput: 'question'
    })) {
      chunks.push(chunk);
    }

    expect(OpenAI).toHaveBeenCalledWith({
      apiKey: 'openai-key'
    });
    expect(chunks).toEqual(['A', 'B']);
  });

  it('throws when no AI credentials are configured and exposes the Socratic prompt template', async () => {
    const { OpenAI } = createOpenAIMock();
    vi.doMock('openai', () => ({ default: OpenAI }));
    vi.doMock('../../src/config/env', () => ({
      env: {
        AI_PROVIDER: 'deepseek',
        DEEPSEEK_API_KEY: undefined,
        DEEPSEEK_MODEL: 'deepseek-chat',
        OPENAI_API_KEY: undefined,
        OPENAI_MODEL: 'gpt-4o-mini'
      }
    }));

    const { AIService } = await import('../../src/services/aiService');

    expect(() => new AIService()).toThrow('请设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY');
    expect(AIService.prototype.buildSocraticSystemPrompt.call({}, 'history', 'rome')).toContain(
      '学科：history'
    );
  });
});

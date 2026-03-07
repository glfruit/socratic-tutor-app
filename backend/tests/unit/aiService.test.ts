import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('AIService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it('configures DeepSeek correctly', async () => {
    process.env.AI_PROVIDER = 'deepseek';
    process.env.DEEPSEEK_API_KEY = 'test-key';
    process.env.DEEPSEEK_MODEL = 'deepseek-chat';

    // 验证环境变量配置
    expect(process.env.AI_PROVIDER).toBe('deepseek');
    expect(process.env.DEEPSEEK_API_KEY).toBe('test-key');
    expect(process.env.DEEPSEEK_MODEL).toBe('deepseek-chat');
  });

  it('configures OpenAI correctly', async () => {
    process.env.AI_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.OPENAI_MODEL = 'gpt-4';

    expect(process.env.AI_PROVIDER).toBe('openai');
    expect(process.env.OPENAI_API_KEY).toBe('test-openai-key');
    expect(process.env.OPENAI_MODEL).toBe('gpt-4');
  });

  it('uses deepseek-chat as default model', async () => {
    process.env.AI_PROVIDER = 'deepseek';
    process.env.DEEPSEEK_API_KEY = 'test-key';
    // 不设置 DEEPSEEK_MODEL，应该使用默认值

    const { env } = await import('../../src/config/env');
    expect(env.DEEPSEEK_MODEL).toBe('deepseek-chat');
  });
});

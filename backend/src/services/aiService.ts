import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

export interface SocraticPrompt {
  subject: string;
  topic?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userInput: string;
}

export class AIService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    if (env.AI_PROVIDER === 'deepseek' && env.DEEPSEEK_API_KEY) {
      this.client = new OpenAI({
        apiKey: env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1'
      });
      return this.client;
    }

    if (env.OPENAI_API_KEY) {
      this.client = new OpenAI({
        apiKey: env.OPENAI_API_KEY
      });
      return this.client;
    }

    console.error('[AIService] No AI API key configured', {
      provider: env.AI_PROVIDER,
      hasDeepSeekKey: Boolean(env.DEEPSEEK_API_KEY),
      hasOpenAIKey: Boolean(env.OPENAI_API_KEY)
    });
    throw new AppError('AI 服务未配置，请设置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY。', 503);
  }

  async generateResponse(prompt: SocraticPrompt): Promise<string> {
    const model = env.AI_PROVIDER === 'deepseek' 
      ? env.DEEPSEEK_MODEL 
      : env.OPENAI_MODEL;

    try {
      console.info('[AIService] Generating response', {
        provider: env.AI_PROVIDER,
        model,
        subject: prompt.subject,
        hasTopic: Boolean(prompt.topic),
        historyLength: prompt.conversationHistory.length
      });

      const response = await this.getClient().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: this.buildSocraticSystemPrompt(prompt.subject, prompt.topic) },
          ...prompt.conversationHistory.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt.userInput }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        console.error('[AIService] Empty response from provider', {
          provider: env.AI_PROVIDER,
          model
        });
        throw new AppError('AI 服务返回了空响应，请稍后重试。', 502);
      }

      return content;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('[AIService] Failed to generate response', {
        provider: env.AI_PROVIDER,
        model,
        error
      });
      throw new AppError('AI 对话生成失败，请检查 API Key 和模型配置。', 502);
    }
  }

  async *streamResponse(prompt: SocraticPrompt): AsyncGenerator<string> {
    const model = env.AI_PROVIDER === 'deepseek' 
      ? env.DEEPSEEK_MODEL 
      : env.OPENAI_MODEL;

    try {
      const stream = await this.getClient().chat.completions.create({
        model,
        messages: [
          { role: 'system', content: this.buildSocraticSystemPrompt(prompt.subject, prompt.topic) },
          ...prompt.conversationHistory.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt.userInput }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('[AIService] Failed to stream response', {
        provider: env.AI_PROVIDER,
        model,
        error
      });
      throw new AppError('AI 流式对话失败，请检查 API Key 和模型配置。', 502);
    }
  }

  buildSocraticSystemPrompt(subject: string, topic?: string): string {
    return `你是苏格拉底式导师，擅长通过提问引导学生独立思考。

学科：${subject}
主题：${topic ?? '通用'}

核心原则：
1. 永远不要直接给出答案，而是通过提问引导学生自己发现
2. 使用苏格拉底提问法：澄清概念、质疑假设、追问原因、举例验证
3. 每次回复至少包含 2-3 个引导性问题
4. 当学生明确要求答案时，委婉拒绝并提供思考方向
5. 适时给予鼓励和肯定，保持学习动力
6. 使用中文回复，语言简洁明了

回复风格：
- 以提问为主，陈述为辅
- 问题要具体、有针对性
- 引导学生一步步接近答案
- 语气友好、耐心、鼓励性`;
  }
}

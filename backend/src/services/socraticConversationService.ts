import { Level } from '@prisma/client';
import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChatClientLike = any;

interface ConversationOptions {
  client?: ChatClientLike;
  model?: string;
}

interface ConversationHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateQuestionOptions {
  referencedText?: string;
  style: 'reading' | 'study';
}

export class SocraticConversationService {
  private client: ChatClientLike | null = null;

  private readonly options: ConversationOptions;

  constructor(options: ConversationOptions = {}) {
    this.options = options;
  }

  private getClient(): ChatClientLike {
    if (this.options.client) {
      return this.options.client;
    }
    if (this.client) {
      return this.client;
    }
    const apiKey = env.DEEPSEEK_API_KEY ?? env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AppError('AI service not configured: set DEEPSEEK_API_KEY or OPENAI_API_KEY', 503);
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined
    });
    return this.client;
  }

  private getModel(): string {
    return this.options.model ?? env.DEEPSEEK_MODEL;
  }

  async *generateQuestion(
    context: string,
    history: ConversationHistoryItem[],
    level: Level,
    options: GenerateQuestionOptions
  ): AsyncGenerator<string> {
    const stream = await this.getClient().chat.completions.create({
      model: this.getModel(),
      stream: true,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(level, options.style)
        },
        {
          role: 'system',
          content: `Context:\n${context}`
        },
        ...(options.referencedText
          ? [
              {
                role: 'system' as const,
                content: `Referenced text:\n${options.referencedText}`
              }
            ]
          : []),
        ...history.map((item) => ({
          role: item.role,
          content: item.content
        }))
      ]
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  buildSystemPrompt(level: Level, style: 'reading' | 'study'): string {
    const levelPrompts: Record<Level, string> = {
      ELEMENTARY: '用简单语言，大量比喻和例子，帮助建立基础概念。',
      MIDDLE_SCHOOL: '强调关键术语辨析，解释现象背后的原理。',
      HIGH_SCHOOL: '平衡抽象推理、结构分析和知识迁移。',
      UNIVERSITY: '追问论证强度、假设边界与方法论反思。',
      GRADUATE: '鼓励批判性思考、反例构造和跨领域比较。'
    };

    return [
      `你是苏格拉底式导师，擅长通过提问引导学生独立思考。`,
      `学习层级：${levelPrompts[level] || levelPrompts.HIGH_SCHOOL}`,
      `模式：${style === 'reading' ? '阅读理解' : '学科学习'}`,
      '',
      '核心原则：',
      '1. 永远不直接给答案，而是通过提问引导学生自己发现',
      '2. 使用苏格拉底提问法：澄清概念、质疑假设、追问原因',
      '3. 每次回复包含 1-2 个引导性问题',
      '4. 当学生明确要答案时，拒绝并提供思考方向',
      '5. 适时鼓励，保持学习动力',
      '6. 使用中文回复，语言简洁明了'
    ].join('\n');
  }
}

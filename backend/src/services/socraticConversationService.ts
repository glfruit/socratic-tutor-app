import { Level } from '@prisma/client';
import OpenAI from 'openai';
import { env } from '../config/env';

interface ChatClientLike {
  chat: {
    completions: {
      create: (input: Record<string, unknown>) => Promise<AsyncIterable<{
        choices: Array<{ delta?: { content?: string } }>;
      }>>;
    };
  };
}

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
  private readonly client: ChatClientLike;

  private readonly model: string;

  constructor(options: ConversationOptions = {}) {
    this.client =
      options.client ??
      new OpenAI({
        apiKey: env.DEEPSEEK_API_KEY ?? env.OPENAI_API_KEY,
        baseURL: env.DEEPSEEK_API_KEY ? 'https://api.deepseek.com/v1' : undefined
      });
    this.model = options.model ?? env.DEEPSEEK_MODEL;
  }

  async *generateQuestion(
    context: string,
    history: ConversationHistoryItem[],
    level: Level,
    options: GenerateQuestionOptions
  ): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
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
    return [
      'You are a Socratic tutor.',
      `Mode: ${style}.`,
      `Learner level: ${level}.`,
      'Ask concise, progressive questions instead of giving direct answers.',
      'Ground every question in the provided document context.',
      'If the student asks for the answer directly, redirect with one small hint.'
    ].join(' ');
  }
}

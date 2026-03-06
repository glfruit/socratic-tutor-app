import OpenAI from 'openai';
import { env } from '../config/env';

export interface SocraticPrompt {
  subject: string;
  topic?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userInput: string;
}

export class AIService {
  constructor(private readonly client?: Pick<OpenAI, 'chat'>) {}

  async generateResponse(prompt: SocraticPrompt): Promise<string> {
    const openai = this.client ?? new OpenAI({ apiKey: env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: this.buildSocraticSystemPrompt(prompt.subject, prompt.topic) },
        ...prompt.conversationHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt.userInput }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content ?? '让我们继续一步步推理。你会先从哪里开始？';
  }

  async *streamResponse(prompt: SocraticPrompt): AsyncGenerator<string> {
    const text = await this.generateResponse(prompt);
    for (const token of text.split('')) {
      yield token;
    }
  }

  buildSocraticSystemPrompt(subject: string, topic?: string): string {
    return `你是苏格拉底式导师。学科:${subject};主题:${topic ?? '通用'}。原则:多提问、少给答案、引导推理。`;
  }
}

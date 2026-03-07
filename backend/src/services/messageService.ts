import { MessageRole } from '@prisma/client';
import { PrismaLike } from '../config/prisma';
import { AppError } from '../utils/appError';
import { AIService } from './aiService';
import { ContextService } from './contextService';

export class MessageService {
  constructor(
    private readonly prisma: PrismaLike,
    private readonly aiService: AIService,
    private readonly contextService: ContextService
  ) {}

  async sendMessage(userId: string, sessionId: string, content: string) {
    console.info('[MessageService] sendMessage called', {
      userId,
      sessionId,
      contentLength: content.length
    });

    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const userMsg = await this.prisma.message.create({
      data: { sessionId, role: MessageRole.USER, content }
    });
    await this.contextService.appendMessage(sessionId, { role: 'user', content });

    const history = await this.contextService.getContext(sessionId);
    const aiText = await this.aiService.generateResponse({
      subject: session.subject,
      topic: session.topic ?? undefined,
      conversationHistory: history,
      userInput: content
    });

    console.info('[MessageService] AI response generated', {
      sessionId,
      responseLength: aiText.length
    });

    const assistantMsg = await this.prisma.message.create({
      data: {
        sessionId,
        role: MessageRole.ASSISTANT,
        content: aiText
      }
    });

    await this.contextService.appendMessage(sessionId, { role: 'assistant', content: aiText });

    return { user: userMsg, assistant: assistantMsg };
  }

  async streamMessage(userId: string, sessionId: string, content: string): Promise<AsyncGenerator<string>> {
    console.info('[MessageService] streamMessage called', {
      userId,
      sessionId,
      contentLength: content.length
    });

    const session = await this.prisma.session.findFirst({ where: { id: sessionId, userId } });
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await this.prisma.message.create({
      data: { sessionId, role: MessageRole.USER, content }
    });

    const history = await this.contextService.getContext(sessionId);
    const stream = this.aiService.streamResponse({
      subject: session.subject,
      topic: session.topic ?? undefined,
      conversationHistory: history,
      userInput: content
    });

    return stream;
  }
}

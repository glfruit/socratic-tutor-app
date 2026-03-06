import { prisma } from './prisma';
import { redis } from './redis';
import { AuthService } from '../services/authService';
import { OAuthService } from '../services/oauthService';
import { SessionService } from '../services/sessionService';
import { ContextService } from '../services/contextService';
import { AIService } from '../services/aiService';
import { MessageService } from '../services/messageService';
import { ProgressService } from '../services/progressService';
import { SubjectService } from '../services/subjectService';

const contextService = new ContextService(redis);
const aiService = new AIService();

export const container = {
  authService: new AuthService(prisma, redis),
  oauthService: OAuthService.createDefault(),
  sessionService: new SessionService(prisma),
  messageService: new MessageService(prisma, aiService, contextService),
  progressService: new ProgressService(prisma),
  subjectService: new SubjectService(prisma),
  redis
};

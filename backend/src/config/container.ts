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
import { ParsingService } from '../services/parsingService';
import { EmbeddingService } from '../services/embeddingService';
import { DocumentService } from '../services/documentService';
import { SocraticConversationService } from '../services/socraticConversationService';
import { ReadingService } from '../services/readingService';
import { PreferenceService } from '../services/preferenceService';
import { DocumentProcessingJob } from '../jobs/documentProcessingJob';

const contextService = new ContextService(redis);
const aiService = new AIService();
const parsingService = new ParsingService();
const embeddingService = new EmbeddingService();
const socraticConversationService = new SocraticConversationService();
const documentService = new DocumentService(prisma);
const documentProcessingJob = new DocumentProcessingJob(
  redis,
  prisma,
  documentService,
  parsingService,
  embeddingService
);
const queuedDocumentService = new DocumentService(prisma, {
  queue: documentProcessingJob
});

export const container = {
  authService: new AuthService(prisma, redis),
  oauthService: OAuthService.createDefault(),
  sessionService: new SessionService(prisma),
  messageService: new MessageService(prisma, aiService, contextService),
  progressService: new ProgressService(prisma),
  subjectService: new SubjectService(prisma),
  documentService: queuedDocumentService,
  parsingService,
  embeddingService,
  socraticConversationService,
  readingService: new ReadingService(prisma, socraticConversationService),
  preferenceService: new PreferenceService(prisma),
  documentProcessingJob,
  redis
};

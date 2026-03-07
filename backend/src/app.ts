import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import progressRoutes from './routes/progressRoutes';
import subjectRoutes from './routes/subjectRoutes';
import documentRoutes from './routes/documentRoutes';
import readingRoutes from './routes/readingRoutes';
import preferenceRoutes from './routes/preferenceRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import { container } from './config/container';
import { rateLimitMiddleware } from './middleware/rateLimitMiddleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRoutes);

  app.use(authMiddleware());
  app.use(rateLimitMiddleware(container.redis, { limit: 60, windowSeconds: 60 }));

  app.use('/api/v1/sessions', sessionRoutes);
  app.use('/api/v1/progress', progressRoutes);
  app.use('/api/v1/subjects', subjectRoutes);
  app.use('/api/v2/documents', documentRoutes);
  app.use('/api/v2/reading-sessions', readingRoutes);
  app.use('/api/v2/preferences', preferenceRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

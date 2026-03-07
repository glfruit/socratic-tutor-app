import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { redis } from './config/redis';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on :${env.PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  await redis.quit();
  server.close();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

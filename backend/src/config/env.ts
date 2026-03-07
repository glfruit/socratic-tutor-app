import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_MODEL: z.string().default('deepseek-chat'),
  DEEPSEEK_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  AI_PROVIDER: z.enum(['openai', 'deepseek']).default('deepseek'),
  FILE_STORAGE_PATH: z.string().default('uploads'),
  CORS_ORIGIN: z.string().default('http://localhost:3000')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid env: ${parsed.error.message}`);
}

export const env = parsed.data;

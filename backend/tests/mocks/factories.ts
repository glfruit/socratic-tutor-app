import { vi } from 'vitest';

export const createPrismaMock = () => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  session: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn()
  },
  message: {
    create: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn()
  },
  learningRecord: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    deleteMany: vi.fn()
  },
  subject: {
    findMany: vi.fn()
  },
  document: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn()
  },
  chapter: {
    createMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn()
  },
  documentChunk: {
    createMany: vi.fn(),
    deleteMany: vi.fn()
  },
  bookReadingSession: {
    create: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn()
  },
  bookMessage: {
    create: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn()
  },
  userPreference: {
    findUnique: vi.fn(),
    upsert: vi.fn()
  },
  learningPlan: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  $queryRaw: vi.fn(),
  $executeRawUnsafe: vi.fn(),
  $transaction: vi.fn()
});

export const createRedisMock = () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
  lpush: vi.fn(),
  lrange: vi.fn(),
  quit: vi.fn()
});

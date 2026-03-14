import { MasteryLevel } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { ProgressService } from '../../src/services/progressService';
import { createPrismaMock } from '../mocks/factories';

describe('ProgressService', () => {
  it('builds dashboard aggregates', async () => {
    const prisma = createPrismaMock();
    prisma.session.count.mockResolvedValue(3);
    prisma.message.count.mockResolvedValue(20);
    prisma.learningRecord.findMany.mockResolvedValue([
      { concept: 'algebra', masteryLevel: MasteryLevel.BEGINNER },
      { concept: 'geometry', masteryLevel: MasteryLevel.PROFICIENT }
    ]);

    const service = new ProgressService(prisma as any);
    const result = await service.getDashboard('u1');

    expect(result.stats).toEqual([
      { label: '总会话', value: 3 },
      { label: '已掌握概念', value: 2 },
      { label: '总提问', value: 20 }
    ]);
    expect(result.mastery).toEqual([
      { concept: 'algebra', level: 'BEGINNER', percent: 15 },
      { concept: 'geometry', level: 'PROFICIENT', percent: 75 }
    ]);
    expect(result.radar).toEqual([]);
  });

  it('upserts learning record', async () => {
    const prisma = createPrismaMock();
    prisma.learningRecord.upsert.mockResolvedValue({ id: 'r1' });
    const service = new ProgressService(prisma as any);

    const row = await service.upsertLearningRecord('u1', {
      concept: 'fraction',
      masteryLevel: MasteryLevel.UNDERSTANDING
    });

    expect(row.id).toBe('r1');
  });

  it('lists learning records', async () => {
    const prisma = createPrismaMock();
    prisma.learningRecord.findMany.mockResolvedValue([{ id: 'r1' }]);
    const service = new ProgressService(prisma as any);

    const rows = await service.listLearningRecords('u1');

    expect(rows).toHaveLength(1);
  });
});

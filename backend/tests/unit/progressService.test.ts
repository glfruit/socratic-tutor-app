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
      { masteryLevel: MasteryLevel.BEGINNER },
      { masteryLevel: MasteryLevel.PROFICIENT }
    ]);

    const service = new ProgressService(prisma as any);
    const result = await service.getDashboard('u1');

    expect(result.sessionCount).toBe(3);
    expect(result.masteryDistribution.PROFICIENT).toBe(1);
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

import { describe, expect, it } from 'vitest';
import { SubjectService } from '../../src/services/subjectService';
import { createPrismaMock } from '../mocks/factories';

describe('SubjectService', () => {
  it('lists subjects with knowledge points', async () => {
    const prisma = createPrismaMock();
    prisma.subject.findMany.mockResolvedValue([{ id: 'sub1' }]);

    const service = new SubjectService(prisma as any);
    const rows = await service.listSubjects();

    expect(rows).toHaveLength(1);
  });
});

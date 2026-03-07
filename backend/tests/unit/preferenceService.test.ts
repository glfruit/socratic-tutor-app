import { Level } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { PreferenceService } from '../../src/services/preferenceService';
import { createPrismaMock } from '../mocks/factories';

describe('PreferenceService', () => {
  it('returns default preferences when none exist', async () => {
    const prisma = createPrismaMock();
    prisma.userPreference.findUnique.mockResolvedValue(null);
    const service = new PreferenceService(prisma as never);

    const preference = await service.getPreference('u1');

    expect(preference.level).toBe(Level.HIGH_SCHOOL);
  });

  it('upserts user preferences', async () => {
    const prisma = createPrismaMock();
    prisma.userPreference.upsert.mockResolvedValue({ userId: 'u1', level: Level.UNIVERSITY });
    const service = new PreferenceService(prisma as never);

    const preference = await service.updatePreference('u1', { level: Level.UNIVERSITY });

    expect(preference.level).toBe(Level.UNIVERSITY);
  });
});

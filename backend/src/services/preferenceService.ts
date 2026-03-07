import { Level } from '@prisma/client';
import { PrismaLike } from '../config/prisma';

export class PreferenceService {
  constructor(private readonly prisma: PrismaLike) {}

  async getPreference(userId: string) {
    const preference = await this.prisma.userPreference.findUnique({
      where: { userId }
    });

    return (
      preference ?? {
        userId,
        level: Level.HIGH_SCHOOL
      }
    );
  }

  async updatePreference(userId: string, input: { level: Level }) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: { level: input.level },
      create: { userId, level: input.level }
    });
  }
}

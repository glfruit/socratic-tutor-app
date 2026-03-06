import { MasteryLevel } from '@prisma/client';
import { PrismaLike } from '../config/prisma';

export class ProgressService {
  constructor(private readonly prisma: PrismaLike) {}

  async getDashboard(userId: string) {
    const [sessionCount, messageCount, records] = await Promise.all([
      this.prisma.session.count({ where: { userId } }),
      this.prisma.message.count({ where: { session: { userId } } }),
      this.prisma.learningRecord.findMany({ where: { userId } })
    ]);

    const masteryDistribution = records.reduce<Record<MasteryLevel, number>>(
      (acc, item) => {
        acc[item.masteryLevel] += 1;
        return acc;
      },
      {
        BEGINNER: 0,
        UNDERSTANDING: 0,
        PROFICIENT: 0,
        MASTERY: 0
      }
    );

    return {
      sessionCount,
      messageCount,
      totalConcepts: records.length,
      masteryDistribution
    };
  }

  async upsertLearningRecord(userId: string, input: { concept: string; masteryLevel: MasteryLevel }) {
    return this.prisma.learningRecord.upsert({
      where: {
        userId_concept: {
          userId,
          concept: input.concept
        }
      },
      update: {
        masteryLevel: input.masteryLevel,
        lastPracticed: new Date()
      },
      create: {
        userId,
        concept: input.concept,
        masteryLevel: input.masteryLevel
      }
    });
  }

  async listLearningRecords(userId: string) {
    return this.prisma.learningRecord.findMany({
      where: { userId },
      orderBy: { lastPracticed: 'desc' }
    });
  }

  async deleteLearningRecord(userId: string, recordId: string) {
    await this.prisma.learningRecord.deleteMany({ where: { id: recordId, userId } });
  }
}

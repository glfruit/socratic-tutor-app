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

    const masteryPercent: Record<MasteryLevel, number> = {
      BEGINNER: 15,
      UNDERSTANDING: 45,
      PROFICIENT: 75,
      MASTERY: 95
    };

    return {
      stats: [
        { label: '总会话', value: sessionCount },
        { label: '已掌握概念', value: records.length },
        { label: '总提问', value: messageCount }
      ],
      radar: [] as Array<{ label: string; value: number }>,
      mastery: records.map((r) => ({
        concept: r.concept,
        level: r.masteryLevel,
        percent: masteryPercent[r.masteryLevel]
      }))
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

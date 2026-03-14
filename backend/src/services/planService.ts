import { LearningPlanStatus, PrismaClient } from '@prisma/client';
import { AppError } from '../utils/appError';

export class PlanService {
  constructor(private readonly prisma: PrismaClient) {}

  async createPlan(
    userId: string,
    input: {
      title: string;
      description?: string;
      subject: string;
      targetDate?: Date;
    }
  ) {
    return this.prisma.learningPlan.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        subject: input.subject,
        targetDate: input.targetDate,
        status: LearningPlanStatus.PENDING
      }
    });
  }

  async listPlans(userId: string, status?: LearningPlanStatus) {
    return this.prisma.learningPlan.findMany({
      where: {
        userId,
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getPlan(userId: string, planId: string) {
    const plan = await this.prisma.learningPlan.findFirst({
      where: { id: planId, userId }
    });
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }
    return plan;
  }

  async updatePlan(
    userId: string,
    planId: string,
    input: {
      title?: string;
      description?: string;
      subject?: string;
      targetDate?: Date;
      status?: LearningPlanStatus;
    }
  ) {
    const plan = await this.prisma.learningPlan.findFirst({
      where: { id: planId, userId }
    });
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }

    const updateData: Parameters<typeof this.prisma.learningPlan.update>[0]['data'] = { ...input };
    if (input.status === LearningPlanStatus.COMPLETED && !plan.completedAt) {
      updateData.completedAt = new Date();
    }
    if (input.status && input.status !== LearningPlanStatus.COMPLETED) {
      updateData.completedAt = null;
    }

    return this.prisma.learningPlan.update({
      where: { id: planId },
      data: updateData
    });
  }

  async deletePlan(userId: string, planId: string) {
    const plan = await this.prisma.learningPlan.findFirst({
      where: { id: planId, userId }
    });
    if (!plan) {
      throw new AppError('Plan not found', 404);
    }
    await this.prisma.learningPlan.delete({ where: { id: planId } });
  }
}

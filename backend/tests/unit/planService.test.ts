import { LearningPlanStatus } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { PlanService } from '../../src/services/planService';
import { createPrismaMock } from '../mocks/factories';

describe('PlanService', () => {
  it('creates plans in pending status', async () => {
    const prisma = createPrismaMock();
    prisma.learningPlan.create.mockResolvedValue({ id: 'plan-1', status: LearningPlanStatus.PENDING });
    const service = new PlanService(prisma as any);

    const result = await service.createPlan('user-1', {
      title: '完成函数专题',
      subject: '数学'
    });

    expect(prisma.learningPlan.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        title: '完成函数专题',
        description: undefined,
        subject: '数学',
        targetDate: undefined,
        status: LearningPlanStatus.PENDING
      }
    });
    expect(result.status).toBe(LearningPlanStatus.PENDING);
  });

  it('marks completed plans with a completion timestamp', async () => {
    const prisma = createPrismaMock();
    prisma.learningPlan.findFirst.mockResolvedValue({ id: 'plan-1', completedAt: null });
    prisma.learningPlan.update.mockResolvedValue({ id: 'plan-1', status: LearningPlanStatus.COMPLETED });
    const service = new PlanService(prisma as any);

    await service.updatePlan('user-1', 'plan-1', {
      status: LearningPlanStatus.COMPLETED
    });

    expect(prisma.learningPlan.update).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      data: expect.objectContaining({
        status: LearningPlanStatus.COMPLETED,
        completedAt: expect.any(Date)
      })
    });
  });

  it('clears completedAt when a completed plan moves back to an active state', async () => {
    const prisma = createPrismaMock();
    prisma.learningPlan.findFirst.mockResolvedValue({ id: 'plan-1', completedAt: new Date('2026-03-10T00:00:00Z') });
    prisma.learningPlan.update.mockResolvedValue({ id: 'plan-1', status: LearningPlanStatus.IN_PROGRESS });
    const service = new PlanService(prisma as any);

    await service.updatePlan('user-1', 'plan-1', {
      status: LearningPlanStatus.IN_PROGRESS
    });

    expect(prisma.learningPlan.update).toHaveBeenCalledWith({
      where: { id: 'plan-1' },
      data: {
        status: LearningPlanStatus.IN_PROGRESS,
        completedAt: null
      }
    });
  });

  it('throws when loading a missing plan', async () => {
    const prisma = createPrismaMock();
    prisma.learningPlan.findFirst.mockResolvedValue(null);
    const service = new PlanService(prisma as any);

    await expect(service.getPlan('user-1', 'missing-plan')).rejects.toMatchObject({
      message: 'Plan not found',
      statusCode: 404
    });
  });
});

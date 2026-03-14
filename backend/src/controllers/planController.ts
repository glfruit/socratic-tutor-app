import { LearningPlanStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { container } from '../config/container';

export class PlanController {
  async create(req: Request, res: Response) {
    const plan = await container.planService.createPlan(req.user!.userId, req.body);
    res.status(201).json(plan);
  }

  async list(req: Request, res: Response) {
    const { status } = req.query;
    const plans = await container.planService.listPlans(
      req.user!.userId,
      status as LearningPlanStatus | undefined
    );
    res.json(plans);
  }

  async get(req: Request, res: Response) {
    const plan = await container.planService.getPlan(req.user!.userId, req.params.id);
    res.json(plan);
  }

  async update(req: Request, res: Response) {
    const plan = await container.planService.updatePlan(req.user!.userId, req.params.id, req.body);
    res.json(plan);
  }

  async delete(req: Request, res: Response) {
    await container.planService.deletePlan(req.user!.userId, req.params.id);
    res.status(204).send();
  }
}

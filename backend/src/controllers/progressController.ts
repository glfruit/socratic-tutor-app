import { Request, Response } from 'express';
import { container } from '../config/container';

export class ProgressController {
  async dashboard(req: Request, res: Response) {
    const data = await container.progressService.getDashboard(req.user!.userId);
    res.json(data);
  }

  async listLearningRecords(req: Request, res: Response) {
    const records = await container.progressService.listLearningRecords(req.user!.userId);
    res.json(records);
  }

  async upsertLearningRecord(req: Request, res: Response) {
    const record = await container.progressService.upsertLearningRecord(req.user!.userId, req.body);
    res.status(201).json(record);
  }

  async deleteLearningRecord(req: Request, res: Response) {
    await container.progressService.deleteLearningRecord(req.user!.userId, req.params.id);
    res.status(204).send();
  }
}

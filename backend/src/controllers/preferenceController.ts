import { Request, Response } from 'express';
import { container } from '../config/container';

export class PreferenceController {
  async get(req: Request, res: Response) {
    const preference = await container.preferenceService.getPreference(req.user!.userId);
    res.json(preference);
  }

  async update(req: Request, res: Response) {
    const preference = await container.preferenceService.updatePreference(req.user!.userId, req.body);
    res.json(preference);
  }
}

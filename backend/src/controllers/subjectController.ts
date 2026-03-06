import { Request, Response } from 'express';
import { container } from '../config/container';

export class SubjectController {
  async list(req: Request, res: Response) {
    const subjects = await container.subjectService.listSubjects();
    res.json(subjects);
  }
}

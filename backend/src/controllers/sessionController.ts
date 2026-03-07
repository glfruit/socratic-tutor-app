import { Request, Response } from 'express';
import { container } from '../config/container';

export class SessionController {
  async create(req: Request, res: Response) {
    const session = await container.sessionService.createSession(req.user!.userId, req.body);
    res.status(201).json(session);
  }

  async list(req: Request, res: Response) {
    const sessions = await container.sessionService.listSessions(req.user!.userId);
    res.json(sessions);
  }

  async get(req: Request, res: Response) {
    const session = await container.sessionService.getSession(req.user!.userId, req.params.id);
    res.json(session);
  }

  async listMessages(req: Request, res: Response) {
    const messages = await container.sessionService.listMessages(req.user!.userId, req.params.id);
    res.json(messages);
  }

  async update(req: Request, res: Response) {
    const session = await container.sessionService.updateSession(req.user!.userId, req.params.id, req.body);
    res.json(session);
  }

  async delete(req: Request, res: Response) {
    await container.sessionService.deleteSession(req.user!.userId, req.params.id);
    res.status(204).send();
  }
}

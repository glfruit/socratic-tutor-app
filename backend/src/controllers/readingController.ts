import { Request, Response } from 'express';
import { container } from '../config/container';

export class ReadingController {
  async createSession(req: Request, res: Response) {
    const session = await container.readingService.createSession(req.user!.userId, req.body);
    res.status(201).json(session);
  }

  async getSession(req: Request, res: Response) {
    const session = await container.readingService.getSession(req.user!.userId, req.params.id);
    res.json(session);
  }

  async streamMessage(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let closed = false;
    req.on('close', () => { closed = true; });

    try {
      const stream = await container.readingService.streamMessage(
        req.user!.userId,
        req.params.id,
        req.body
      );

      for await (const chunk of stream) {
        if (closed) break;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      if (!closed) {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      }
    } catch (err) {
      if (!closed) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      }
    } finally {
      res.end();
    }
  }

  async updateProgress(req: Request, res: Response) {
    const session = await container.readingService.updateProgress(
      req.user!.userId,
      req.params.id,
      req.body
    );
    res.json(session);
  }
}

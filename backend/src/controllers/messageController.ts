import { Request, Response } from 'express';
import { container } from '../config/container';

export class MessageController {
  async send(req: Request, res: Response) {
    const result = await container.messageService.sendMessage(
      req.user!.userId,
      req.params.id,
      req.body.content
    );
    res.status(201).json(result);
  }

  async stream(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let closed = false;
    req.on('close', () => { closed = true; });

    try {
      const generator = await container.messageService.streamMessage(
        req.user!.userId,
        req.params.id,
        req.body.content
      );

      for await (const chunk of generator) {
        if (closed) break;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      if (!closed) {
        res.write('data: [DONE]\n\n');
      }
    } catch (err) {
      if (!closed) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
      }
    } finally {
      res.end();
    }
  }
}

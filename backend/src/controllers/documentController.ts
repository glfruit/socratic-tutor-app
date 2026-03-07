import { Request, Response } from 'express';
import { container } from '../config/container';
import { AppError } from '../utils/appError';
import { documentListSchema } from '../utils/schemas';

export class DocumentController {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      throw new AppError('File is required', 400);
    }

    const document = await container.documentService.uploadDocument(req.user!.userId, {
      file: req.file!,
      type: req.body.type,
      title: req.body.title,
      description: req.body.description
    });
    res.status(202).json(document);
  }

  async list(req: Request, res: Response) {
    const parsed = documentListSchema.parse(req.query);
    const documents = await container.documentService.listDocuments(req.user!.userId, parsed);
    res.json(documents);
  }

  async get(req: Request, res: Response) {
    const document = await container.documentService.getDocument(req.user!.userId, req.params.id);
    res.json(document);
  }

  async remove(req: Request, res: Response) {
    await container.documentService.deleteDocument(req.user!.userId, req.params.id);
    res.status(204).send();
  }

  async search(req: Request, res: Response) {
    const embedding = await container.embeddingService.generateEmbedding(req.body.query);
    const results = await container.documentService.searchSimilar(
      req.user!.userId,
      req.params.id,
      embedding,
      req.body.topK,
      req.body.chapterId
    );
    res.json({ results });
  }
}

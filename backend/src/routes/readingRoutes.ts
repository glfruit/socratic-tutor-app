import { Router } from 'express';
import { ReadingController } from '../controllers/readingController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import {
  readingMessageSchema,
  readingProgressSchema,
  readingSessionCreateSchema
} from '../utils/schemas';

const router = Router();
const controller = new ReadingController();

router.post('/', validateBody(readingSessionCreateSchema), asyncHandler(controller.createSession.bind(controller)));
router.get('/:id', asyncHandler(controller.getSession.bind(controller)));
router.post(
  '/:id/messages',
  validateBody(readingMessageSchema),
  asyncHandler(controller.streamMessage.bind(controller))
);
router.patch(
  '/:id/progress',
  validateBody(readingProgressSchema),
  asyncHandler(controller.updateProgress.bind(controller))
);

export default router;

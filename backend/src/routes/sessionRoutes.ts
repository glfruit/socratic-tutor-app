import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { MessageController } from '../controllers/messageController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { messageSchema, sessionCreateSchema, sessionUpdateSchema } from '../utils/schemas';

const router = Router();
const controller = new SessionController();
const messageController = new MessageController();

router.post('/', validateBody(sessionCreateSchema), asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.get.bind(controller)));
router.get('/:id/messages', asyncHandler(controller.listMessages.bind(controller)));
router.patch('/:id', validateBody(sessionUpdateSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

router.post(
  '/:id/messages',
  validateBody(messageSchema),
  asyncHandler(messageController.send.bind(messageController))
);
router.post(
  '/:id/messages/stream',
  validateBody(messageSchema),
  asyncHandler(messageController.stream.bind(messageController))
);

export default router;

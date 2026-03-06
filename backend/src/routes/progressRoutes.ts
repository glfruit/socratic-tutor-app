import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { learningRecordSchema } from '../utils/schemas';

const router = Router();
const controller = new ProgressController();

router.get('/dashboard', asyncHandler(controller.dashboard.bind(controller)));
router.get('/learning-records', asyncHandler(controller.listLearningRecords.bind(controller)));
router.post(
  '/learning-records',
  validateBody(learningRecordSchema),
  asyncHandler(controller.upsertLearningRecord.bind(controller))
);
router.delete('/learning-records/:id', asyncHandler(controller.deleteLearningRecord.bind(controller)));

export default router;

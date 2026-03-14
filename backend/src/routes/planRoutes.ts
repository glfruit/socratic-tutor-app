import { Router } from 'express';
import { PlanController } from '../controllers/planController';
import { validateBody } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { learningPlanCreateSchema, learningPlanUpdateSchema } from '../utils/schemas';

const router = Router();
const controller = new PlanController();

router.post('/', validateBody(learningPlanCreateSchema), asyncHandler(controller.create.bind(controller)));
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.get.bind(controller)));
router.patch('/:id', validateBody(learningPlanUpdateSchema), asyncHandler(controller.update.bind(controller)));
router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

export default router;

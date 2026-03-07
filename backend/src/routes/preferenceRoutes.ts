import { Router } from 'express';
import { PreferenceController } from '../controllers/preferenceController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { preferenceUpdateSchema } from '../utils/schemas';

const router = Router();
const controller = new PreferenceController();

router.get('/', asyncHandler(controller.get.bind(controller)));
router.patch('/', validateBody(preferenceUpdateSchema), asyncHandler(controller.update.bind(controller)));

export default router;

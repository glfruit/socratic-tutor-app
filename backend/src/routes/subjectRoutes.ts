import { Router } from 'express';
import { SubjectController } from '../controllers/subjectController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const controller = new SubjectController();

router.get('/', asyncHandler(controller.list.bind(controller)));

export default router;

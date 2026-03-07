import path from 'node:path';
import multer from 'multer';
import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { AppError } from '../utils/appError';
import { documentSearchSchema, documentUploadSchema } from '../utils/schemas';

const allowedExtensions = new Set(['.pdf', '.epub', '.docx', '.txt']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      callback(new AppError('Unsupported file type', 400));
      return;
    }
    callback(null, true);
  }
});

const router = Router();
const controller = new DocumentController();

router.post(
  '/',
  upload.single('file'),
  validateBody(documentUploadSchema),
  asyncHandler(controller.upload.bind(controller))
);
router.get('/', asyncHandler(controller.list.bind(controller)));
router.get('/:id', asyncHandler(controller.get.bind(controller)));
router.delete('/:id', asyncHandler(controller.remove.bind(controller)));
router.post(
  '/:id/search',
  validateBody(documentSearchSchema),
  asyncHandler(controller.search.bind(controller))
);

export default router;

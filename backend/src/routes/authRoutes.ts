import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateBody } from '../middleware/validate';
import { loginSchema, oauthSchema, refreshSchema, registerSchema } from '../utils/schemas';

const router = Router();
const controller = new AuthController();

router.post('/register', validateBody(registerSchema), asyncHandler(controller.register.bind(controller)));
router.post('/login', validateBody(loginSchema), asyncHandler(controller.login.bind(controller)));
router.post('/refresh', validateBody(refreshSchema), asyncHandler(controller.refresh.bind(controller)));
router.post(
  '/oauth/:provider',
  validateBody(oauthSchema),
  asyncHandler(controller.oauthLogin.bind(controller))
);

export default router;

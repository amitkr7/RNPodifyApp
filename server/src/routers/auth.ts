import { Router } from 'express';

import {
  create,
  generateForgotPasswordLink,
  handleValidation,
  sendReVerificationToken,
  verifyEmail,
} from '../controllers/user';
import { verifyResetPasswordToken } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  CreateUserSchema,
  TokenAndIdValidation,
} from '../utils/schemaValidator';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);
router.post('/verify-email', validate(TokenAndIdValidation), verifyEmail);
router.post('/resend-verify-email', sendReVerificationToken);
router.post('/forgot-password', generateForgotPasswordLink);
router.post(
  '/verify-reset-pass-token',
  validate(TokenAndIdValidation),
  verifyResetPasswordToken,
  handleValidation
);

export default router;

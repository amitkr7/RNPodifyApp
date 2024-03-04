import { Router } from 'express';

import {
  create,
  generateForgotPasswordLink,
  handleValidation,
  logOut,
  sendProfile,
  sendReVerificationToken,
  signIn,
  updatePassword,
  updateProfile,
  verifyEmail,
} from '../controllers/auth';
import { authenticateUser, verifyResetPasswordToken } from '../middleware/auth';
import fileParser, { RequestWithFiles } from '../middleware/fileParser';
import { validate } from '../middleware/validator';
import {
  CreateUserSchema,
  SignInValidationSchema,
  TokenAndIdValidation,
  updatePasswordSchema,
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
router.post(
  '/update-password',
  validate(updatePasswordSchema),
  verifyResetPasswordToken,
  updatePassword
);
router.post('/sign-in', validate(SignInValidationSchema), signIn);
router.get('/is-auth', authenticateUser, sendProfile);

router.post('/update-profile', authenticateUser, fileParser, updateProfile);
router.post('/log-out', authenticateUser, logOut);

export default router;

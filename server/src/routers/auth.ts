import { Router } from 'express';

import {
  create,
  generateForgotPasswordLink,
  handleValidation,
  sendReVerificationToken,
  signIn,
  updatePassword,
  verifyEmail,
} from '../controllers/user';
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
router.get('/is-auth', authenticateUser, (req, res) => {
  res.json({ profile: req.user });
});

router.post('/update-profile', fileParser, (req: RequestWithFiles, res) => {
  console.log(req.files);
  res.json({ uploaded: true });
});

export default router;

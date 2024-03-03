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

import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

router.post('/update-profile', async (req, res) => {
  if (!req.headers['content-type']?.startsWith('multipart/form-data;'))
    return res.status(422).json({ error: 'Only accepts form-data' });

  const dir = path.join(__dirname, '../public/profiles');

  try {
    await fs.readdirSync(dir);
  } catch (error) {
    await fs.mkdirSync(dir);
  }

  const form = formidable({
    uploadDir: dir,
    filename(name, ext, part, form) {
      return Date.now() + '_' + part.originalFilename;
    },
  });

  form.parse(req, (err, fields, files) => {
    res.json({ uploaded: true });
  });
});

export default router;

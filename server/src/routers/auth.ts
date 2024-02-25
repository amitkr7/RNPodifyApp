import { Router } from 'express';

import {
  create,
  verifyEmail,
  sendReVerificationToken,
} from '../controllers/user';
import { validate } from '../middleware/validator';
import {
  CreateUserSchema,
  EmailVerificationBody,
} from '../utils/schemaValidator';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);
router.post('/verify-email', validate(EmailVerificationBody), verifyEmail);
router.post('/resend-verify-email', sendReVerificationToken);

export default router;

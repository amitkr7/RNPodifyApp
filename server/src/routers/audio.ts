import { Router } from 'express';
import { createAudio } from '../controllers/audio';
import { authenticateUser, isVerified } from '../middleware/auth';
import fileParser from '../middleware/fileParser';
import { validate } from '../middleware/validator';
import { AudioValidationSchema } from '../utils/schemaValidator';

const router = Router();

router.post(
  '/create',
  authenticateUser,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  createAudio
);

export default router;

import { Router } from 'express';
import { createAudio, updateAudio } from '../controllers/audio';
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

router.patch(
  '/:audioId',
  authenticateUser,
  isVerified,
  fileParser,
  validate(AudioValidationSchema),
  updateAudio
);

export default router;

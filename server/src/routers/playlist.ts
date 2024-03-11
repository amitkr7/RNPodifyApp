import { Router } from 'express';
import { createPlaylist } from '../controllers/playlist';
import { authenticateUser, isVerified } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { NewPlaylistValidationSchema } from '../utils/schemaValidator';

const router = Router();

router.post(
  'create',
  authenticateUser,
  isVerified,
  validate(NewPlaylistValidationSchema),
  createPlaylist
);

export default router;

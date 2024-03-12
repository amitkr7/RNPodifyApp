import { Router } from 'express';
import {
  createPlaylist,
  getPlaylistByProfile,
  removePlaylist,
  updatePlaylist,
} from '../controllers/playlist';
import { authenticateUser, isVerified } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  NewPlaylistValidationSchema,
  OldPlaylistValidationSchema,
} from '../utils/schemaValidator';

const router = Router();

router.post(
  '/create',
  authenticateUser,
  isVerified,
  validate(NewPlaylistValidationSchema),
  createPlaylist
);
router.patch(
  '/',
  authenticateUser,
  isVerified,
  validate(OldPlaylistValidationSchema),
  updatePlaylist
);
router.delete('/', authenticateUser, removePlaylist);
router.get('/by-profile', authenticateUser, getPlaylistByProfile);

export default router;

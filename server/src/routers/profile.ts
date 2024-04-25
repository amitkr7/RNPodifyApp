import { Router } from 'express';
import {
  getPublicProfile,
  getPublicUploads,
  getUploads,
  updateFollower,
} from '../controllers/profile';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/update-profile/:profileId', authenticateUser, updateFollower);
router.get('/uploads', authenticateUser, getUploads);
router.get('/uploads/:profileId', getPublicUploads);
router.get('/info/:profileId', getPublicProfile);

export default router;

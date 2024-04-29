import { Router } from 'express';
import {
  getPublicPlaylist,
  getPublicProfile,
  getPublicUploads,
  getRecommendedByProfile,
  getUploads,
  updateFollower,
} from '../controllers/profile';
import { authenticateUser, isAuth } from '../middleware/auth';

const router = Router();

router.post('/update-profile/:profileId', authenticateUser, updateFollower);
router.get('/uploads', authenticateUser, getUploads);
router.get('/uploads/:profileId', getPublicUploads);
router.get('/info/:profileId', getPublicProfile);
router.get('/playlist/:profileId', getPublicPlaylist);
router.get('/recommended', isAuth, getRecommendedByProfile);

export default router;

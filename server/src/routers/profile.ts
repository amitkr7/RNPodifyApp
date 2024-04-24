import { Router } from 'express';
import { getUploads, updateFollower } from '../controllers/profile';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/update-profile/:profileId', authenticateUser, updateFollower);
router.get('/uploads', authenticateUser, getUploads);

export default router;

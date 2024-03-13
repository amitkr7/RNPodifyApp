import { Router } from 'express';
import { updateFollower } from '../controllers/follower';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/update-profile/:profileId', authenticateUser, updateFollower);

export default router;

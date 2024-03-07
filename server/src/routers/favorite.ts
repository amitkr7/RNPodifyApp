import { Router } from 'express';
import { toggleFavorite } from '../controllers/favorite';
import { authenticateUser, isVerified } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, isVerified, toggleFavorite);

export default router;

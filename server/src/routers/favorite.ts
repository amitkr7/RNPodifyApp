import { Router } from 'express';
import { getFavorites, toggleFavorite } from '../controllers/favorite';
import { authenticateUser, isVerified } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, isVerified, toggleFavorite);
router.get('/', authenticateUser, getFavorites);

export default router;

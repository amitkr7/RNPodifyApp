import { Router } from 'express';
import {
  getFavorites,
  getIsFavorite,
  toggleFavorite,
} from '../controllers/favorite';
import { authenticateUser, isVerified } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, isVerified, toggleFavorite);
router.get('/', authenticateUser, getFavorites);
router.get('/is-fav', authenticateUser, getIsFavorite);

export default router;

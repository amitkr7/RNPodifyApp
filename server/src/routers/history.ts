import { Router } from 'express';
import { updateHistory } from '../controllers/history';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.post('/', authenticateUser, updateHistory);

export default router;

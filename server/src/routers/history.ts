import { Router } from 'express';
import { updateHistory } from '../controllers/history';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { UpdateHistoryValidationSchema } from '../utils/schemaValidator';

const router = Router();

router.post(
  '/',
  authenticateUser,
  validate(UpdateHistoryValidationSchema),
  updateHistory
);

export default router;

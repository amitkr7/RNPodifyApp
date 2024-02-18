import { Router } from 'express';

import { create } from '../controllers/user';
import { validate } from '../middleware/validator';
import { CreateUserSchema } from '../utils/schemaValidator';

const router = Router();

router.post('/create', validate(CreateUserSchema), create);

export default router;

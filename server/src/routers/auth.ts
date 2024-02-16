import { Router } from 'express';
import { CreateUser } from '../@types/user';
import User from '../models/user';

const router = Router();

router.post('/create', async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  // const user = new User({ email, password, name })
  // user.save()

  const user = await User.create({ email, password, name });
  res.json({ user });
});

export default router;

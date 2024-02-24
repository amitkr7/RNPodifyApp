import { RequestHandler } from 'express';

import { CreateUser, VerifyEmailRequest } from '../@types/user';
import EmailVerificationToken from '../models/emailVerificationToken';
import User from '../models/user';
import { generateToken } from '../utils/helper';
import { sendVerificationMail } from '../utils/mail';

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  // const user = new User({ email, password, name })
  // user.save()

  const user = await User.create({ email, password, name });

  const token = generateToken();
  sendVerificationMail(token, { name, email, userId: user._id.toString() });

  res.status(201).json({ user: { id: user._id, name, email } });
};

export const verifyEmail: RequestHandler = async (
  req: VerifyEmailRequest,
  res
) => {
  const { userId, token } = req.body;

  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (!verificationToken) return res.status(403).json({ error: 'Invalid OTP' });

  const matched = await verificationToken?.compareToken(token);

  if (!matched) return res.status(403).json({ error: 'Invalid OTP' });

  await User.findByIdAndUpdate(userId, { verified: true });
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: 'Email Verified' });
};

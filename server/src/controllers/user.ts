import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

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

  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

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
export const sendReVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  if (!isValidObjectId(userId))
    return res.status(403).json({ error: 'Invalid Request!!!' });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: 'Invalid Request!!!' });

  await EmailVerificationToken.findOneAndDelete({
    owner: userId,
  });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString(),
  });

  res.json({ message: 'Please Check your email!' });
};

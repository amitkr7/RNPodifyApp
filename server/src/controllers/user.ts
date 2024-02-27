import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import crypto from 'crypto';

import { CreateUser, VerifyEmailRequest } from '../@types/user';
import EmailVerificationToken from '../models/emailVerificationToken';
import PasswordResetToken from '../models/passwordResetToken';
import User from '../models/user';
import { generateToken } from '../utils/helper';
import {
  sendForgotPasswordLink,
  sendResetPasswordSuccessMail,
  sendVerificationMail,
} from '../utils/mail';
import { PASSWORD_RESET_LINK } from '../utils/variables';

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

export const generateForgotPasswordLink: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: 'Acoount not found' });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = crypto.randomBytes(36).toString('hex');

  await PasswordResetToken.create({
    owner: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgotPasswordLink({ email: user.email, link: resetLink });

  res.json({ message: 'Please check your registered mail!' });
};

export const handleValidation: RequestHandler = async (req, res) => {
  res.json({ valid: true });
};

export const updatePassword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: 'Unauthorized Access!!' });

  const matched = await user.comparePassword(password);
  if (matched)
    return res.status(422).json({ error: 'Old password cannot be used' });

  user.password = password;
  user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  sendResetPasswordSuccessMail(user.name, user.email);

  res.json({ message: 'Password Reset Successfully' });
};

import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import crypto from 'crypto';
import formidable from 'formidable';
import jwt from 'jsonwebtoken';

import { CreateUser, VerifyEmailRequest } from '../@types/user';
import cloudinary from '../cloud';
import EmailVerificationToken from '../models/emailVerificationToken';
import PasswordResetToken from '../models/passwordResetToken';
import User from '../models/user';
import { formatProfile, generateToken } from '../utils/helper';
import {
  sendForgotPasswordLink,
  sendResetPasswordSuccessMail,
  sendVerificationMail,
} from '../utils/mail';
import { JWT_SECRET, PASSWORD_RESET_LINK } from '../utils/variables';
import { RequestWithFiles } from '../middleware/fileParser';

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

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user)
    return res.status(403).json({ error: 'Email/Password does not match!' });

  const matched = await user.comparePassword(password);
  if (!matched)
    return res.status(403).json({ error: 'Email/Password does not match!' });

  const token = jwt.sign(
    {
      userId: user._id,
    },
    JWT_SECRET
  );
  user.tokens.push(token);

  await user.save();

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar?.url,
      followers: user.followers.length,
      followings: user.followings.length,
    },
    token,
  });
};

export const updateProfile: RequestHandler = async (
  req: RequestWithFiles,
  res
) => {
  const { name } = req.body;
  const avatar = req.files?.avatar as formidable.File;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error('Something went Wrong, User not found');

  if (typeof name !== 'string')
    return res.status(422).json({ error: 'Invalid name!' });
  if (name.trim().length < 3)
    return res.status(422).json({ error: 'Invalid name!' });

  user.name = name;

  if (avatar) {
    if (user.avatar?.publicId) {
      await cloudinary.uploader.destroy(user.avatar?.publicId);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      avatar.filepath,
      {
        width: 300,
        height: 300,
        crop: 'thumb',
        gravity: 'face',
      }
    );

    user.avatar = { url: secure_url, publicId: public_id };
  }
  await user.save();

  res.json({ profile: formatProfile(user) });
};

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({ profile: req.user });
};

export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;

  const token = req.token;
  const user = await User.findById(req.user.id);
  if (!user) throw new Error('Something went Wrong, User not found');

  if (fromAll === 'yes') user.tokens = [];
  else user.tokens = user.tokens.filter((item) => item !== token);

  await user.save();
  res.json({ success: true });
};

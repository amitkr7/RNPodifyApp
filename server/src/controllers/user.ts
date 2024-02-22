import { RequestHandler } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';

import { CreateUser } from '../@types/user';
import User from '../models/user';
import EmailVerificationToken from '../models/emailVerificationToken';
import { generateToken } from '../utils/helper';
import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '../utils/variables';
import { generateTemplate } from '../mail/template';

export const create: RequestHandler = async (req: CreateUser, res) => {
  const { email, password, name } = req.body;

  // const user = new User({ email, password, name })
  // user.save()

  const user = await User.create({ email, password, name });

  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });

  const token = generateToken();
  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  const welcomeMessage = `Hi ${name}, Welcome to Podify! There are so much thing that you can do if email is verified. Use the given OTP to verify your email`;

  transport.sendMail({
    to: user.email,
    from: 'auth@podify.com',
    subject: 'Welcome to Podify',
    html: generateTemplate({
      title: 'Welcome to Podify',
      message: welcomeMessage,
      logo: 'cid:logo',
      banner: 'cid:welcome',
      link: '#',
      btnTitle: token,
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../mail/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'welcome.png',
        path: path.join(__dirname, '../mail/welcome.png'),
        cid: 'welcome',
      },
    ],
  });

  res.status(201).json({ user });
};

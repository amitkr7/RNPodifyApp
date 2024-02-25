import nodemailer from 'nodemailer';
import path from 'path';

import EmailVerificationToken from '../models/emailVerificationToken';
import {
  MAILTRAP_PASSWORD,
  MAILTRAP_USER,
  VERIFICATION_EMAIL,
} from '../utils/variables';
import { generateTemplate } from '../mail/template';

const generateMailTransporter = () => {
  const transport = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASSWORD,
    },
  });
  return transport;
};

interface Profile {
  name: string;
  email: string;
  userId: string;
}

export const sendVerificationMail = async (token: string, profile: Profile) => {
  const transport = generateMailTransporter();

  const { name, email, userId } = profile;

  const welcomeMessage = `Hi ${name}, Welcome to Podify! There are so much thing that you can do if email is verified. Use the given OTP to verify your email`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
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
};

interface Options {
  email: string;
  link: string;
}

export const sendForgotPasswordLink = async (options: Options) => {
  const transport = generateMailTransporter();

  const { email, link } = options;

  const resetPasswordMessage = `We received your request for forgot password. Please use the link below to reset your password`;

  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Reset Password',
    html: generateTemplate({
      title: 'Reset Password',
      message: resetPasswordMessage,
      logo: 'cid:logo',
      banner: 'cid:forget_password',
      link,
      btnTitle: 'Reset Password',
    }),
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(__dirname, '../mail/logo.png'),
        cid: 'logo',
      },
      {
        filename: 'forget_password.png',
        path: path.join(__dirname, '../mail/forget_password.png'),
        cid: 'forget_password',
      },
    ],
  });
};

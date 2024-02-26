import { RequestHandler } from 'express';
import PasswordResetToken from '../models/passwordResetToken';

export const verifyResetPasswordToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const { token, userId } = req.body;

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken)
    return res
      .status(403)
      .json({ error: 'Unauthorized Access, Invalid Token!' });

  const matched = await resetToken.compareToken(token);

  if (!matched)
    return res
      .status(403)
      .json({ error: 'Unauthorized Access, Invalid Token!' });

  next();
};

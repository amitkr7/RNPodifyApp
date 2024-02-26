import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

export const CreateUserSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Name is missing!')
    .min(3, 'Name is too short!')
    .max(20, 'Name is too long!'),
  email: yup.string().required('Email is mandatory').email('Invalid Email!'),
  password: yup
    .string()
    .trim()
    .required('Password is missing!')
    .min(8, 'Password should be atleast 8 character!')
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%^&\*])[a-zA-Z\d!@#\$%^&\*]+$/,
      'Password does not match pattern'
    ),
});

export const TokenAndIdValidation = yup.object().shape({
  token: yup.string().trim().required('Invalid Token'),
  userId: yup
    .string()
    .transform(function (value) {
      if (this.isType(value) && isValidObjectId(value)) {
        return value;
      }
      return '';
    })
    .required('Invalid UserId'),
});

import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';
import { categories } from './audio_category';

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

export const updatePasswordSchema = yup.object().shape({
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

export const SignInValidationSchema = yup.object().shape({
  email: yup.string().required('Email is mandatory').email('Invalid Email!'),
  password: yup.string().trim().required('Password is missing'),
});

export const AudioValidationSchema = yup.object().shape({
  title: yup.string().required('Title is mandatory'),
  about: yup.string().required('About is missing'),
  category: yup
    .string()
    .oneOf(categories, 'Invlaid Category')
    .required('Category is missing'),
});

export const NewPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required('Title is mandatory'),
  resId: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),
  visibility: yup
    .string()
    .oneOf(['public', 'private'], 'Visibility must be public or private')
    .required('Visibility is missing'),
});

export const OldPlaylistValidationSchema = yup.object().shape({
  title: yup.string().required('Title is mandatory'),
  item: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),
  id: yup.string().transform(function (value) {
    return this.isType(value) && isValidObjectId(value) ? value : '';
  }),
  visibility: yup
    .string()
    .oneOf(['public', 'private'], 'Visibility must be public or private'),
  // .required('Visibility is missing'),
});
export const UpdateHistoryValidationSchema = yup.object().shape({
  audio: yup
    .string()
    .transform(function (value) {
      return this.isType(value) && isValidObjectId(value) ? value : '';
    })
    .required('Invalid audio id'),
  progress: yup.number().required('History progress is missing'),
  date: yup
    .string()
    .transform(function (value) {
      const date = new Date(value);
      if (date instanceof Date) return value;
      return '';
    })
    .required('Invalid Date'),
});

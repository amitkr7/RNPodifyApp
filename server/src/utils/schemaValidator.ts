import * as yup from 'yup';

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

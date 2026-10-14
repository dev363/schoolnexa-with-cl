import { RequestValidationSchema } from './validate';

/**
 * Validation schema for POST /api/auth/login
 */
export const loginSchema: RequestValidationSchema = {
  body: {
    email: {
      required: true,
      type: 'email',
      message: 'A valid email address is required',
    },
    password: {
      required: true,
      type: 'string',
      minLength: 6,
      message: 'Password is required and must be at least 6 characters',
    },
  },
};

export default {
  loginSchema,
};

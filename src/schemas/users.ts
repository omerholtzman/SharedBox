import { z } from 'zod';

const signUpSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const signInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export { signInSchema, signUpSchema };
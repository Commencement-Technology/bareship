import { z } from 'zod';

// Messages are translation keys; FormTextField translates them for display.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'auth.validation.emailInvalid' }));
const password = z.string().min(8, { error: 'auth.validation.passwordShort' });

export const LoginInputSchema = z.object({ email, password });
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const RegisterInputSchema = z.object({
  name: z.string().trim().min(1, { error: 'auth.validation.nameRequired' }),
  email,
  password,
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const ForgotPasswordInputSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

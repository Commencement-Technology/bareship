import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  avatarUrl: z.url().nullable(),
});

export type User = z.infer<typeof UserSchema>;

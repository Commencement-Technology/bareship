import { z } from 'zod';

import { UserSchema } from '@/entities/user/schema';
import { NoContent } from '@/shared/api/client';
import { http } from '@/shared/api/http';
import { TokensSchema } from '@/shared/api/token-store';

export const AuthResponseSchema = z.object({ tokens: TokensSchema, user: UserSchema });
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

/** Used by the HTTP client's single-flight refresh. Never sends the (expired) access token. */
export function refreshTokens(refreshToken: string) {
  return http.post('/auth/refresh', TokensSchema, { body: { refreshToken }, auth: false });
}

export function fetchCurrentUser(signal?: AbortSignal) {
  return http.get('/me', UserSchema, { signal });
}

/** Best effort: the local session ends even if this request fails. */
export function logout() {
  return http.post('/auth/logout', NoContent);
}

/** Permanently deletes the signed-in account (an App Store requirement for apps with sign-up). */
export function deleteAccount() {
  return http.delete('/me', NoContent);
}

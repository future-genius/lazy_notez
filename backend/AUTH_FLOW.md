# Authentication Flow (Overview)

1. User registers via `/api/auth/register`.
   - Password hashed with bcrypt.
   - Server creates access token (short-lived) and refresh token (long-lived).
   - Refresh token stored in user's `refreshTokens[]` array in DB and sent as `HttpOnly` cookie.

2. Client stores `accessToken` in memory (Redux store) and includes in `Authorization: Bearer <accessToken>`.

3. When `accessToken` expires, client calls `/api/auth/refresh` (no body) and browser will send `refreshToken` cookie.
   - Server verifies refresh token exists for user, rotates refresh token (replaces old with new), returns new `accessToken` and sets new refresh cookie.

4. Logout calls `/api/auth/logout` which clears cookie and removes refresh token from DB.

Security:
- Refresh tokens are HttpOnly cookies to mitigate XSS.
- Access tokens are short-lived and kept in memory to reduce persistence.
- Refresh token rotation reduces risk of replay.
- CSRF protection can be added on top (double submit cookie or sameSite + csrf token if needed.)


# LazyNotez API Documentation (Overview)

Base URL: `/api`

## Auth
- POST `/auth/register` { name, username, password, email?, role? }
  - Returns: `{ accessToken, user }` and sets `refreshToken` cookie (httpOnly)

- POST `/auth/login` { username, password }
  - Returns: `{ accessToken, user }` and sets `refreshToken` cookie

- POST `/auth/refresh`
  - Uses `refreshToken` cookie, returns new `accessToken` and rotates refresh token cookie

- POST `/auth/logout`
  - Clears refresh cookie and removes refresh token from DB

- GET `/auth/me` (auth required) returns user info

## Users (admin only)
- GET `/users` list users
- GET `/users/:id` get user
- PUT `/users/:id` update user
- DELETE `/users/:id` delete user

## Notes (auth required)
- POST `/notes` create note
- GET `/notes` list current user's notes
- GET `/notes/:id` get note
- PUT `/notes/:id` update note
- DELETE `/notes/:id` delete note (admin allowed)

## Resources
- GET `/resources` list resources
- POST `/resources` (faculty/admin) create
- PUT `/resources/:id` (faculty/admin) update
- DELETE `/resources/:id` (faculty/admin) delete

## Admin
- GET `/admin/activity` get activity logs
- PUT `/admin/about` update About content
- DELETE `/admin/note/:id` admin delete note


Authentication: Provide `Authorization: Bearer <accessToken>` header for protected endpoints. Refresh tokens are sent via `refreshToken` cookie (httpOnly).


Security Notes:
- Passwords are stored hashed with bcrypt
- Refresh tokens are rotated on use and stored per-user in DB
- Rate limiting and helmet are enabled


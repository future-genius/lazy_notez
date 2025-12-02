# LazyNotez Backend - Production-Ready Node.js/Express API

## Overview

Secure, scalable backend built with:
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe development
- **MongoDB + Mongoose** - Document database with schemas
- **JWT** - Stateless authentication (access + refresh tokens)
- **bcrypt** - Password hashing (12 rounds)
- **Redis** (optional) - Token blacklist + caching
- **Helmet** - Enhanced security headers
- **CORS** - Origin-based access control
- **Rate Limiting** - API throttling
- **Input Validation & Sanitization** - XSS/injection prevention

---

## Features

### Security
✅ bcrypt password hashing (12 rounds)  
✅ JWT access + refresh tokens with rotation  
✅ HttpOnly, SameSite cookies  
✅ CSRF token validation  
✅ XSS sanitization (sanitize-html)  
✅ Input validation (express-validator)  
✅ Rate limiting per endpoint  
✅ IP blacklist (optional)  
✅ Helmet security headers  
✅ CORS with origin whitelist (production)  
✅ Refresh token blacklist via Redis  
✅ Role-based access control (RBAC)  

### API Features
✅ User registration + login + refresh + logout  
✅ Activity logging (login/logout/register)  
✅ Notes CRUD with ownership checks  
✅ Resources CRUD with role restrictions (faculty/admin)  
✅ Admin panel (users, stats, activity logs, about page)  
✅ Pagination + filtering  
✅ Error handling + validation errors  

---

## Installation & Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB (local or Atlas)
- Redis (optional, for token blacklist)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Edit `.env`:
```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/lazynotez
JWT_ACCESS_SECRET=<random-32-char-string>
JWT_REFRESH_SECRET=<random-32-char-string>
COOKIE_SECURE=false
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
REDIS_URL=redis://localhost:6379
```

**Generate random secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Development Server

```bash
npm run dev
```

Output:
```
LazyNotez backend running on port 4000
✓ Connected to MongoDB
```

Health check: `GET http://localhost:4000/api/`

---

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── app.ts                 # Express app setup
│   │
│   ├── models/                # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Note.ts
│   │   ├── Resource.ts
│   │   ├── Community.ts
│   │   ├── About.ts
│   │   └── ActivityLog.ts
│   │
│   ├── controllers/           # Business logic
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── noteController.ts
│   │   ├── resourceController.ts
│   │   └── adminController.ts
│   │
│   ├── routes/                # API routes
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── notes.ts
│   │   ├── resources.ts
│   │   └── admin.ts
│   │
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiting.ts
│   │   └── csrfMiddleware.ts
│   │
│   └── utils/                 # Utilities
│       ├── validators.ts      # Input validation rules
│       ├── errors.ts          # Custom error classes
│       ├── redis.ts           # Redis helpers
│       └── csrf.ts            # CSRF token helpers
│
├── dist/                      # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## API Endpoints

### Authentication

**Register**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "password": "securepass123",
  "email": "john@example.com",
  "role": "student"
}

Response: 201
{
  "accessToken": "eyJhbGc...",
  "user": { "id": "...", "username": "johndoe", "role": "student", "name": "John Doe" }
}
```

**Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}

Response: 200
{
  "accessToken": "eyJhbGc...",
  "user": { ... }
}
```

**Refresh Token**
```bash
POST /api/auth/refresh
(refreshToken cookie sent automatically)

Response: 200
{ "accessToken": "eyJhbGc..." }
```

**Logout**
```bash
POST /api/auth/logout

Response: 200
{ "message": "Logged out successfully" }
```

**Get Current User**
```bash
GET /api/auth/me
Authorization: Bearer <accessToken>

Response: 200
{ "id": "...", "username": "...", "role": "...", ... }
```

### CSRF Token

**Get CSRF Token** (for POST/PUT/DELETE requests)
```bash
GET /api/csrf-token

Response: 200
{ "csrfToken": "abc123def456..." }
```

### Users (Admin Only)

```bash
GET    /api/users                 # List all users
GET    /api/users/:id             # Get user by ID
PUT    /api/users/:id             # Update user (name, email, role, status)
DELETE /api/users/:id             # Delete user

# All require Authorization header
# Authorization: Bearer <accessToken>
```

### Notes

```bash
POST   /api/notes                 # Create note
GET    /api/notes                 # List user's notes (paginated)
GET    /api/notes/:id             # Get note by ID
PUT    /api/notes/:id             # Update note
DELETE /api/notes/:id             # Delete note

# All require Authorization header
```

### Resources

```bash
GET    /api/resources             # List resources (public)
POST   /api/resources             # Create resource (faculty/admin)
PUT    /api/resources/:id         # Update resource (faculty/admin)
DELETE /api/resources/:id         # Delete resource (faculty/admin)

# POST/PUT/DELETE require Authorization header + role check
```

### Admin

```bash
GET    /api/admin/activity        # Activity logs
GET    /api/admin/stats           # System statistics
GET    /api/admin/about           # Get About page
PUT    /api/admin/about           # Update About page
DELETE /api/admin/note/:id        # Delete note as admin
POST   /api/admin/clear-logs      # Clear old activity logs

# All require Authorization header + admin role
```

---

## Authentication Flow

1. **Register/Login** → Server hashes password, generates JWT access + refresh tokens
2. **Access Token** (15m) stored in memory (frontend Redux store) + sent in `Authorization: Bearer` header
3. **Refresh Token** (7d) stored in `HttpOnly` cookie, automatically sent by browser
4. **Token Refresh**: When access token expires, frontend calls `/api/auth/refresh`
   - Server validates refresh token cookie
   - Generates new access token + rotates refresh token
   - Returns new access token, sets new refresh cookie
5. **Logout**: Removes refresh token from user's DB + adds to Redis blacklist
6. **Blacklist Check**: Optional Redis stores revoked tokens to prevent reuse across servers

---

## Rate Limiting

- **Auth endpoints** (register, login): 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- Returns `429 Too Many Requests` when exceeded

---

## Input Validation & Sanitization

All inputs are:
- ✅ Validated with express-validator (type, length, format)
- ✅ Sanitized with sanitize-html (XSS prevention)
- ✅ Trimmed of whitespace
- ✅ Error details returned to client

Example validation error:
```json
{
  "message": "Validation error",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

## Error Handling

All errors follow consistent format:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `200` - OK
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid credentials, expired token)
- `403` - Forbidden (insufficient permissions, invalid CSRF)
- `404` - Not found
- `409` - Conflict (resource exists)
- `429` - Rate limit exceeded
- `500` - Server error

---

## Building for Production

```bash
npm run build
# Compiles TypeScript to dist/

npm run start
# Runs compiled JavaScript (dist/server.js)
```

---

## Environment Variables Reference

| Variable | Type | Default | Notes |
|----------|------|---------|-------|
| `NODE_ENV` | string | development | Set to `production` for deploy |
| `PORT` | number | 4000 | Server port |
| `MONGO_URI` | string | required | MongoDB connection string |
| `JWT_ACCESS_SECRET` | string | required | Min 32 chars, random |
| `JWT_REFRESH_SECRET` | string | required | Min 32 chars, random |
| `ACCESS_TOKEN_EXPIRES` | string | 15m | JWT expiry (15m, 1h, etc) |
| `REFRESH_TOKEN_EXPIRES` | string | 7d | Refresh token expiry |
| `COOKIE_SECURE` | boolean | false | Set `true` on HTTPS |
| `ALLOWED_ORIGINS` | string | localhost | Comma-separated origins |
| `REDIS_URL` | string | optional | Redis connection (token blacklist) |
| `LOG_LEVEL` | string | info | Logging level |

---

## Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong JWT secrets (min 32 chars)
- [ ] Use production MongoDB URI (Atlas)
- [ ] Set `COOKIE_SECURE=true` (HTTPS only)
- [ ] Configure `ALLOWED_ORIGINS` to frontend domain
- [ ] Set up Redis (optional but recommended)
- [ ] Enable HTTPS on backend & frontend
- [ ] Configure CORS properly
- [ ] Set up monitoring & logging
- [ ] Run database migrations
- [ ] Test all auth flows
- [ ] Implement rate limit policies
- [ ] Add backup strategy

---

## Testing

### Manual Testing with cURL

**Register**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser",
    "password": "TestPass123",
    "role": "student"
  }'
```

**Login**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "TestPass123"}'
```

**Create Note**
```bash
curl -X POST http://localhost:4000/api/notes \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Note content"}'
```

---

## Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI in .env
- Verify IP is whitelisted in MongoDB Atlas
- Ensure network access is enabled

### Token Refresh Loop
- Verify JWT secrets are set
- Check refresh token TTL settings
- Clear browser cookies and try again

### CORS Errors
- Add frontend origin to ALLOWED_ORIGINS
- Ensure `credentials: true` on frontend requests
- Check preflight requests (OPTIONS)

### Rate Limiting Issues
- Wait 15 minutes or restart backend
- Check `X-RateLimit-*` headers in response

---

## Security Best Practices

1. **Secrets**: Use strong, random secrets (min 32 chars)
2. **HTTPS**: Always use in production
3. **Passwords**: Never log or return passwords
4. **Tokens**: Keep short-lived (15m access, 7d refresh)
5. **Refresh Token Rotation**: Implement and enforce
6. **Rate Limiting**: Adjust per use case
7. **CORS**: Whitelist specific origins only
8. **Input Validation**: Validate everything
9. **Error Messages**: Don't leak sensitive info in production
10. **Monitoring**: Log and monitor all auth events

---

## Support & Resources

- [Express Documentation](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Top 10](https://owasp.org/Top10/)

---

**Status**: Production-Ready ✅  
**Last Updated**: December 2, 2025

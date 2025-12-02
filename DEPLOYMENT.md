# Deployment Instructions

## Overview
This document summarizes how to deploy the full-stack LazyNotez application:
- Frontend: Vite + React app → Vercel
- Backend: Node.js + Express (TypeScript) → Render / Railway
- Database: MongoDB Atlas
- Redis (optional): Render/Redis/Atlas MemoryDB

---

## Environment variables (backend)
Create `.env` with the following keys:

```
PORT=4000
MONGO_URI="<mongo connection string>"
JWT_ACCESS_SECRET=super-secret-access
JWT_REFRESH_SECRET=super-secret-refresh
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
COOKIE_SECURE=true
REDIS_URL=redis://<redis-url>
```

## Backend (Render/Railway)
- Create a service, connect repo and set the build command: `npm install && npm run build`
- Start command: `npm run start`
- Set environment variables in the service dashboard
- Open firewall to allow connections from frontend domain

## Frontend (Vercel)
- Create a Vercel project from the frontend directory
- Set `VITE_API_BASE` to your backend URL (e.g., `https://api.myapp.com/api`)
- Build & deploy via Vercel UI

## Database (MongoDB Atlas)
- Create a free cluster
- Create database user and whitelist IPs (or use VPC peering)
- Copy connection string into `.env` as `MONGO_URI`

## HTTPS
- Vercel/Render provide TLS certificates by default. Ensure `COOKIE_SECURE=true` in production.

---

## Local development
1. Backend
```
cd backend
npm install
cp .env.example .env  # edit values
npm run dev
```

2. Frontend
```
cd frontend
npm install
npm run dev
# open http://localhost:5173
```

---

## Notes
- Use strong random secrets for JWT secrets
- Use HTTPS in production and set `COOKIE_SECURE=true`
- Consider rate limit and monitoring
- Use Redis for session or token blacklisting when scaling

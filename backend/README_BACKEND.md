# LazyNotez Backend

This is the backend scaffold for LazyNotez.

## Features
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- JWT authentication (access + refresh) with rotation
- BCrypt password hashing
- Role-based access control (admin/faculty/student)
- Activity logging
- Rate limiting, Helmet, CORS, XSS cleaning

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. `npm install`
3. `npm run dev`

Endpoints are under `/api/*`.

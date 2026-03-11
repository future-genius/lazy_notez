# Lazy Notez
## Academic Project Report (Codebase-Derived)

**Project Title:** Lazy Notez  
**Project Type:** Full-stack web application (SPA + API)  
**Codebase Scope Analyzed:** Repository root, `backend/`, `frontend/`, `netlify/`, and root `src/` UI  
**Report Basis:** Only the provided folder structure, configuration, and source code artifacts in this repository.

---

## Abstract
Lazy Notez is a learning-oriented notes and resources platform implemented as a web application. The repository contains (1) a TypeScript/Node.js backend API using Express and MongoDB (via Mongoose) with JWT-based authentication, role-based access control, rate limiting, and optional Redis-backed token blacklisting; (2) at least one React + Vite frontend that consumes the API using Axios and Redux state management; and (3) a second React + Vite UI at the repository root that includes a localStorage-backed “local database” mode and a Netlify serverless function used for Google token verification. The backend also integrates Socket.IO to emit real-time events (for example, user login events and feedback submission events) to connected clients.

---

## 1. Project Overview
### 1.1 What the Application Does
Based on the implemented backend routes/controllers/models and the frontend pages, Lazy Notez provides:
- User registration and login (manual username/password), with an additional Google login capability implemented in the backend and a separate Google token verification function for Netlify deployments.
- A personal notes module where authenticated users can create, read, update, and delete notes stored in MongoDB.
- A learning resources module where resources (study materials) can be listed and filtered; privileged roles (admin/faculty) can create and manage resources; and downloads are tracked.
- An administrative module with user management and system monitoring endpoints (system statistics and activity logs), plus management of an “About” content entity and a feedback inbox.
- Real-time notifications using Socket.IO (for example, emitting `user.login`, `feedback.submitted`, and `users.resync` events).

### 1.2 Intended User Groups (Derived From Roles)
The backend defines roles such as `super_admin`, `admin`, `faculty`, `student`, and `user`. The UI logic in the clients primarily distinguishes:
- Standard users/students: consume resources and manage personal notes.
- Faculty: allowed to upload/manage resources (backend enforces faculty/admin).
- Admin/super admin: system management operations (user management, logs, stats, content administration).

---

## 2. Problem Statement
Students and learners often manage study notes and shared academic materials across multiple tools (messaging apps, file drives, personal note apps), which leads to:
- Fragmented storage and difficulty finding the right resource quickly.
- Limited oversight and governance for shared materials in a community setting.
- Lack of visibility into recent activity (logins, uploads, downloads) for administrators maintaining the platform.

Lazy Notez addresses this by providing a single web-based system to store personal notes, publish shared learning resources, and support administrative oversight with role-based access control and activity tracking.

---

## 3. Project Objectives
Derived from implemented modules and route behaviors, the primary objectives are:
1. Provide secure authentication and session management (access + refresh token model).
2. Enable users to create and manage personal notes in a persistent database.
3. Provide a searchable/filterable repository of learning resources with download tracking.
4. Enforce role-based permissions for administrative and faculty actions.
5. Provide administrative visibility through system statistics and activity logs.
6. Support real-time operational awareness via Socket.IO event broadcasting.
7. Support deployable frontend workflows (Netlify configuration present) and environment-based configuration for API origins and security settings.

---

## 4. System Architecture
### 4.1 High-Level Architecture
Lazy Notez is organized as a multi-component system:
- **Backend API (Node.js/Express, TypeScript):** Exposes REST-like endpoints under `/api/*`, connects to MongoDB via Mongoose, and emits Socket.IO events.
- **Database (MongoDB):** Stores persistent entities such as users, notes, resources, activity logs, feedback, and about content.
- **Optional Cache/Token Blacklist (Redis):** Used to blacklist refresh/access tokens (for logout/rotation) and can also support caching helpers.
- **Frontend SPA(s) (React/Vite):**
  - `frontend/` client: Uses Redux Toolkit, Axios, and Socket.IO client to call the backend and listen for real-time events.
  - Root `src/` client: Implements a localStorage-backed “local DB” plus partial backend integration for certain actions (notably feedback), and includes Google auth utilities.
- **Netlify Functions:** A serverless function (`netlify/functions/google-auth.js`) validates Google ID tokens through Google’s tokeninfo endpoint and returns a normalized user payload (suitable for static deployments without running the full backend).

### 4.2 Backend Internal Structure (Express + MVC-Style Separation)
The backend follows a common Express modular layout:
- **Routes** map HTTP endpoints to controller functions.
- **Controllers** implement business logic and orchestrate data access.
- **Models** define persistence schema (Mongoose schemas) and relationships.
- **Middleware** implements cross-cutting concerns: authentication, CSRF policy, rate limiting, IP blacklist, and error handling.
- **Utilities** implement reusable helpers such as Redis access, Socket.IO lifecycle, CSRF token generation/validation, and validation rules.

### 4.3 API and Real-Time Interfaces
- **HTTP API:** `/api/auth`, `/api/notes`, `/api/resources`, `/api/users`, `/api/admin`, plus `/api/csrf-token`.
- **Socket.IO:** Initialized on the same HTTP server used by Express. Events are emitted from controllers (for example, authentication and admin controllers).

---

## 5. Application Structure (Folder-Level Analysis)
### 5.1 Repository Root
- `src/`: A React application (Vite-based) with pages and components; includes a localStorage-backed data layer (`src/utils/localDb.ts`).
- `public/`: Static public assets for the root Vite application.
- `backend/`: Backend API service (Express, MongoDB via Mongoose, Socket.IO server).
- `frontend/`: A second React SPA client designed to consume the backend API (Axios + Redux Toolkit).
- `netlify/`: Netlify configuration and serverless functions for deployment support.
- `index.html`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`: Root client build, tooling, and lint configuration.
- Deployment documentation files: Several Markdown files describing deployment readiness and Netlify deployment (present as project documentation artifacts).

### 5.2 Backend (`backend/`)
- `backend/src/server.ts`: Creates the HTTP server, mounts the Express app, initializes Socket.IO, and starts listening.
- `backend/src/app.ts`: Express application configuration, middleware wiring, DB connection, and route mounting.
- `backend/src/routes/`: Route modules (`auth`, `notes`, `resources`, `users`, `admin`) that bind endpoints to controllers and middleware.
- `backend/src/controllers/`: Business logic for authentication, notes, resources, admin operations, and user management.
- `backend/src/models/`: Mongoose schemas (User, Note, Resource, About, ActivityLog, Feedback, Community).
- `backend/src/middleware/`: Auth verification, CSRF policy enforcement, rate limiting, and centralized error handling.
- `backend/src/utils/`: Redis integration, Socket.IO utilities, CSRF token manager, typed errors, and express-validator rules.
- `backend/.env.example`: Reference for required environment variables (Mongo URI, JWT secrets, CORS origins, Google client ID, Redis URL, cookie policy).

### 5.3 Frontend Client (`frontend/`)
- `frontend/src/lib/api.ts`: Axios instance configuration, attaches bearer access tokens, handles refresh token rotation on 401 using `/auth/refresh`.
- `frontend/src/store/`: Redux store configuration and slices (auth, notes).
- `frontend/src/pages/`: Login, register, dashboard, notes, resources, admin panel views.
- `frontend/src/components/`: Navbar, alerts/spinners, error boundary, and a Socket.IO-based login notification listener.
- `frontend/.env.example`: API base URL for frontend-to-backend connectivity.

### 5.4 Netlify (`netlify/`)
- `netlify.toml`: Build/publish configuration and SPA redirect rules; includes `/api/*` redirect placeholder for forwarding to a backend origin.
- `netlify/functions/google-auth.js`: Serverless function verifying Google ID tokens and returning a normalized user payload.

---

## 6. System Modules (Functional Decomposition)
The system implements the following functional modules (as evidenced by controllers, routes, and UI pages):
1. **Authentication and Session Management**
   - Manual registration and login.
   - Refresh token rotation via HTTP-only cookie.
   - Logout revocation (blacklisting) when Redis is available.
   - Google login supported in backend; token verification supported via Netlify function for static deployments.
2. **User Management (Admin-Only)**
   - List users, view user details, update role/status, delete user.
   - Role constraints for `super_admin` (only super admin can modify/delete a super admin).
3. **Notes Management (Per-User)**
   - CRUD operations on notes belonging to the authenticated user.
   - Tag support for organizing notes.
4. **Resources Management (Shared Learning Materials)**
   - Public listing with filtering and sorting capabilities on the backend (department/semester/subject/search/sort).
   - Creation/update/deletion restricted to admin/faculty and/or owner (backend enforcement).
   - Download tracking endpoint increments per-resource download count.
5. **Administrative Monitoring and Content**
   - System stats aggregation (counts of users/notes/resources/downloads/logs and recent logins).
   - Activity log retrieval and retention management (delete logs older than N days).
   - About content management (single record semantics).
6. **Feedback Collection and Moderation**
   - Feedback submission endpoint (admin route) storing messages to MongoDB.
   - Feedback listing/deletion for administrators.
7. **Real-Time Eventing (Socket.IO)**
   - Broadcasts for login activity and administrative data synchronization/events.
8. **Security and Compliance Controls**
   - Helmet headers, XSS cleaning, HTML sanitization, rate limits, CORS allow-list, CSRF token mechanism (primarily for cookie-authenticated workflows), and centralized error handling.

---

## 7. Workflow of the System (End-to-End)
This section describes the typical runtime workflow from a user’s perspective through backend processing.

### 7.1 Application Startup
1. Backend loads environment variables and creates an HTTP server from the Express app.
2. Socket.IO server is initialized on the same HTTP server instance.
3. Express configures middleware (security headers, JSON parsing, cookie parsing, request logging, CORS policy, rate limits).
4. Backend connects to MongoDB (if `MONGO_URI` is set). A special update operation ensures a pre-defined email is elevated to `super_admin`.

### 7.2 Manual Registration and Login (Backend-Centric Flow)
1. User submits registration data to `POST /api/auth/register`.
2. Backend validates input (express-validator), sanitizes fields, hashes password (bcrypt), stores a `User` document.
3. Backend issues:
   - **Access token** (JWT, returned in JSON).
   - **Refresh token** (JWT, stored in `refreshToken` HTTP-only cookie) and also persisted in `User.refreshTokens`.
4. Backend logs the action in `ActivityLog` and emits a Socket.IO `user.login` event.
5. User submits login data to `POST /api/auth/login`.
6. Backend verifies credentials, updates last login time, logs activity, emits the real-time login event, and issues new tokens (as above).

### 7.3 Token Refresh and Logout
1. If a frontend request returns `401 Unauthorized`, the `frontend/` client’s Axios interceptor calls `POST /api/auth/refresh` (cookie-based).
2. Backend validates refresh token:
   - Verifies JWT signature/expiry.
   - Confirms the token is in `User.refreshTokens`.
   - Checks optional Redis blacklist (if configured).
3. Backend rotates the refresh token: removes old token, issues a new refresh token cookie, blacklists the old token (Redis), and returns a new access token.
4. Logout (`POST /api/auth/logout`) removes the refresh token from the user record, clears the cookie, and blacklists the refresh token if Redis is available.

### 7.4 Notes CRUD
1. Authenticated frontend calls `/api/notes` endpoints with `Authorization: Bearer <accessToken>`.
2. Middleware (`verifyAccessToken`) verifies the token, checks blacklist (Redis optional), loads user from DB, attaches user to request.
3. Controller operations:
   - Create note: stores sanitized title/content/tags.
   - List notes: paginated (`limit`/`skip`) and sorted by creation date.
   - Get/update/delete: enforces ownership checks; delete allows owner and an admin role.

### 7.5 Resources Browse, Upload, and Download Tracking
1. Public listing (`GET /api/resources`) returns resources with query filters and sorting.
2. Creation/update/deletion require authentication and role checks (admin or faculty) and, for modifications, may also require owner or admin privileges.
3. Download tracking (`POST /api/resources/:id/download`) increments download count and logs the action.

### 7.6 Administration
1. Admin authenticated client calls:
   - `GET /api/admin/stats` for aggregate system stats.
   - `GET /api/admin/activity` for logs.
   - `GET/PUT /api/admin/about` to view/update “About” content.
   - `GET/DELETE /api/admin/feedback` to manage feedback items.
   - `POST /api/admin/resync-users` to emit a `users.resync` event via Socket.IO.
2. User management uses `/api/users/*` endpoints protected by admin access middleware.

---

## 8. Features of the Application (Implemented)
### 8.1 Authentication and Authorization
- Manual registration/login with bcrypt password hashing.
- JWT access token for API requests.
- Refresh token stored as HTTP-only cookie, rotation on refresh.
- Role-based access control:
  - `admin`/`super_admin` for admin endpoints and user management.
  - `faculty`/`admin` for resource creation/management.
- User status management (`active`/`inactive`) influencing login/authorization outcomes.

### 8.2 Notes Management
- Create, list (paginated), view, update, delete notes.
- Tag array support for categorization.

### 8.3 Learning Resources
- Resource entity includes: department, semester, subject, title, Google Drive URL, uploader name, upload date, download count, optional description and tags.
- Listing supports filters and search and multiple sort modes (recent/name/most downloaded).
- Download tracking increments usage count and logs activity.

### 8.4 Administration and Monitoring
- User management operations (list, view, update, delete) with role constraints for `super_admin`.
- Activity log storage and retrieval.
- System stats aggregation including:
  - counts of users (total/active), notes, resources
  - download aggregations over resources
  - recent login activities
  - heuristic “currently active users” window based on last login timestamp
- “About” content editing stored in MongoDB as a single record.

### 8.5 Feedback Management
- Feedback submission and storage in MongoDB.
- Admin feedback listing and deletion.
- Real-time event emission for new feedback (`feedback.submitted`).

### 8.6 Real-Time Notifications
- Socket.IO server and clients allow broadcast notifications:
  - `user.login` emitted during registration/login operations.
  - `feedback.submitted` emitted after feedback creation.
  - `users.resync` emitted when admins request re-sync.

### 8.7 Security Controls
- HTTP security headers via Helmet.
- Input sanitization via `sanitize-html`.
- Request body XSS cleaning via `xss-clean`.
- CORS allow-list via environment variable `ALLOWED_ORIGINS`.
- Rate limiting on auth endpoints and global API.
- Token revocation support via Redis blacklist (optional).
- CSRF token endpoint and state-changing request validation for non-bearer flows.

### 8.8 Deployment/Operational Features
- Netlify build configuration and SPA redirects.
- Environment variable templates for frontend and backend.

---

## 9. Technology Stack
### 9.1 Backend
- **Language:** TypeScript
- **Runtime:** Node.js
- **Web Framework:** Express
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (jsonwebtoken), bcrypt password hashing
- **Security Middleware:** Helmet, xss-clean, sanitize-html, cookie-parser, CORS
- **Validation:** express-validator
- **Logging:** Morgan
- **Rate Limiting:** express-rate-limit
- **Real-Time:** Socket.IO
- **Optional Infra:** Redis via ioredis (token blacklist/caching helpers)
- **Dev Tooling:** ts-node-dev, TypeScript compiler

### 9.2 Frontend(s)
- **Language:** TypeScript
- **UI Library:** React
- **Routing:** react-router-dom
- **State Management (frontend client):** Redux Toolkit + react-redux
- **HTTP Client:** Axios (with refresh interceptor) and fetch (root client in places)
- **Real-Time:** socket.io-client
- **Build Tool:** Vite
- **Styling:** Tailwind CSS in the root client; utility/CSS files in `frontend/`
- **Icons/UX:** lucide-react, dayjs for dates

### 9.3 Deployment
- **Netlify:** `netlify.toml` + serverless function(s) for Google auth verification.

---

## 10. Database Design (MongoDB via Mongoose)
This section is derived from the backend Mongoose models in `backend/src/models/`.

### 10.1 Collections and Key Fields
1. **User**
   - Identity: `userId` (string, unique), `_id` (MongoDB ObjectId)
   - Profile: `name`, `username` (unique), `email` (unique)
   - Security: `password` (hashed), `refreshTokens` (array of refresh JWTs)
   - Authorization: `role` (`super_admin|admin|faculty|student|user`), `status` (`active|inactive`)
   - Metadata: `loginMethod` (`google|manual`), `lastLogin`, `registrationDate`, `department`, `universityRegisterNumber`
2. **Note**
   - Owner relation: `user` (ObjectId reference to `User`)
   - Content: `title`, `content`, `tags[]`
   - Metadata: timestamps (`createdAt`, `updatedAt`)
3. **Resource**
   - Classification: `department`, `semester`, `subject` (indexed)
   - Content: `title`, `googleDriveUrl`, `description`, `tags[]`
   - Ownership/attribution: `uploadedBy` (ObjectId ref `User`), `uploadedByName`
   - Metrics: `downloadCount`
   - Metadata: timestamps
4. **ActivityLog**
   - Optional relation: `user` (ObjectId ref `User`)
   - Activity: `action` (string), `ip`, `meta` (mixed)
   - Metadata: `createdAt` timestamp
5. **Feedback**
   - Content: `message` (required), optional `name`, `email`
   - Optional relation: `user` (ObjectId ref `User`)
   - Metadata: timestamps
6. **About**
   - Content: `title`, `content`
   - Metadata: timestamps
7. **Community**
   - Fields: `name`, optional `description`, optional `link`
   - Metadata: timestamps

### 10.2 Relationships (Logical ER Summary)
- `User (1) -> (N) Note` via `Note.user`.
- `User (1) -> (N) Resource` via `Resource.uploadedBy` (optional field in schema).
- `User (1) -> (N) ActivityLog` via `ActivityLog.user` (optional).
- `User (1) -> (N) Feedback` via `Feedback.user` (optional).
- `About` and `Community` are independent collections (no references in schemas).

### 10.3 Data Flow Notes
- Authentication issues tokens; refresh tokens are stored both client-side (cookie) and server-side (`User.refreshTokens`) enabling rotation/revocation checks.
- Administrative stats include an aggregation over `Resource.downloadCount`.
- Activity logging captures operational events such as login/register/logout and resource operations.

---

## 11. My Role in the Project (Inferred From Code Artifacts)
This section describes typical developer responsibilities implied by the codebase composition and breadth (it cannot identify personal actions beyond what the code shows).

### 11.1 Responsibilities Evidenced by the Codebase
- **System design:** splitting the system into an API service, SPA client(s), database models, and deployment configuration.
- **Backend engineering:** implementing Express middleware, route layering, controllers, Mongoose schema design, JWT auth, refresh token rotation, and security measures (Helmet/XSS sanitization/rate limits/CORS).
- **Frontend engineering:** implementing React pages for authentication, dashboard navigation, notes/resources management, and an admin panel; integrating Axios with token refresh behavior; implementing Socket.IO client listeners.
- **DevOps/deployment preparation:** providing `.env.example` templates, Netlify configuration, and serverless function for Google auth verification.
- **Quality and maintainability:** adding centralized error handling and structured validators.

---

## 12. Advantages of the System
- **Clear separation of concerns:** routes/controllers/models/middleware in the backend supports maintainability and extensibility.
- **Security-minded backend configuration:** Helmet headers, XSS cleaning, HTML sanitization, rate limits, and restricted CORS origins are applied.
- **Token lifecycle management:** access tokens + refresh token rotation, with optional Redis revocation, supports improved session control.
- **Role-based access control:** administrative operations and resource publishing are restricted by role.
- **Auditing/observability:** activity logs and system statistics provide visibility for administrators.
- **Real-time capabilities:** Socket.IO enables instant notifications and administrative synchronization workflows.
- **Deployment readiness artifacts:** Netlify build/redirect configuration and environment templates reduce deployment friction.

---

## 13. Limitations of the System (Observed From Implementation)
- **Multiple frontend implementations:** both the root `src/` client and `frontend/` client exist, increasing maintenance overhead and risking behavioral divergence.
- **Client/Server contract mismatches (in `frontend/` client):**
  - Notes endpoints: backend returns a note document directly, while the client code expects `response.data.note` for create/update.
  - Resource endpoints: backend uses `googleDriveUrl` and (department/semester/subject) fields; the client code uses `url` and a simplified payload.
  These mismatches indicate integration work is required for consistent end-to-end behavior.
- **CSRF token manager is in-memory:** CSRF tokens are stored in a process-local map; tokens are lost on server restart and do not scale horizontally without shared storage (comment notes that Redis could be used).
- **Limited explicit automated tests:** no test suite is present in the analyzed structure, so correctness relies on manual testing.
- **Community model without corresponding backend routes:** `Community` is modeled in MongoDB but no `/api/community` route/controller is present in the backend routing modules shown.
- **Refresh token storage in user documents:** storing many refresh tokens per user may require additional cleanup policies in long-running deployments.

---

## 14. Future Enhancements (Aligned With Current Codebase)
1. **Unify frontend strategy:** choose a single primary SPA (either root `src/` or `frontend/`) and remove/merge duplicates to reduce divergence.
2. **Formalize API contracts:**
   - Align frontend payloads/response handling with backend schemas (`googleDriveUrl`, note response shapes, etc.).
   - Consider generating typed API clients from an OpenAPI specification.
3. **Improve scalability of CSRF/session support:** move CSRF token storage and token blacklist to a shared store (Redis) consistently; consider multi-instance deployment concerns.
4. **Add automated tests:**
   - Unit tests for validators/utilities.
   - Integration tests for auth refresh rotation, RBAC enforcement, and CRUD endpoints.
5. **Expand the resources feature set:** optional file upload pipelines (beyond Google Drive links), richer search (full-text), and standardized tagging.
6. **Complete community module:** implement backend routes/controllers for `Community` and connect them to frontend pages.
7. **Enhance observability:** structured logging, correlation IDs, and dashboards for activity and error rates.
8. **Harden security posture:** rotate secrets, enforce stronger password policies, add account lockouts, and expand audit logs for admin actions.

---

## Appendix A: Implemented Backend Endpoints (From Route Modules)
### Authentication (`/api/auth`)
- `POST /register`
- `POST /login`
- `POST /google`
- `POST /refresh`
- `POST /logout`
- `GET /me`

### Notes (`/api/notes`) (Bearer token required)
- `POST /`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`

### Resources (`/api/resources`)
- `GET /` (public)
- `POST /:id/download` (auth required)
- `POST /` (admin/faculty)
- `PUT /:id` (admin/faculty + owner/admin checks)
- `DELETE /:id` (admin/faculty + owner/admin checks)

### Users (`/api/users`) (Admin required)
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`

### Admin (`/api/admin`) (Admin required)
- `GET /activity`
- `GET /stats`
- `GET /about`
- `PUT /about`
- `DELETE /note/:id`
- `POST /clear-logs`
- `POST /feedback`
- `GET /feedback`
- `DELETE /feedback/:id`
- `POST /resync-users`

### CSRF Token
- `GET /api/csrf-token`


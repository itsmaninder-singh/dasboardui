# Real-Time Project Management Dashboard — Backend

A production-style **backend-only** service for a project management dashboard with
JWT auth (access + rotating refresh tokens), strict role-based access control enforced
at the service layer, real-time updates over Socket.io, and a cron-driven overdue-task
sweep. No frontend is included by design.

---

## 1. Overview

Three roles — `ADMIN`, `PROJECT_MANAGER`, `DEVELOPER` — collaborate on projects made up
of tasks. Every task status change is persisted as an immutable `ActivityLog` row and
broadcast in real time to exactly the users authorized to see it. Notifications are
DB-backed and pushed live; unread counts update over the socket, not polling.

## 2. Architecture

Strict layering, one direction only:

```
Route → Middleware (auth/role/validate) → Controller → Service → Repository → Prisma
```

- **Controllers** only translate HTTP ↔ service calls. No business logic, no Prisma.
- **Services** hold all business logic and **all authorization/ownership checks**.
- **Repositories** are the only files that call `prisma.*`.
- **Socket.io** and **cron jobs** call into the same services/repositories — there is
  no separate/parallel business logic path for realtime vs REST.

## 3. Folder structure

```
prisma/
  schema.prisma
  seed.ts
src/
  config/         env.ts, db.ts (Prisma client singleton)
  controllers/     one per resource — thin HTTP adapters
  services/        business logic + RBAC/ownership enforcement
  repositories/     Prisma queries only
  routes/          Express routers, wire middleware → controller
  middleware/      authenticate, authorize, validate, errorHandler, notFound
  validators/      Zod schemas per resource
  utils/           ApiError, ApiResponse, asyncHandler, jwt, password, hash, cookies, logger
  socket/          io init, auth middleware, rooms, presence, event emitters, reconnect sync
  jobs/            node-cron overdue sweep
  types/           express.d.ts (req.user augmentation), shared types
  app.ts           Express app (no listen())
  server.ts        http server + socket.io + cron bootstrap
tests/             Jest + Supertest + socket.io-client
Dockerfile
docker-compose.yml
.env.example
```

## 4. Setup

```bash
npm install
cp .env.example .env          # fill in real secrets before deploying anywhere real
docker compose up -d postgres # or point DATABASE_URL at your own Postgres
npm run prisma:migrate        # creates tables
npm run prisma:seed           # seeds demo data (see console output for login credentials)
npm run dev                   # http://localhost:4000
```

Production:
```bash
npm run build
npm run prisma:migrate:deploy
npm start
```

Full stack via Docker:
```bash
docker compose up --build
```

## 5. Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | API port |
| `FRONTEND_URL` | Allowed CORS origin (REST + Socket.io) |
| `DATABASE_URL` | Postgres connection string (Prisma) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Separate signing secrets — never reuse one secret for both token types |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes |
| `COOKIE_NAME` | Name of the HttpOnly refresh-token cookie |
| `COOKIE_SECURE` | `true` in production (HTTPS only) |
| `COOKIE_SAME_SITE` | `lax`/`strict`/`none` |
| `COOKIE_DOMAIN` | Cookie domain |

No secret is ever hardcoded; `src/config/env.ts` throws on boot if a required variable
is missing.

## 6. Database schema

`User`, `Client`, `Project`, `Task`, `ActivityLog`, `Notification`, `RefreshToken` — all
UUID PKs, `createdAt`/`updatedAt` timestamps, enums for `Role`, `TaskStatus`,
`TaskPriority`, `NotificationType`.

Key FK behaviour:
- `Project.clientId → Client` — `Restrict` (can't delete a client with active projects).
- `Project.managerId → User` — `Restrict`.
- `Task.projectId → Project` — `Cascade` (deleting a project deletes its tasks).
- `Task.assignedDeveloperId → User` — `SetNull` (deleting a user un-assigns their tasks
  rather than deleting task history).
- `ActivityLog.taskId/projectId → Cascade` — activity is meaningless without its task.
- `ActivityLog.userId → Restrict` — never silently lose *who* made a change.
- `RefreshToken.userId → Cascade`.

`ActivityLog` is **append-only** and is never derived from `Task.status` — it is the
authoritative history, written in the same request that updates the task.

## 7. Authentication flow

1. `POST /api/auth/register` — creates a `DEVELOPER` account (self-registration is
   **always forced to `DEVELOPER`** server-side, regardless of what the client sends,
   to prevent privilege escalation via the public endpoint). `ADMIN`/`PROJECT_MANAGER`
   accounts are created by an existing `ADMIN` via `POST /api/users`.
2. `POST /api/auth/login` — verifies bcrypt hash, issues:
   - a short-lived **access token** (JWT, returned in the JSON body, sent as
     `Authorization: Bearer <token>` on every request), and
   - a long-lived **refresh token** (JWT, set as an **HttpOnly, SameSite cookie**,
     scoped to `/api/auth` — JavaScript never touches it).
   The refresh token's SHA-256 hash (not the raw JWT) is stored in `RefreshToken` so a
   stolen DB dump can't be replayed as a token.
3. `POST /api/auth/refresh` — reads the cookie, verifies the JWT signature *and* looks
   up its hash in the DB (must exist, not be revoked, not be expired). On success it
   **rotates**: the old row is marked `revoked`, a brand new access+refresh pair is
   issued and linked via `replacedByTokenHash`. If a client ever presents an
   already-revoked token, every refresh token for that user is revoked immediately —
   that pattern only happens if a stolen token is reused after the legitimate client
   already rotated past it.
4. `POST /api/auth/logout` — revokes the current refresh token and clears the cookie.

## 8. RBAC strategy

Role middleware (`authorize(...)`) only gates *which roles may hit an endpoint at all*.
**Ownership and assignment checks always happen in the service layer**, because they
require a DB lookup the route layer doesn't have:

| Resource | ADMIN | PROJECT_MANAGER | DEVELOPER |
|---|---|---|---|
| Users | full CRUD | — | read own profile (`/users/me`) |
| Clients | full CRUD | read | — |
| Projects | full CRUD, any project | CRUD **only their own** projects | — |
| Tasks (read) | all | tasks in **their own** projects | **only tasks assigned to them** |
| Tasks (create/edit/delete) | any | in **their own** projects only | — |
| Task status update | any | any (in their projects) | **only their own assigned task** |
| Activity log | all | their own projects | their own assigned tasks |
| Notifications | own | own | own |

A denied ownership/assignment check always returns **404**, not 403 — this avoids
leaking whether a resource exists to a user who isn't authorized to know that. A wrong
*role* (e.g. a developer hitting `POST /api/clients`) returns 403 from the route-level
`authorize()` middleware, since role membership isn't sensitive information the way
resource existence is.

## 9. Socket.io architecture

**Rooms**
- `user:<id>` — every connected socket joins its own personal room (used for direct
  notifications and, for developers, their own task activity).
- `admin:global` — joined only by `ADMIN` sockets; receives all activity.
- `project:<id>` — joined only by the `PROJECT_MANAGER` who manages that project.
  **Developers never join project rooms** — if they did, they'd receive activity for
  every task in the project, including tasks assigned to other developers.

**Auth**: the same short-lived access token used for REST is passed as
`io(url, { auth: { token } })`; a Socket.io middleware verifies it before the
connection is accepted (unauthenticated sockets are rejected, not just unauthorized).

**Task status change → emission**, in order:
1. Update `Task.status` in Postgres.
2. Insert `ActivityLog`.
3. Emit `activity:new` to: `admin:global`, `project:<projectId>`, and — always,
   regardless of room membership — `user:<assignedDeveloperId>`. This three-way emit is
   exactly how "admin sees all / PM sees own projects / developer sees own tasks" is
   enforced for realtime delivery, mirroring the same rule used for the REST activity
   endpoint.

**Presence**: an in-memory `Map<userId, Set<socketId>>` correctly handles multiple
tabs/devices — a user counts as online while *any* socket is open, and disconnecting
one tab doesn't mark them offline if another tab is still connected. `admin:global`
receives `presence:update` with the live online-user count on every connect/disconnect.

**Missed events on reconnect**: the client emits `activity:sync` after connecting; the
server responds with the latest 20 `ActivityLog` rows the user is authorized to see,
queried fresh from Postgres via the exact same visibility rule used by
`GET /api/activity` (`activity.service.buildVisibilityWhere`). Nothing is ever served
from an in-memory cache.

No polling, no SSE anywhere in the codebase.

## 10. Background job architecture

`src/jobs/overdueTask.job.ts`, scheduled with `node-cron` (`* * * * *`, every minute):

1. Query tasks where `dueDate < now` and `status NOT IN (DONE, OVERDUE)`.
2. For each candidate, `updateMany({ where: { id, status: { notIn: [DONE, OVERDUE] } } })`
   — the `where` re-checks the status at write time, so if two sweeps overlap (or the
   job is manually re-triggered), only the first write actually changes anything; the
   second sees `count: 0` and skips creating a duplicate `ActivityLog`/notification.
   This is what makes the job **idempotent and safe to run repeatedly**, without needing
   a distributed lock.
3. Writes exactly one `ActivityLog` per task that actually transitioned, attributed to
   a synthetic, non-loginable `system@internal.local` actor (`isActive: false`, so it
   can never authenticate even if someone learned its email).
4. Emits the same `activity:new` event real status changes use, so the dashboard
   updates live without a page load.

## 11. Indexing decisions

| Index | Why |
|---|---|
| `User.email` (unique) | Every login does `findUnique({ where: { email } })` |
| `Task.projectId` | Listing a project's tasks; also the FK |
| `Task.assignedDeveloperId` | Developer's "my tasks" view is the hottest query in the app |
| `Task.status`, `Task.priority`, `Task.dueDate` | All three are exposed as filter query params (`GET /api/tasks?status=&priority=&dueDateFrom=&dueDateTo=`) and are also scanned every minute by the overdue-sweep job |
| `ActivityLog.projectId` | PM's project activity feed |
| `ActivityLog.createdAt` | Every activity list is ordered by recency; also backs the "latest 20" reconnect query |
| `Notification.userId`, `Notification.(userId, read)` composite | Every notification query is scoped to the current user; the composite index makes the unread-count query (`WHERE userId = ? AND read = false`) an index-only scan |

## 12. API endpoints

Base path: `/api`. All responses follow:
```json
{ "success": true, "data": ..., "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
{ "success": false, "error": { "code": "SOME_CODE", "message": "..." } }
```

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | — | forces role=DEVELOPER |
| POST | `/auth/login` | — | sets refresh cookie |
| POST | `/auth/refresh` | cookie | rotates refresh token |
| POST | `/auth/logout` | cookie | revokes refresh token |
| GET | `/users/me` | any | own profile |
| POST/GET/GET/PATCH | `/users`, `/users`, `/users/:id`, `/users/:id` | ADMIN | user management |
| POST/GET/GET/PATCH/DELETE | `/clients...` | ADMIN (read: +PM) | client management |
| POST/GET/GET/PATCH/DELETE | `/projects...` | ADMIN, PM (own only) | project management |
| POST/GET/GET/PATCH/DELETE | `/tasks...` | ADMIN, PM (own projects) | GET open to all roles, scoped in service |
| PATCH | `/tasks/:id/status` | any | developer limited to own assigned task |
| GET | `/activity?projectId=&page=&limit=` | any | scoped per role |
| GET | `/notifications`, `/notifications/unread-count` | any | own notifications |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | any | own notifications |

Task filtering: `GET /api/tasks?status=IN_PROGRESS&priority=HIGH&dueDateFrom=...&dueDateTo=...&page=1&limit=20`
— all query params validated server-side with Zod (`task.validator.ts`).

## 13. Testing

```bash
# point DATABASE_URL (in .env) at a disposable test database first
npm run prisma:migrate:deploy
npm test
```

`tests/` covers the required security cases: cross-role/ownership access denial (403/404),
invalid JWT rejection, refresh-token requirement, ActivityLog creation on status change,
Socket.io room-based authorization (authorized users receive `activity:new`, unauthorized
users do not), Postgres-sourced reconnect sync, notification unread-count updates, and
overdue-job correctness + idempotency.

## 14. Known limitations

- Single Postgres instance / no read replicas — fine for a practice project, not for
  horizontal socket scaling (would need the Socket.io Redis adapter across instances).
- No rate limiting on `/api/auth/*` — add `express-rate-limit` before any real deployment.
- Refresh-token theft detection revokes all sessions for a user but doesn't yet alert
  the user (e.g. via email) that this happened.
- No file/attachment support on tasks.
- No soft-deletes — `DELETE` endpoints are hard deletes (mitigated by `Restrict`/`Cascade`
  FK rules to prevent orphaned data, not accidental loss).
- Presence is in-memory and per-process; behind multiple API instances it would need a
  shared store (e.g. Redis) to report accurate online counts.

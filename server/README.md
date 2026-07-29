# RoomFlow — Backend API (Phase 0 Foundation)

Production-ready Node/Express foundation for **RoomFlow – Smart Room Booking Management Portal**, built strictly to the frozen [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

> **Phase 0 scope:** foundation only — configuration, middleware pipeline, error/logging/validation architecture, service scaffolds, health endpoint. **No authentication, models, controllers, or business logic** (those arrive in Phases 1+).

---

## Tech Stack

Node.js · Express 4 · MongoDB · Mongoose · JWT (reserved) · Cookie Parser · Morgan · Helmet · CORS · dotenv · Multer · Cloudinary · Nodemailer · Winston · Zod · express-rate-limit · express-mongo-sanitize · hpp · compression

ES Modules (`"type": "module"`).

---

## Folder Structure

```
server/
├── src/
│   ├── config/          env · db · logger · corsOptions · cloudinary · mailer
│   ├── constants/       httpStatus · roles · auditActions
│   ├── controllers/     (Phase 1+)
│   ├── middleware/       requestLogger · rateLimiter · sanitize · validate ·
│   │                     upload · notFound · errorHandler
│   ├── models/          (Phase 1+)
│   ├── routes/          index.js → v1/ (health)
│   ├── services/        email · upload · audit (foundations)
│   ├── validations/     common.validation.js
│   ├── utils/           ApiError · ApiResponse · asyncHandler
│   ├── templates/emails/(Phase 4)
│   ├── jobs/            (Phase 4)
│   ├── seeds/           (Phase 1+)
│   ├── app.js           Express instance (no listen — testable)
│   └── server.js        Bootstrap: connect DB → listen → graceful shutdown
├── tests/               (Phase 8)
├── .env.example
├── package.json
└── README.md
```

Layering (ARCHITECTURE.md §3.2, §15): **Routes → Controller → Service → Model**, dependencies point downward only.

---

## Setup

**Prerequisites:** Node ≥ 18, a MongoDB URI (Atlas or local).

```bash
cd server
npm install
cp .env.example .env
```

Fill `.env` (at minimum `MONGO_URI`, `CLIENT_URL`, and the two `JWT_*_SECRET` values — config validation fails fast if any required var is missing).

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Scripts

| Script | Command | Purpose |
|---|---|---|
| Development | `npm run dev` | nodemon hot-reload |
| Production | `npm start` | `node src/server.js` |
| Lint | `npm run lint` | ESLint |
| Lint fix | `npm run lint:fix` | ESLint autofix |
| Format | `npm run format` | Prettier write |
| Format check | `npm run format:check` | Prettier verify |

---

## Verify It Runs

```bash
npm run dev
```

Then:

```bash
curl http://localhost:5000/api/v1/health
```

Expected:

```json
{
  "success": true,
  "message": "RoomFlow API is healthy",
  "data": { "status": "ok", "env": "development", "uptime": 3, "db": "connected", "timestamp": "…" }
}
```

`GET /api/v1/health/ready` returns `503` until MongoDB is connected.

---

## What Phase 0 Delivers

| Concern | File(s) | ARCHITECTURE.md |
|---|---|---|
| Env validation (fail-fast) | `config/env.js` | §15.3 |
| DB connection + pooling | `config/db.js` | §5.3, §24.1 |
| Logging + secret redaction | `config/logger.js` | §17.2.5 |
| CORS allowlist | `config/corsOptions.js` | §23 #14 |
| Cloudinary / Mailer adapters | `config/cloudinary.js`, `config/mailer.js` | §6, ADR-13 |
| Middleware pipeline | `app.js` + `middleware/*` | §17.1 |
| Error architecture | `middleware/errorHandler.js`, `utils/ApiError.js` | §17.2.4 |
| Validation architecture | `middleware/validate.js`, `validations/common.validation.js` | §17.2.3 |
| Response envelope | `utils/ApiResponse.js` | §10.1 |
| API versioning | `routes/index.js` (`/api/v1`) | §22 |
| Security config | helmet · rate limit · sanitize · hpp | §23 |
| File upload architecture | `middleware/upload.js`, `services/upload.service.js` | §17.2.7 |
| Email architecture | `services/email.service.js` | §6 |
| Audit foundation (append-only) | `services/audit.service.js` | §18.5 |
| Health check | `routes/v1/health.routes.js` | §4.5 |
| Graceful shutdown | `server.js` | §15.3 |

---

## Not in Phase 0 (Next Phases)

Authentication & JWT (Phase 1) · Models (§18) · Controllers & business services · Booking conflict engine (§20) · Notifications & jobs (Phase 4) · Reports (Phase 6). Module routers plug into `routes/v1/index.js` one line at a time.

---

## Deployment (later)

Render — root `server`, build `npm ci`, start `node src/server.js`, health path `/api/v1/health`. All secrets set as env vars. See ARCHITECTURE.md §25.

# React Redux PostgreSQL

Full-stack template: **React** (Next.js) + **Redux Toolkit** on the frontend, **Express** + **PostgreSQL** on the backend.

## Structure

- `client/` — Next.js app (App Router, Redux Toolkit, React-Redux). Static export in `client/out`; Express serves it in production.
- `server/` — Express API and PostgreSQL via `pg`
  - `server/src/schema/` — Table schemas (column metadata + DDL). Each table has a folder (e.g. `items/index.js`) and shared helpers in `helpers.js`.
- `scripts/` — Installation scripts for Node, npm, and PostgreSQL
- `e2e/` — Playwright end-to-end tests

## Prerequisites: Node, npm, PostgreSQL

Use the scripts in `scripts/` to install them on your OS (npm is included with Node):

| OS       | Script                    | How to run |
|----------|---------------------------|------------|
| Windows  | `scripts/install-windows.ps1` | In PowerShell (Admin optional): `.\scripts\install-windows.ps1` |
| Linux    | `scripts/install-linux.sh`   | `sudo bash scripts/install-linux.sh` |
| macOS    | `scripts/install-mac.sh`     | `bash scripts/install-mac.sh` (requires [Homebrew](https://brew.sh)) |

After running, restart your terminal and check: `node --version`, `npm --version`, `psql --version`.

**Windows:** To set a known default password for the `postgres` user (e.g. `postgres`/`postgres`) after installing PostgreSQL, run **PowerShell as Administrator**: `.\scripts\set-postgres-default-password.ps1` (or `.\scripts\set-postgres-default-password.ps1 -Password "mypassword"`).

## Setup

### 1. Install dependencies

```bash
npm run install:all
```

Or install manually:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2. PostgreSQL

The server **creates the database and tables automatically** on startup (using `PG_DATABASE` or the DB name in `DATABASE_URL`, and DDL from `server/src/schema/`). No need to run init scripts manually unless you prefer. Use the `postgres` user and your password. **Set a default password** on Windows: run as Admin `.\scripts\set-postgres-default-password.ps1` for `postgres`/`postgres`. **Password authentication failed?** See [scripts/reset-postgres-password-windows.md](scripts/reset-postgres-password-windows.md).

### 3. Environment

Copy the example env and set your database URL:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with either:

- **Option A** — separate vars (recommended): `PG_USER`, `PG_PASSWORD`, `PG_HOST`, `PG_PORT`, `PG_DATABASE`. The app builds the connection URL from these.
- **Option B** — full URL: `DATABASE_URL=postgresql://user:password@localhost:5432/react_template`

Also set `PORT=3001` (optional) for the API server.

For **auth** (signup, login, email verification, password reset), set in `server/.env`:

- **`JWT_SECRET`** — Secret for signing JWTs (use a long random string in production).
- **`APP_URL`** — Base URL where users open the app (for verification and reset links). In **development** use `http://localhost:5173` (Vite). In **production** use your app URL (e.g. `http://localhost:3001` if you serve the built app from Express, or `https://yourdomain.com`).
- **SMTP** (optional) — If set, verification and password-reset emails are sent. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and optionally `SMTP_FROM`. Without SMTP, signup and login still work; verification emails are skipped.

## Auth (signup, email verification, password reset)

- **Sign up** — `POST /api/auth/signup` with `{ email, password }`. Creates user and sends verification email (if SMTP is configured). Returns `{ user, token }`.
- **Log in** — `POST /api/auth/login` with `{ email, password }`. Returns `{ user, token }`.
- **Me** — `GET /api/auth/me` with `Authorization: Bearer <token>` returns `{ user }` or `{ user: null }`.
- **Verify email** — User clicks link in email; `POST /api/auth/verify-email` with `{ token }` (or `?token=`). Sets `email_verified_at` on the user.
- **Forgot password** — `POST /api/auth/forgot-password` with `{ email }`. Sends reset link by email (if SMTP configured).
- **Reset password** — User clicks link; `POST /api/auth/reset-password` with `{ token, newPassword }`.

Frontend routes: `/signup`, `/login`, `/verify-email?token=`, `/forgot-password`, `/reset-password?token=`. Token is stored in `localStorage` and sent as `Authorization: Bearer` on API requests.

## Server schema

Table definitions live under `server/src/schema/`. Each table has a folder (e.g. `items/`) with an `index.js` that defines the table and reuses shared helpers.

### Table schema file (e.g. `schema/items/index.js`)

- **`tableName`** — Table name string (e.g. `'items'`).
- **`columns`** — Map of column name → metadata. Column metadata can include:
  - **`name`**, **`type`** — Column name and SQL type (e.g. `'SERIAL'`, `'VARCHAR(255)'`, `'TIMESTAMPTZ'`).
  - **`order`** — Numeric order for column order in DDL and constraints (default `0`).
  - **`isNull`**, **`isPrimaryKey`**, **`isDefault`** — Booleans for NOT NULL, PRIMARY KEY, and whether the column has a default.
  - **`defaultExpr`** — Optional SQL expression for DEFAULT (e.g. `'NOW()'`).
  - **`references`** — Optional `{ table, column? }` for foreign keys (`column` defaults to target primary key).
  - **`isUnique`** — Optional; column is a single-column unique constraint.
  - **`uniqueGroup`** — Optional; columns with the same string form one composite unique constraint.
- **`primaryKey`**, **`foreignKeys`**, **`uniqueConstraints`** — Derived from `columns` via helpers (see below).
- **`createTableSql`** — Generated `CREATE TABLE IF NOT EXISTS ...` from `tableName` and `columns`.
- **`seedRows`** — Optional array of row arrays (one per column value in order) for initial seed when the table is empty.

### Schema helpers (`schema/helpers.js`)

- **`getOrderedColumnNames(columns)`** — Column names sorted by each column’s `order`.
- **`getPrimaryKey(columns)`** — Primary key column name(s), ordered by `order` (single string or array for composite).
- **`getForeignKeys(columns)`** — List of `{ column, references }` for columns that have `references`.
- **`getUniqueConstraints(columns)`** — List of column-name arrays: single-column from `isUnique`, composite from shared `uniqueGroup`.
- **`generateCreateTableSql(tableName, columns)`** — Builds `CREATE TABLE IF NOT EXISTS` with columns in `order`.

The server runs `ensureDatabase()` then `ensureSchema()` at startup, which create the DB (if missing) and run each table’s `createTableSql` and optional seed.

## Run

**Both client and server:**

```bash
npm run dev
```

- Frontend: http://localhost:3000 (Next.js dev server; proxies `/api` to the Express server)
- API: http://localhost:3001

**Only client:** `npm run dev:client`  
**Only server:** `npm run dev:server`

## Unit tests

Uses [Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com/react) in the client:

```bash
cd client && npm run test:run
```

Watch mode: `npm run test`.

## E2E tests

Uses [Playwright](https://playwright.dev). Start the app and DB first (or let the runner start them via `webServer`).

```bash
npx playwright install
npm run e2e
```

With UI: `npm run e2e:ui`. The runner starts the dev server automatically unless `CI` is set.

## Build & production

```bash
npm run build
npm run start
```

Then open **http://localhost:3001** — the Express server serves both the API and the built Next.js app from `client/out`. If you run `npm run start` without building first, port 3001 only serves the API (no `GET /`); use **http://localhost:3000** for the app during development (`npm run dev`).

## Hosting (so others can see it)

You need to run **one Node app** (the server) and give it a **PostgreSQL** database. The server already serves the built React app from `client/dist`, so you don’t deploy the client separately.

### Option 1: Render (free tier)

1. **Push your code** to GitHub (or GitLab).
2. **Create a PostgreSQL database**  
   [Render Dashboard](https://dashboard.render.com) → **New +** → **PostgreSQL**. Note the **Internal Database URL** (or External if your app is elsewhere).
3. **Create a Web Service**  
   **New +** → **Web Service** → connect your repo.  
   - **Root Directory:** leave blank.  
   - **Build Command:** `npm run install:all && npm run build` (builds Next.js static export to `client/out`)  
   - **Start Command:** `npm run start`  
   - **Instance type:** Free (or paid).
4. **Environment variables** (in the Web Service → **Environment**):  
   - `NODE_ENV` = `production`  
   - `DATABASE_URL` = (paste the Postgres URL from step 2; use **Internal** if app and DB are both on Render)  
   - `JWT_SECRET` = (generate a long random string, e.g. `openssl rand -hex 32`)  
   - `APP_URL` = `https://YOUR-SERVICE-NAME.onrender.com` (your Web Service URL; replace with your real URL after first deploy)  
   - `PORT` = `3001` (or leave unset; Render sets `PORT` for you)
5. Deploy. After the first deploy, set `APP_URL` to the exact URL Render gives you (for auth links).

### Option 2: Railway

1. Push code to GitHub and open [Railway](https://railway.app).
2. **New Project** → **Deploy from GitHub** and select the repo.
3. Add **PostgreSQL**: in the project, **New** → **Database** → **PostgreSQL**. Railway will set `DATABASE_URL` automatically if you add it to the same project.
4. In your service settings set:  
   **Build:** `npm run install:all && npm run build`  
   **Start:** `npm run start`  
   Add env: `JWT_SECRET`, `APP_URL` = `https://your-app.up.railway.app` (use the URL Railway gives you).
5. Deploy; then set `APP_URL` to the real public URL.

### Option 3: VPS (DigitalOcean, Linode, etc.)

- Create a droplet/VM, install Node and PostgreSQL.
- Clone the repo, run `npm run install:all`, `npm run build`, then `npm run start` (e.g. with `pm2` or systemd).
- Set env in `server/.env` or systemd: `DATABASE_URL`, `JWT_SECRET`, `APP_URL`, `PORT`.
- Put a reverse proxy (e.g. nginx) in front and use SSL (e.g. Let’s Encrypt).

### Checklist for any host

- **Build** the client before starting: `npm run build` (produces `client/out`). The server serves it automatically.
- **APP_URL** must be the exact URL people use (e.g. `https://myapp.onrender.com`) so verification and reset links work.
- **JWT_SECRET** must be a strong random value in production.
- **Database:** use the host’s Postgres URL; the server runs migrations (ensureSchema) on startup.
- Optional: set **SMTP** env vars so verification and password-reset emails are sent.

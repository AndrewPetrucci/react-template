# React Redux PostgreSQL

Full-stack template: **React** (Vite) + **Redux Toolkit** on the frontend, **Express** + **PostgreSQL** on the backend.

## Structure

- `client/` — React app (Vite, Redux Toolkit, React-Redux)
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

- Frontend: http://localhost:5173  
- API: http://localhost:3001 (proxied from client at `/api`)

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

Then open **http://localhost:3001** — the Express server serves both the API and the built React app from `client/dist`. If you run `npm run start` without building first, port 3001 only serves the API (no `GET /`); use **http://localhost:5173** for the app during development.

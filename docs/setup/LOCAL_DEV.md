# QueueFlow Local Development Setup

This guide gets QueueFlow running locally with either in-memory data or Postgres.

## Prerequisites

- Node.js 18+
- npm 9+
- Optional: PostgreSQL 14+ for DB-backed mode

## 1) Install dependencies

```bash
npm install
```

## 2) Choose your data mode

### Option A: In-memory mode (fastest)

No database setup is required. Start the app directly:

```bash
npm run dev
```

### Option B: Postgres mode

1. Ensure PostgreSQL is running.
2. Create a database:

```bash
createdb queueflow
```

3. Add `.env.local` in repo root:

```env
QUEUEFLOW_STORE=postgres
DATABASE_URL=postgres://username:password@localhost:5432/queueflow
```

4. Run migrations:

```bash
npm run db:migrate
```

5. Start app:

```bash
npm run dev
```

## 3) Open app routes

- Booking: `http://localhost:3000/book`
- My spot: `http://localhost:3000/my-spot`
- Admin: `http://localhost:3000/admin`

## 4) Quick smoke test

1. Open `/book` and confirm slots render.
2. Submit a booking with valid details.
3. Use the booking phone number in `/my-spot`.
4. Open `/admin` and verify booking appears.

Or run automated smoke:

```bash
npm run test:smoke
```

The smoke script starts a temporary dev server on port `3000` by default.

## 5) View local data in readable format

With `npm run dev` running, use:

```bash
npm run db:peek
npm run api:bookings:pretty
npm run api:slots:pretty
```

- `db:peek` shows Postgres tables and sample rows.
- `api:bookings:pretty` shows formatted bookings + stats JSON.
- `api:slots:pretty` shows formatted slots JSON.

For table/grid browsing in VS Code:

1. Install recommended extensions from `.vscode/extensions.json`.
2. Open `SQLTools: Show Connections`.
3. Select `QueueFlow Local Postgres` and open table records.

## Troubleshooting

### `Slot not found` or booking failures

- Ensure selected slot still exists and is open.
- Refresh the page to pull latest slots.

### Postgres connection errors

- Verify `DATABASE_URL` credentials.
- Verify `QUEUEFLOW_STORE=postgres` if you want to force DB-backed mode.
- Confirm Postgres is running and reachable.
- Re-run migration if tables are missing.

### Port already in use

Run on another port:

```bash
PORT=3001 npm run dev
```

## Related docs

- DB setup details: `./README_DB.md`
- API contracts: `../api/API_REFERENCE.md`
- Test checklist: `../testing/TEST_PLAN.md`

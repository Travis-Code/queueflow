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
DATABASE_URL=postgres://username:password@localhost:5432/queueflow
```

4. Run migration:

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
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

## Troubleshooting

### `Slot not found` or booking failures

- Ensure selected slot still exists and is open.
- Refresh the page to pull latest slots.

### Postgres connection errors

- Verify `DATABASE_URL` credentials.
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

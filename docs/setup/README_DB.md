# QueueFlow Postgres Setup

## 1. Local Development

- Install Postgres locally (e.g. with Homebrew: `brew install postgresql`)
- Create a database:

```bash
createdb queueflow
```

- Set your `.env.local`:

```
QUEUEFLOW_STORE=postgres
DATABASE_URL=postgres://username:password@localhost:5432/queueflow
```

- Run the migrations:

```bash
npm run db:migrate
```

- Start the app:

```bash
npm run dev
```

- Optional fallback mode:

```env
QUEUEFLOW_STORE=memory
```

If `DATABASE_URL` is present and `QUEUEFLOW_STORE` is not set, QueueFlow automatically uses Postgres.

## 1.1 Inspecting local data

After the app is running, use these commands from repo root:

```bash
npm run db:peek
npm run api:bookings:pretty
npm run api:slots:pretty
```

- `db:peek` prints table structure + sample rows.
- `api:bookings:pretty` and `api:slots:pretty` format API responses for quick checks.

In VS Code, install recommended extensions from `.vscode/extensions.json`, then use `SQLTools: Show Connections` and pick `QueueFlow Local Postgres`.

## 2. Vercel/Cloud

- Use Vercel Postgres, Neon, or Supabase for managed Postgres.
- Set `DATABASE_URL` in Vercel project settings.
- Optionally set `QUEUEFLOW_STORE=postgres` explicitly for clarity.
- Run migrations after provisioning the database:

```bash
npm run db:migrate
```

- Reuse the same schema and adapter path locally and in Vercel for a smooth transition.

## 3. Using the DB Client

- Import from `src/lib/db.ts`:

```ts
import { query } from '@/lib/db';
const { rows } = await query('SELECT * FROM slots WHERE is_open = $1', [true]);
```

- Always use parameterized queries (`$1`, `$2`, ...).

## 4. Next Steps

- Add more migrations as your schema evolves.
- Consider using separate `DATABASE_URL` values for local, preview, and production environments.

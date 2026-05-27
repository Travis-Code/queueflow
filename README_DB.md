# QueueFlow Postgres Setup

## 1. Local Development

- Install Postgres locally (e.g. with Homebrew: `brew install postgresql`)
- Create a database:

```bash
createdb queueflow
```

- Set your `.env.local`:

```
DATABASE_URL=postgres://username:password@localhost:5432/queueflow
```

- Run the migration:

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```

## 2. Vercel/Cloud

- Use Vercel Postgres, Neon, or Supabase for managed Postgres.
- Set the `DATABASE_URL` in Vercel project settings.
- Run migrations using a CI/CD step or manually (see above).

## 3. Using the DB Client

- Import from `src/lib/db.ts`:

```ts
import { query } from '@/lib/db';
const { rows } = await query('SELECT * FROM slots WHERE is_open = $1', [true]);
```

- Always use parameterized queries (`$1`, `$2`, ...).

## 4. Next Steps

- Migrate store logic in `src/lib/store.ts` to use the database.
- Add more migrations as your schema evolves.

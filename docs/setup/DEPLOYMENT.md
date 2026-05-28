# QueueFlow Deployment Guide

This document covers production deployment for QueueFlow and release checklists.

## Target environments

- **App host:** Vercel (recommended) or any Node.js-compatible host
- **Database:** Vercel Postgres, Neon, Supabase, or self-managed Postgres

## Required environment variables

- `DATABASE_URL` (required for Postgres-backed mode)
- `NODE_ENV=production` (set by most hosts automatically)

## Pre-deploy checklist

- [ ] `npm install` completes cleanly
- [ ] `npm run build` succeeds
- [ ] `npm test` succeeds (build + lint + smoke)
- [ ] `migrations/001_init.sql` has been applied to target DB
- [ ] Core routes load (`/book`, `/my-spot`, `/admin`)
- [ ] Booking + cancel + waitlist promotion flow verified

## Vercel deployment flow

1. Connect GitHub repository in Vercel.
2. Set `DATABASE_URL` in Vercel project settings.
3. Trigger deployment from `main` branch.
4. Apply migrations against production DB:

```bash
psql "$DATABASE_URL" -f migrations/001_init.sql
```

5. Run smoke tests on deployed URL.

## Post-deploy smoke test

- [ ] `GET /api/slots` returns data
- [ ] New booking can be created with `POST /api/bookings`
- [ ] Booking lookup works via `/api/waitlist?code=...`
- [ ] Admin slot create/toggle/delete works

## Rollback plan

If a release causes issues:

1. Roll back app deployment to previous stable build.
2. Keep DB schema backward-compatible when possible.
3. If a migration causes issues, restore from DB backup/snapshot.

## Monitoring recommendations

- Add request/error logging for `/api/bookings` and `/api/slots`
- Alert on elevated `5xx` responses
- Track booking success rate and waitlist conversion rate

## Related docs

- Runbook: `../ops/RUNBOOK.md`
- DB setup: `./README_DB.md`
- API reference: `../api/API_REFERENCE.md`

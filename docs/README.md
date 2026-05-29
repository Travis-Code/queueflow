# QueueFlow Documentation

This folder contains all product, technical, and setup documentation.

## Structure

- `guides/`
  - `USER_GUIDE.md` — End-user and admin usage instructions.
- `api/`
  - `API_REFERENCE.md` — Endpoint contracts, payloads, and error responses.
- `ops/`
  - `RUNBOOK.md` — Incident triage, recovery steps, and post-incident checklist.
- `specs/`
  - `FUNCTIONAL_DOC.md` — Functional behavior and product capabilities.
  - `TECHNICAL_DOC.md` — Architecture, data flow, APIs, and system notes.
- `setup/`
  - `LOCAL_DEV.md` — Local development setup for in-memory or Postgres modes, plus smoke checks.
  - `DEPLOYMENT.md` — Production deployment checklist and rollback strategy.
  - `README_DB.md` — Postgres setup, migrations, and adapter integration notes.
- `testing/`
  - `TEST_PLAN.md` — Manual smoke tests, API checks, and release verification steps.
- `diagrams/`
  - `*.png` — Exported chart images for easy viewing.
  - `src/*.mmd` — Mermaid source files used to generate PNGs.

## Diagram Regeneration

Run this from the repo root to regenerate all PNG charts:

```bash
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/booking-flow.mmd -o docs/diagrams/booking-flow.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/admin-flow.mmd -o docs/diagrams/admin-flow.png
npx -y @mermaid-js/mermaid-cli -i docs/diagrams/src/waitlist-promotion-flow.mmd -o docs/diagrams/waitlist-promotion-flow.png
```

## Useful local inspection commands

Run these from repo root while dev server is running:

```bash
npm run db:peek
npm run api:bookings:pretty
npm run api:slots:pretty
```

- `db:peek` prints table names and sample rows from local Postgres.
- `api:bookings:pretty` prints readable bookings + stats JSON.
- `api:slots:pretty` prints readable slots JSON.

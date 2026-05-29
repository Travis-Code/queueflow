
# QueueFlow

QueueFlow is a user-friendly web app for managing bookings, queues, and waitlists for any activity or event. It’s designed for both customers and admins, and works great for things like classes, appointments, or limited-capacity events.

**Built with:** Next.js 15, React, TypeScript, and (optionally) Postgres.

## Latest update (May 2026)

- Refactored service/data access using adapter pattern (`src/lib/adapters/*`)
- Added centralized API validation and error helpers (`src/lib/validation.ts`)
- Standardized API route error handling across bookings/slots/waitlist routes
- Improved queue/waitlist recalculation flow in booking mutations
- Stabilized smoke tests and kept default app/test port on `3000`
- Verified with `npm test` (build + lint + smoke)

---

## What does QueueFlow do?

- Lets users reserve a spot in a time slot, or join a waitlist if full
- Shows users their queue position and booking details
- Lets admins manage slots, bookings, and activity settings in real time
- Automatically promotes waitlisted users when a spot opens up

---

## How it works (for users)

1. **Book a slot:** Pick a time, fill in your info, and confirm your booking. If the slot is full, you can join the waitlist.
2. **Check your spot:** Use your phone number to see your queue position or cancel if needed.
3. **Admins:** Use the admin panel to add/remove slots, see live bookings, and adjust settings.

---

## Project structure & components (explained)

Here’s what each folder/file does, in plain English:

```
src/
├── app/                  # All the main pages and API endpoints
│   ├── api/              # Server-side routes for data (slots, bookings, waitlist)
│   │   ├── slots/        # Endpoints for slot CRUD (create, read, update, delete)
│   │   ├── bookings/     # Endpoints for booking CRUD and status
│   │   └── waitlist/     # Endpoint for checking waitlist/booking by phone number
│   ├── book/             # The main booking page (user flow)
│   ├── my-spot/          # Lets users check or cancel their spot
│   └── admin/            # Admin dashboard for managing everything
├── components/           # All the building blocks for the UI
│   ├── booking/          # Booking-related UI (slot grid, form, queue position)
│   │   ├── SlotGrid.tsx      # Shows all available time slots
│   │   ├── BookingForm.tsx   # The form users fill out to book or waitlist
│   │   └── QueuePosition.tsx # Shows user’s queue/waitlist position
│   ├── admin/            # Admin-only UI (queue list, slot controls)
│   │   ├── AdminQueue.tsx    # Live list of all bookings
│   │   └── AdminSlots.tsx    # Add, open/close, or delete slots
│   └── ui/               # Shared UI (navigation bar, etc)
│       └── Nav.tsx           # The top navigation bar
├── lib/                  # Logic, services, adapters, and DB access
│   ├── adapters/         # Data layer abstraction (in-memory now, DB adapter-ready)
│   ├── services/         # Booking/slot/config/stats business logic
│   ├── validation.ts     # Shared API request validation helpers
│   └── db.ts             # Postgres connection and query helper
├── types/                # TypeScript types shared across the app
│   └── index.ts
└── migrations/           # (If using Postgres) SQL files for database setup
```

---

## Quick start for users

1. Install dependencies:
  ```bash
  npm install
  ```
2. Start the app:
  ```bash
  npm run dev
  ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Documentation

- Docs index: [`docs/README.md`](./docs/README.md)
- User guide: [`docs/guides/USER_GUIDE.md`](./docs/guides/USER_GUIDE.md)
- Functional spec: [`docs/specs/FUNCTIONAL_DOC.md`](./docs/specs/FUNCTIONAL_DOC.md)
- Technical spec: [`docs/specs/TECHNICAL_DOC.md`](./docs/specs/TECHNICAL_DOC.md)
- DB setup: [`docs/setup/README_DB.md`](./docs/setup/README_DB.md)
- Diagram exports (PNG): [`docs/diagrams`](./docs/diagrams)

## Features

- **Book a slot** — browse time slots, select one, fill in details, confirm or join waitlist
- **My spot** — check queue position via phone number, cancel booking
- **Admin panel** — live queue view, slot management (add/toggle/delete), activity settings
- **Waitlist promotion** — when a confirmed booking is cancelled, the next waitlisted person is automatically promoted

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/book`.

## View live data (human-readable)

Use these commands while `npm run dev` is running:

```bash
npm run db:peek
npm run api:bookings:pretty
npm run api:slots:pretty
```

- `db:peek` prints Postgres table summaries (`slots`, `bookings`, `activity_config`)
- `api:bookings:pretty` pretty-prints `GET /api/bookings?stats=true`
- `api:slots:pretty` pretty-prints `GET /api/slots`

## View DB in VS Code

Workspace settings include local Postgres connection defaults in `.vscode/settings.json`.

1. Install recommended extensions from `.vscode/extensions.json`
2. Run `SQLTools: Show Connections`
3. Open `QueueFlow Local Postgres`
4. Browse `public` tables and use **Show Table Records**

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── slots/          # GET /api/slots, POST, PATCH, DELETE
│   │   ├── bookings/       # GET /api/bookings, POST, PATCH, DELETE
│   │   └── waitlist/       # GET /api/waitlist?code=QF-XXXX
│   ├── book/               # User booking flow
│   ├── my-spot/            # Queue position lookup
│   └── admin/              # Admin dashboard
├── components/
│   ├── booking/
│   │   ├── SlotGrid.tsx    # Time slot picker
│   │   ├── BookingForm.tsx # User details & submission
│   │   └── QueuePosition.tsx # Live position display
│   ├── admin/
│   │   ├── AdminQueue.tsx  # Live bookings list
│   │   └── AdminSlots.tsx  # Slot management
│   └── ui/
│       └── Nav.tsx         # Top navigation
├── lib/
│   ├── adapters/           # StoreAdapter + in-memory implementation
│   ├── services/           # Domain/business logic
│   └── validation.ts       # Request validation + standardized API errors
└── types/
    └── index.ts            # Shared TypeScript types
```

## Swapping in a real database

Data access now goes through `StoreAdapter` (`src/lib/adapters/types.ts`) and is resolved via `src/lib/adapters/index.ts`.

Current default is `InMemoryAdapter` (`src/lib/adapters/inMemory.ts`).
To use Postgres fully, add a `PostgresAdapter` implementing `StoreAdapter` and switch resolver logic in `src/lib/adapters/index.ts` based on environment.

## Extending for new activity types

1. Add a new field to `ActivityConfig` in `src/types/index.ts`
2. Expose it in `GET /api/config` (add this route as needed)
3. Conditionally render UI based on the config in page components

## Future plans

- Add production deployment on Vercel with managed Postgres
- Add preview deployments for pull requests
- Add admin authentication before public release
- Add observability (error tracking + API monitoring)

### Planned Vercel deployment steps

1. Create a managed Postgres instance (Neon, Supabase, or Vercel Postgres).
2. Run migrations against that database:

```bash
DATABASE_URL='postgres://<user>:<pass>@<host>/<db>?sslmode=require' npm run db:migrate
```

3. In Vercel, import this GitHub repository and set environment variables:
  - `DATABASE_URL`
  - `QUEUEFLOW_STORE=postgres`
4. Deploy from `main`.
5. Verify production endpoints:
  - `GET /api/slots`
  - `GET /api/bookings?stats=true`
6. Run smoke checks on the deployed URL.

For detailed production guidance, see `docs/setup/DEPLOYMENT.md`.

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/slots` | List all slots (optional `?date=YYYY-MM-DD`) |
| POST | `/api/slots` | Create a slot `{ time, date, capacity?, durationMinutes? }` |
| PATCH | `/api/slots/:id` | Update slot fields |
| DELETE | `/api/slots/:id` | Delete a slot |
| GET | `/api/bookings` | List bookings (optional `?slotId=`, `?stats=true`) |
| POST | `/api/bookings` | Create booking `{ slotId, firstName, lastName, email, phoneNumber, partySize, joinWaitlist? }` |
| PATCH | `/api/bookings/:id` | `{ action: 'cancel' }` |
| DELETE | `/api/bookings/:id` | Hard-remove (admin) |
| GET | `/api/waitlist?phoneNumber=...` | Lookup booking by phone number |

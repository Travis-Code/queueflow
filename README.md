# QueueFlow

A modular queue & booking application built with Next.js 14, React, and TypeScript.

## Features

- **Book a slot** — browse time slots, select one, fill in details, confirm or join waitlist
- **My spot** — check queue position via confirmation code, cancel booking
- **Admin panel** — live queue view, slot management (add/toggle/delete), activity settings
- **Waitlist promotion** — when a confirmed booking is cancelled, the next waitlisted person is automatically promoted

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/book`.

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
│   └── store.ts            # In-memory data layer (swap for DB here)
└── types/
    └── index.ts            # Shared TypeScript types
```

## Swapping in a real database

All data access is isolated to `src/lib/store.ts`. To use Postgres (via Prisma), replace each function with a Prisma query:

```ts
// Before (in-memory)
export function getSlots() { return slots; }

// After (Prisma)
export async function getSlots() {
  return prisma.slot.findMany();
}
```

Update the API routes to `await` the async store functions and you're done.

## Extending for new activity types

1. Add a new field to `ActivityConfig` in `src/types/index.ts`
2. Expose it in `GET /api/config` (add this route as needed)
3. Conditionally render UI based on the config in page components

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/slots` | List all slots (optional `?date=YYYY-MM-DD`) |
| POST | `/api/slots` | Create a slot `{ time, date, capacity?, durationMinutes? }` |
| PATCH | `/api/slots/:id` | Update slot fields |
| DELETE | `/api/slots/:id` | Delete a slot |
| GET | `/api/bookings` | List bookings (optional `?slotId=`, `?stats=true`) |
| POST | `/api/bookings` | Create booking `{ slotId, firstName, lastName, email, partySize, joinWaitlist? }` |
| PATCH | `/api/bookings/:id` | `{ action: 'cancel' }` |
| DELETE | `/api/bookings/:id` | Hard-remove (admin) |
| GET | `/api/waitlist?code=QF-XXXX` | Lookup booking by code |

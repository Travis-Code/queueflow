# QueueFlow Test Plan

This plan defines minimum checks for safe releases and future automation.

## 1) Scope

- Slot availability and booking lifecycle
- Waitlist join and promotion behavior
- Booking lookup and cancellation
- Admin slot management actions
- API contract behavior and error handling

## 2) Test levels

### Manual smoke tests (required every release)

- [ ] Open `/book` and verify slots load.
- [ ] Create a booking with valid user info.
- [ ] Verify confirmation code + queue position appears.
- [ ] Lookup booking in `/my-spot` using confirmation code.
- [ ] Cancel booking and verify updated status.
- [ ] Fill a slot and verify waitlist path works.
- [ ] Cancel confirmed booking and verify waitlist promotion.
- [ ] Create/toggle/delete slot from `/admin`.

### API checks (recommended every release)

- [ ] `GET /api/slots` returns `200` and array payload.
- [ ] `POST /api/bookings` valid payload returns `201`.
- [ ] Invalid/malformed booking payload returns `400`.
- [ ] Business-rule validation errors return `422`.
- [ ] Unknown slot ID returns `422`.
- [ ] Confirmation lookup returns `200` for valid code.

## 3) Regression focus areas

- Deterministic slot IDs and slot lookup stability
- Queue position recalculation after cancellation
- Waitlist promotion ordering
- Postgres fallback behavior when DB unavailable

## 4) Suggested automation roadmap

1. **API integration tests** for booking/slot/waitlist routes.
2. **UI tests** for `/book` and `/my-spot` critical flows.
3. **Admin tests** for slot CRUD and queue rendering.
4. **E2E tests** for full lifecycle: book -> lookup -> cancel -> promote.

## 5) Exit criteria for release

A release is considered acceptable when:

- All manual smoke checks pass.
- No blocking API errors are present.
- Booking and waitlist lifecycle completes without data corruption.

## 6) Refactor verification (current release)

Use this checklist to validate the recent service-layer/backend refactor before merge or deploy.

### Step A: install and build

Run from repo root:

```bash
npm install
npm run build
```

Expected:

- Install completes without `ERESOLVE` errors.
- Build completes with successful compile, lint, and type checks.

### Step B: run app locally

```bash
npm run dev
```

Expected:

- App starts on `http://localhost:3000`.
- No immediate server startup errors.

### Step C: API booking smoke test

In another terminal (keep dev server running):

```bash
SLOT_ID=$(curl -s http://localhost:3000/api/slots | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const slots=JSON.parse(d);process.stdout.write(slots[0]?.id ?? '');});")
echo "slot:$SLOT_ID"

curl -s -o /tmp/queueflow-booking.json -w "status:%{http_code}\n" -X POST http://localhost:3000/api/bookings \
	-H 'Content-Type: application/json' \
	-d "{\"slotId\":\"$SLOT_ID\",\"firstName\":\"Refactor\",\"lastName\":\"Test\",\"email\":\"refactor@example.com\",\"partySize\":1}"

cat /tmp/queueflow-booking.json
```

Expected:

- `status:201`
- Response contains `booking.id`, `booking.confirmationCode`, and updated `slot.bookedCount`.

### Step D: lookup + cancel test

Use returned booking ID and confirmation code:

```bash
curl -s "http://localhost:3000/api/waitlist?code=<CONFIRMATION_CODE>"

curl -s -X PATCH "http://localhost:3000/api/bookings/<BOOKING_ID>" \
	-H 'Content-Type: application/json' \
	-d '{"action":"cancel"}'

curl -s "http://localhost:3000/api/bookings?stats=true"
```

Expected:

- Lookup returns the booking.
- Cancel returns booking with `status: "cancelled"`.
- Stats endpoint returns both `bookings` and `stats` payloads.

### Step E: UI regression checks

- [ ] Open `/book` and create booking successfully.
- [ ] Open `/my-spot`, find booking by confirmation code.
- [ ] Cancel from `/my-spot` and confirm status changes.
- [ ] Open `/admin` and verify queue + slot controls still function.
- [ ] Toggle a slot open/closed and verify state reflects on `/book`.

### Step F: waitlist promotion check

- [ ] Create or identify a full slot.
- [ ] Add one waitlisted booking to that slot.
- [ ] Cancel a confirmed booking in the same slot.
- [ ] Verify next waitlisted booking is promoted when capacity allows.
- [ ] Verify queue/waitlist positions are recalculated correctly.

### Pass criteria for this refactor

This refactor is considered verified when all of these are true:

- `npm run build` passes.
- Core API flow (`slots -> booking -> lookup -> cancel`) passes.
- UI user/admin flows pass without runtime errors.
- Waitlist promotion and position updates behave correctly.

## Related docs

- User workflows: `../guides/USER_GUIDE.md`
- API contracts: `../api/API_REFERENCE.md`
- Production operations: `../ops/RUNBOOK.md`

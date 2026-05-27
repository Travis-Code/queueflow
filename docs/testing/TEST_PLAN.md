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
- [ ] Invalid booking payload returns `400`.
- [ ] Unknown slot ID returns `404`.
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

## Related docs

- User workflows: `../guides/USER_GUIDE.md`
- API contracts: `../api/API_REFERENCE.md`
- Production operations: `../ops/RUNBOOK.md`

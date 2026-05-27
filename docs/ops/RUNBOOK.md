# QueueFlow Operations Runbook

This runbook provides quick response steps for common production issues.

## 1) Incident severity

- **SEV-1:** Booking creation unavailable for all users
- **SEV-2:** Partial outage (e.g., admin actions failing)
- **SEV-3:** Non-critical defects or degraded UX

## 2) Triage checklist

1. Confirm impact scope (all users vs subset).
2. Check API health quickly:
   - `GET /api/slots`
   - `POST /api/bookings`
3. Review recent deploy/change history.
4. Check DB connectivity and migration state.

## 3) Common incidents

### A) Booking creation failing (`POST /api/bookings`)

- Check server logs for validation or DB errors.
- Validate incoming payload has required fields.
- Confirm target slot exists and `isOpen=true`.
- If DB outage suspected, verify `DATABASE_URL` and DB availability.

### B) Slot data not loading (`GET /api/slots`)

- Check API route logs and error responses.
- Verify DB table `slots` exists and has data.
- Re-apply migration if schema drift occurred.

### C) Waitlist not promoting after cancellation

- Verify cancellation request reached booking action endpoint.
- Confirm slot has waiting entries.
- Inspect store logic execution path for promotion and queue recalculation.

## 4) Recovery actions

- Restart app service if process is unhealthy.
- Roll back to previous deployment if issue is release-induced.
- Restore DB from latest snapshot only for data integrity events.

## 5) Communication template

- **Status:** Investigating / Identified / Monitoring / Resolved
- **Impact:** What users are affected
- **ETA:** Next update time
- **Mitigation:** Temporary workaround, if any

## 6) Post-incident checklist

- [ ] Root cause documented
- [ ] Corrective fix shipped
- [ ] Test case added to prevent recurrence
- [ ] Runbook updated with new learnings

## Related docs

- Deployment flow: `../setup/DEPLOYMENT.md`
- Test plan: `../testing/TEST_PLAN.md`
- Technical internals: `../specs/TECHNICAL_DOC.md`

# QueueFlow API Reference

Base URL (local): `http://localhost:3000`

## Conventions

- All request/response bodies are JSON.
- IDs are UUIDs or deterministic slot IDs depending on endpoint source.
- Booking lookup uses the phone number used during booking.
- Error responses are standardized as:

```json
{ "error": "message", "code": "ERROR_CODE", "timestamp": "ISO-8601" }
```

## `GET /api/slots`

List slots, optionally filtered by date.

### Query params

- `date` (optional): `YYYY-MM-DD`

### Success `200`

```json
[
  {
    "id": "slot:2026-05-26:9:00-am",
    "time": "9:00 AM",
    "date": "2026-05-26",
    "capacity": 12,
    "bookedCount": 4,
    "isOpen": true,
    "durationMinutes": 30
  }
]
```

## `POST /api/slots`

Create a new slot.

### Request body

```json
{
  "time": "1:00 PM",
  "date": "2026-05-26",
  "capacity": 12,
  "durationMinutes": 30
}
```

### Success `201`

Returns created `TimeSlot` object.

## `PATCH /api/slots/:id`

Update slot properties.

### Request body (example)

```json
{
  "isOpen": false
}
```

### Success `200`

Returns updated `TimeSlot` object.

## `DELETE /api/slots/:id`

Delete a slot.

### Success `200`

```json
{ "success": true }
```

## `GET /api/bookings`

List bookings. Admin-oriented endpoint.

### Query params (implementation-dependent)

- `slotId` (optional)
- `stats=true` (optional) for aggregated queue stats

### Success `200`

Returns either booking list or stats payload depending on query.

## `POST /api/bookings`

Create a booking or waitlist entry.

### Request body

```json
{
  "slotId": "slot:2026-05-26:9:00-am",
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "phoneNumber": "+15551234567",
  "partySize": 1,
  "joinWaitlist": false,
  "notes": "Optional"
}
```

### Success `201`

```json
{
  "booking": {
    "id": "...",
    "status": "confirmed",
    "queuePosition": 5
  },
  "slot": {
    "id": "slot:2026-05-26:9:00-am",
    "bookedCount": 5
  }
}
```

### Common error responses

- `400`: invalid payload (missing required fields, malformed body)
- `422`: validation/business rule failures (invalid email, invalid phone number, slot not found/closed, waitlist disabled, party-size limits)

## `PATCH /api/bookings/:id`

Perform booking actions (e.g., cancel).

### Request body

```json
{ "action": "cancel" }
```

### Success `200`

Returns cancellation result payload, including updated booking and optional promoted booking.

## `DELETE /api/bookings/:id`

Admin hard-delete for a booking.

### Success `200`

```json
{ "success": true }
```

## `GET /api/waitlist?phoneNumber=%2B15551234567`

Lookup booking/waitlist details by phone number.

### Success `200`

Returns booking object including `status`, `queuePosition`, and optional `waitlistPosition`.

### Query params

- `phoneNumber`: phone number used during booking

### Common error responses

- `400`: missing lookup parameter
- `422`: invalid phone number format

### Error `404`

```json
{ "error": "Booking not found", "code": "NOT_FOUND", "timestamp": "..." }
```

## Related docs

- Functional behavior: `../specs/FUNCTIONAL_DOC.md`
- Technical details: `../specs/TECHNICAL_DOC.md`
- Incident handling: `../ops/RUNBOOK.md`

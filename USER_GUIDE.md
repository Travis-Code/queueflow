# QueueFlow User Guide

This guide explains how to use QueueFlow as a customer and as an admin.

## 1) Customer: Reserve a spot

1. Open the app at `http://localhost:3000`.
2. Go to the **Book** tab.
3. Select an available time slot.
4. Fill in your details:
   - First name (required)
   - Last name (optional)
   - Email (required)
   - Party size
   - Notes (optional)
5. Choose one of the actions:
   - **Confirm booking** if the slot has capacity.
   - **Join waitlist** if you prefer to waitlist or if a slot is full.

After success, QueueFlow shows your confirmation details and queue position.

## 2) Customer: Check your queue status

1. Go to **My spot**.
2. Enter your confirmation code (format like `QF-1234`).
3. View your status:
   - `confirmed`
   - `waiting`
   - `cancelled`
4. If needed, cancel your booking from this page.

## 3) Waitlist behavior

- If a slot is full, customers can join the waitlist.
- If a confirmed booking is cancelled, QueueFlow can promote the next waiting person when capacity allows.
- Promoted users move from `waiting` to `confirmed`.

## 4) Admin: Manage queue and slots

Go to the **Admin** tab to:

- View live bookings and statuses.
- Create new time slots.
- Open/close existing slots.
- Delete slots.
- Adjust activity settings such as default capacity and waitlist behavior.

## 5) Troubleshooting

### Booking fails

- Make sure a slot is selected.
- Ensure required fields are filled (`firstName`, `email`).
- Confirm party size is greater than 0.

### I do not see recent changes

- Hard refresh your browser.
- Restart the dev server:

```bash
npm run dev
```

### Confirmation code not found

- Re-check the exact code format (example: `QF-4821`).
- Ensure the booking was created successfully before lookup.

## 6) Developer quick start

Use these commands to run QueueFlow locally:

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000/book`
- `http://localhost:3000/my-spot`
- `http://localhost:3000/admin`

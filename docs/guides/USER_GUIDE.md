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
2. Enter your phone number used for the booking.
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
- Ensure required fields are filled (`firstName`, `email`, `phone number`).
- Confirm email is valid (example: `name@example.com`).
- Confirm phone number is valid and includes at least 10 digits.
- Confirm party size is greater than 0 and does not exceed configured max.

### I do not see recent changes

- Hard refresh your browser.
- Restart the dev server:

```bash
npm run dev
```

### Phone number not found

- Re-check the phone number format and include the same digits used during booking.
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

## 7) Quick test checklist (manual QA)

Use this checklist for a fast validation pass:

- [ ] Open `http://localhost:3000/book` and confirm slots load.
- [ ] Select an open slot and submit a valid booking.
- [ ] Verify success screen shows booking details and queue position.
- [ ] Go to `/my-spot`, enter the phone number used for the booking, and confirm lookup works.
- [ ] Cancel the booking from `/my-spot` and verify status updates.
- [ ] Try booking a full slot and confirm waitlist path works.
- [ ] Open `/admin` and verify bookings list reflects latest actions.
- [ ] Create a new slot in admin and confirm it appears on `/book`.
- [ ] Toggle a slot open/closed in admin and verify UI state changes.

Expected result: booking lifecycle and admin controls work end-to-end without API errors.

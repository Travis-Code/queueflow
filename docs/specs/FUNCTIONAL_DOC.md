# QueueFlow Functional Document

## Overview

QueueFlow is a web application for managing bookings, queues, and waitlists for events or activities with limited capacity. It supports both customer and admin roles, providing real-time slot management, booking, and queue status updates.

---

## Core Features

- **Slot Booking:** Users can browse available time slots, book a spot, or join a waitlist if a slot is full.
- **Queue Position Tracking:** Users receive a confirmation code and can check their booking or waitlist status at any time.
- **Admin Dashboard:** Admins can add, open/close, or delete slots, and view/manage all bookings and waitlists in real time.
- **Waitlist Promotion:** When a booking is cancelled, the next user on the waitlist is automatically promoted to a confirmed spot.
- **Configurable Activity Settings:** Admins can adjust slot capacity, duration, waitlist behavior, and other activity parameters.

---

## User Flows

### Customer

1. **Book a Slot**
   - Select a time slot on the booking page.
   - Enter required details (first name, email, party size).
   - Confirm booking or join the waitlist if the slot is full.
   - Receive a confirmation code and queue position.

2. **Check or Cancel Booking**
   - Go to "My spot" and enter the confirmation code.
   - View current status (confirmed, waiting, cancelled).
   - Optionally cancel the booking.

### Admin

1. **Manage Slots**
   - Add new time slots with custom capacity and duration.
   - Open or close slots to control availability.
   - Delete slots as needed.

2. **Monitor Bookings**
   - View all bookings and waitlist positions in real time.
   - See live updates as users book, cancel, or are promoted from the waitlist.

3. **Adjust Settings**
   - Change default slot capacity, duration, waitlist rules, and other activity settings.

---

## Technical Structure

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS.
- **Backend:** Next.js API routes, with business logic in services and adapter-based data access.
- **Key Directories:**
  - `src/app/`: Main pages and API endpoints.
  - `src/components/`: UI components for booking, admin, and navigation.
   - `src/lib/`: Adapters, services, validation, and DB access (`adapters/`, `services/`, `validation.ts`, `db.ts`).
  - `src/types/`: Shared TypeScript types.
  - `migrations/`: SQL files for Postgres schema.

---

## Data Model (Simplified)

- **TimeSlot:** Represents a bookable slot (id, time, date, capacity, booked count, open/closed, duration).
- **Booking:** Represents a user's booking or waitlist entry (id, confirmation code, slotId, user info, status, queue position).
- **ActivityConfig:** Settings for the activity (name, description, default capacity, waitlist enabled, etc).

---

## Setup & Usage

1. **Install dependencies:** `npm install`
2. **Start the app:** `npm run dev`
3. **Access the app:** Open `http://localhost:3000` in your browser.

- For Postgres: Set up the database as described in `../setup/README_DB.md` and update `.env.local`.

---

## Documentation

- **User Guide:** `../guides/USER_GUIDE.md` (step-by-step for customers and admins)
- **DB Setup:** `../setup/README_DB.md`
- **Developer Onboarding:** See code comments in all major UI components and `README.md` for structure.

---

// src/lib/store.ts
// ---------------------------------------------------------------------------
// In-memory store — swap any method for a real DB (Postgres, Prisma, etc.)
// by replacing the implementation without changing the public interface.
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import type { TimeSlot, Booking, ActivityConfig, QueueStats } from '@/types';

// ── Seed data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const seedSlots: TimeSlot[] = [
  { id: uuidv4(), time: '9:00 AM',  date: today, capacity: 12, bookedCount: 4,  isOpen: true, durationMinutes: 30 },
  { id: uuidv4(), time: '9:30 AM',  date: today, capacity: 12, bookedCount: 9,  isOpen: true, durationMinutes: 30 },
  { id: uuidv4(), time: '10:00 AM', date: today, capacity: 12, bookedCount: 12, isOpen: true, durationMinutes: 30 },
  { id: uuidv4(), time: '10:30 AM', date: today, capacity: 12, bookedCount: 2,  isOpen: true, durationMinutes: 30 },
  { id: uuidv4(), time: '11:00 AM', date: today, capacity: 12, bookedCount: 7,  isOpen: true, durationMinutes: 30 },
  { id: uuidv4(), time: '11:30 AM', date: today, capacity: 12, bookedCount: 0,  isOpen: true, durationMinutes: 30 },
];

// ── Mutable state ────────────────────────────────────────────────────────────

let slots: TimeSlot[] = [...seedSlots];
let bookings: Booking[] = [];

let config: ActivityConfig = {
  name: 'General Activity',
  description: 'Reserve your spot for the activity.',
  defaultCapacity: 12,
  defaultDurationMinutes: 30,
  waitlistEnabled: true,
  maxPartySize: 6,
  requiresApproval: false,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  return 'QF-' + Math.floor(1000 + Math.random() * 9000);
}

function availableSpots(slot: TimeSlot): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

// ── Slot API ─────────────────────────────────────────────────────────────────

export function getSlots(date?: string): TimeSlot[] {
  return date ? slots.filter(s => s.date === date) : slots;
}

export function getSlotById(id: string): TimeSlot | undefined {
  return slots.find(s => s.id === id);
}

export function createSlot(time: string, date: string, capacity?: number, durationMinutes?: number): TimeSlot {
  const slot: TimeSlot = {
    id: uuidv4(),
    time,
    date,
    capacity: capacity ?? config.defaultCapacity,
    bookedCount: 0,
    isOpen: true,
    durationMinutes: durationMinutes ?? config.defaultDurationMinutes,
  };
  slots.push(slot);
  return slot;
}

export function updateSlot(id: string, updates: Partial<TimeSlot>): TimeSlot | null {
  const idx = slots.findIndex(s => s.id === id);
  if (idx === -1) return null;
  slots[idx] = { ...slots[idx], ...updates };
  return slots[idx];
}

export function deleteSlot(id: string): boolean {
  const before = slots.length;
  slots = slots.filter(s => s.id !== id);
  return slots.length < before;
}

// ── Booking API ──────────────────────────────────────────────────────────────

export function getBookings(slotId?: string): Booking[] {
  return slotId ? bookings.filter(b => b.slotId === slotId) : bookings;
}

export function getBookingByCode(code: string): Booking | undefined {
  return bookings.find(b => b.confirmationCode === code);
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find(b => b.id === id);
}

export interface CreateBookingOptions {
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  partySize: number;
  notes?: string;
  joinWaitlist?: boolean;
}

export function createBooking(opts: CreateBookingOptions): { booking: Booking; slot: TimeSlot } | { error: string } {
  const slot = getSlotById(opts.slotId);
  if (!slot) return { error: 'Slot not found' };
  if (!slot.isOpen) return { error: 'Slot is closed' };

  const avail = availableSpots(slot);
  const isWaiting = opts.joinWaitlist || avail < opts.partySize;

  if (!isWaiting && avail < opts.partySize) {
    return { error: `Only ${avail} spots remaining in this slot` };
  }

  if (isWaiting && !config.waitlistEnabled) {
    return { error: 'Waitlist is not enabled for this activity' };
  }

  const slotBookings = getBookings(opts.slotId);
  const queuePosition = slotBookings.filter(b => b.status === 'confirmed').length + 1;
  const waitlistPosition = isWaiting
    ? slotBookings.filter(b => b.status === 'waiting').length + 1
    : undefined;

  const booking: Booking = {
    id: uuidv4(),
    confirmationCode: generateCode(),
    slotId: opts.slotId,
    slotTime: slot.time,
    slotDate: slot.date,
    firstName: opts.firstName,
    lastName: opts.lastName,
    email: opts.email,
    partySize: opts.partySize,
    status: isWaiting ? 'waiting' : 'confirmed',
    queuePosition,
    waitlistPosition,
    createdAt: new Date().toISOString(),
    notes: opts.notes,
  };

  bookings.push(booking);

  if (!isWaiting) {
    updateSlot(opts.slotId, { bookedCount: slot.bookedCount + opts.partySize });
  }

  const updatedSlot = getSlotById(opts.slotId)!;
  return { booking, slot: updatedSlot };
}

export function cancelBooking(id: string): { booking: Booking; promoted?: Booking } | { error: string } {
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return { error: 'Booking not found' };

  const booking = bookings[idx];
  bookings[idx] = { ...booking, status: 'cancelled' };

  // Release capacity and promote first waitlisted person if any
  if (booking.status === 'confirmed') {
    const slot = getSlotById(booking.slotId);
    if (slot) {
      updateSlot(booking.slotId, { bookedCount: Math.max(0, slot.bookedCount - booking.partySize) });
    }
    const nextWaiting = bookings.find(b => b.slotId === booking.slotId && b.status === 'waiting');
    if (nextWaiting && slot && availableSpots(slot) >= nextWaiting.partySize) {
      const wIdx = bookings.findIndex(b => b.id === nextWaiting.id);
      bookings[wIdx] = { ...nextWaiting, status: 'confirmed', waitlistPosition: undefined };
      updateSlot(booking.slotId, { bookedCount: (getSlotById(booking.slotId)?.bookedCount ?? 0) + nextWaiting.partySize });
      return { booking: bookings[idx], promoted: bookings[wIdx] };
    }
  }

  return { booking: bookings[idx] };
}

export function removeBooking(id: string): boolean {
  const before = bookings.length;
  const b = bookings.find(x => x.id === id);
  if (b?.status === 'confirmed') {
    const slot = getSlotById(b.slotId);
    if (slot) updateSlot(b.slotId, { bookedCount: Math.max(0, slot.bookedCount - b.partySize) });
  }
  bookings = bookings.filter(b => b.id !== id);
  return bookings.length < before;
}

// ── Config API ───────────────────────────────────────────────────────────────

export function getConfig(): ActivityConfig {
  return { ...config };
}

export function updateConfig(updates: Partial<ActivityConfig>): ActivityConfig {
  config = { ...config, ...updates };
  return config;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export function getStats(): QueueStats {
  return {
    totalConfirmed: bookings.filter(b => b.status === 'confirmed').length,
    totalWaiting: bookings.filter(b => b.status === 'waiting').length,
    totalCancelled: bookings.filter(b => b.status === 'cancelled').length,
    openSlots: slots.filter(s => s.isOpen && availableSpots(s) > 0).length,
    fullSlots: slots.filter(s => s.isOpen && availableSpots(s) === 0).length,
  };
}

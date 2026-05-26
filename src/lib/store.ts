// src/lib/store.ts
// ---------------------------------------------------------------------------
// In-memory store — swap any method for a real DB (Postgres, Prisma, etc.)
// by replacing the implementation without changing the public interface.
// ---------------------------------------------------------------------------

import { v4 as uuidv4 } from 'uuid';
import type { TimeSlot, Booking, ActivityConfig, QueueStats } from '@/types';

// ── Seed data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

function seedSlotId(date: string, time: string): string {
  return `slot:${date}:${time.toLowerCase().replace(/\s+/g, '-')}`;
}

const seedSlots: TimeSlot[] = [
  { id: seedSlotId(today, '9:00 AM'),  time: '9:00 AM',  date: today, capacity: 12, bookedCount: 4,  isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '9:30 AM'),  time: '9:30 AM',  date: today, capacity: 12, bookedCount: 9,  isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '10:00 AM'), time: '10:00 AM', date: today, capacity: 12, bookedCount: 12, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '10:30 AM'), time: '10:30 AM', date: today, capacity: 12, bookedCount: 2,  isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '11:00 AM'), time: '11:00 AM', date: today, capacity: 12, bookedCount: 7,  isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '11:30 AM'), time: '11:30 AM', date: today, capacity: 12, bookedCount: 0,  isOpen: true, durationMinutes: 30 },
];

// ── Mutable state ────────────────────────────────────────────────────────────

interface StoreState {
  slots: TimeSlot[];
  bookings: Booking[];
  config: ActivityConfig;
}

type GlobalStore = typeof globalThis & {
  __queueflowStore__?: StoreState;
};

const globalStore = globalThis as GlobalStore;

if (!globalStore.__queueflowStore__) {
  globalStore.__queueflowStore__ = {
    slots: [...seedSlots],
    bookings: [],
    config: {
      name: 'General Activity',
      description: 'Reserve your spot for the activity.',
      defaultCapacity: 12,
      defaultDurationMinutes: 30,
      waitlistEnabled: true,
      maxPartySize: 6,
      requiresApproval: false,
    },
  };
}

const store = globalStore.__queueflowStore__;

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  return 'QF-' + Math.floor(1000 + Math.random() * 9000);
}

function availableSpots(slot: TimeSlot): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

// ── Slot API ─────────────────────────────────────────────────────────────────

export function getSlots(date?: string): TimeSlot[] {
  return date ? store.slots.filter(s => s.date === date) : store.slots;
}

export function getSlotById(id: string): TimeSlot | undefined {
  return store.slots.find(s => s.id === id);
}

export function createSlot(time: string, date: string, capacity?: number, durationMinutes?: number): TimeSlot {
  const slot: TimeSlot = {
    id: uuidv4(),
    time,
    date,
    capacity: capacity ?? store.config.defaultCapacity,
    bookedCount: 0,
    isOpen: true,
    durationMinutes: durationMinutes ?? store.config.defaultDurationMinutes,
  };
  store.slots.push(slot);
  return slot;
}

export function updateSlot(id: string, updates: Partial<TimeSlot>): TimeSlot | null {
  const idx = store.slots.findIndex(s => s.id === id);
  if (idx === -1) return null;
  store.slots[idx] = { ...store.slots[idx], ...updates };
  return store.slots[idx];
}

export function deleteSlot(id: string): boolean {
  const before = store.slots.length;
  store.slots = store.slots.filter(s => s.id !== id);
  return store.slots.length < before;
}

// ── Booking API ──────────────────────────────────────────────────────────────

export function getBookings(slotId?: string): Booking[] {
  return slotId ? store.bookings.filter(b => b.slotId === slotId) : store.bookings;
}

export function getBookingByCode(code: string): Booking | undefined {
  return store.bookings.find(b => b.confirmationCode === code);
}

export function getBookingById(id: string): Booking | undefined {
  return store.bookings.find(b => b.id === id);
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

  if (isWaiting && !store.config.waitlistEnabled) {
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

  store.bookings.push(booking);

  if (!isWaiting) {
    updateSlot(opts.slotId, { bookedCount: slot.bookedCount + opts.partySize });
  }

  const updatedSlot = getSlotById(opts.slotId)!;
  return { booking, slot: updatedSlot };
}

export function cancelBooking(id: string): { booking: Booking; promoted?: Booking } | { error: string } {
  const idx = store.bookings.findIndex(b => b.id === id);
  if (idx === -1) return { error: 'Booking not found' };

  const booking = store.bookings[idx];
  store.bookings[idx] = { ...booking, status: 'cancelled' };

  // Release capacity and promote first waitlisted person if any
  if (booking.status === 'confirmed') {
    const slot = getSlotById(booking.slotId);
    if (slot) {
      updateSlot(booking.slotId, { bookedCount: Math.max(0, slot.bookedCount - booking.partySize) });
    }
    const nextWaiting = store.bookings.find(b => b.slotId === booking.slotId && b.status === 'waiting');
    if (nextWaiting && slot && availableSpots(slot) >= nextWaiting.partySize) {
      const wIdx = store.bookings.findIndex(b => b.id === nextWaiting.id);
      store.bookings[wIdx] = { ...nextWaiting, status: 'confirmed', waitlistPosition: undefined };
      updateSlot(booking.slotId, { bookedCount: (getSlotById(booking.slotId)?.bookedCount ?? 0) + nextWaiting.partySize });
      return { booking: store.bookings[idx], promoted: store.bookings[wIdx] };
    }
  }

  return { booking: store.bookings[idx] };
}

export function removeBooking(id: string): boolean {
  const before = store.bookings.length;
  const b = store.bookings.find(x => x.id === id);
  if (b?.status === 'confirmed') {
    const slot = getSlotById(b.slotId);
    if (slot) updateSlot(b.slotId, { bookedCount: Math.max(0, slot.bookedCount - b.partySize) });
  }
  store.bookings = store.bookings.filter(b => b.id !== id);
  return store.bookings.length < before;
}

// ── Config API ───────────────────────────────────────────────────────────────

export function getConfig(): ActivityConfig {
  return { ...store.config };
}

export function updateConfig(updates: Partial<ActivityConfig>): ActivityConfig {
  store.config = { ...store.config, ...updates };
  return store.config;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export function getStats(): QueueStats {
  return {
    totalConfirmed: store.bookings.filter(b => b.status === 'confirmed').length,
    totalWaiting: store.bookings.filter(b => b.status === 'waiting').length,
    totalCancelled: store.bookings.filter(b => b.status === 'cancelled').length,
    openSlots: store.slots.filter(s => s.isOpen && availableSpots(s) > 0).length,
    fullSlots: store.slots.filter(s => s.isOpen && availableSpots(s) === 0).length,
  };
}

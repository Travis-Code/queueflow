import type { Booking, TimeSlot, ActivityConfig } from '@/types';
import type { StoreAdapter } from './types';
import { store } from '../services/state';

const DEFAULT_SLOT_TIMES = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];

function defaultSlotId(date: string, time: string): string {
  return `slot:${date}:${time.toLowerCase().replace(/\s+/g, '-')}`;
}

function ensureDefaultSlots(): void {
  if (store.slots.length > 0) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const capacity = store.config.defaultCapacity;
  const durationMinutes = store.config.defaultDurationMinutes;

  store.slots = DEFAULT_SLOT_TIMES.map((time) => ({
    id: defaultSlotId(today, time),
    time,
    date: today,
    capacity,
    bookedCount: 0,
    isOpen: true,
    durationMinutes,
  }));
}

/**
 * InMemoryAdapter: Reference implementation using global store
 * Perfect for development and testing without a database.
 */
export class InMemoryAdapter implements StoreAdapter {
  // ===== SLOTS =====
  async getSlots(date?: string): Promise<TimeSlot[]> {
    ensureDefaultSlots();
    return date ? store.slots.filter((slot) => slot.date === date) : store.slots;
  }

  async getSlotById(id: string): Promise<TimeSlot | undefined> {
    return store.slots.find((slot) => slot.id === id);
  }

  async createSlot(slot: TimeSlot): Promise<TimeSlot> {
    store.slots.push(slot);
    return slot;
  }

  async updateSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | null> {
    const slotIndex = store.slots.findIndex((slot) => slot.id === id);
    if (slotIndex === -1) return null;
    store.slots[slotIndex] = { ...store.slots[slotIndex], ...updates };
    return store.slots[slotIndex];
  }

  async deleteSlot(id: string): Promise<boolean> {
    const slotIndex = store.slots.findIndex((slot) => slot.id === id);
    if (slotIndex === -1) return false;
    store.slots.splice(slotIndex, 1);
    return true;
  }

  // ===== BOOKINGS =====
  async getBookings(slotId?: string): Promise<Booking[]> {
    return slotId ? store.bookings.filter((booking) => booking.slotId === slotId) : store.bookings;
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return store.bookings.find((booking) => booking.id === id);
  }

  async getBookingByCode(code: string): Promise<Booking | undefined> {
    return store.bookings.find((booking) => booking.confirmationCode === code);
  }

  async createBooking(booking: Booking): Promise<Booking> {
    store.bookings.push(booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const bookingIndex = store.bookings.findIndex((booking) => booking.id === id);
    if (bookingIndex === -1) return null;
    store.bookings[bookingIndex] = { ...store.bookings[bookingIndex], ...updates };
    return store.bookings[bookingIndex];
  }

  async deleteBooking(id: string): Promise<boolean> {
    const bookingIndex = store.bookings.findIndex((booking) => booking.id === id);
    if (bookingIndex === -1) return false;
    store.bookings.splice(bookingIndex, 1);
    return true;
  }

  // ===== CONFIG =====
  async getConfig(): Promise<ActivityConfig> {
    return { ...store.config };
  }

  async updateConfig(updates: Partial<ActivityConfig>): Promise<ActivityConfig> {
    store.config = { ...store.config, ...updates };
    return store.config;
  }
}

// Default singleton instance
export const inMemoryAdapter = new InMemoryAdapter();

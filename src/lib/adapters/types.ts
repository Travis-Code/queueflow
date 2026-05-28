import type { Booking, TimeSlot, ActivityConfig } from '@/types';

export interface StoreAdapter {
  // Slots
  getSlots(date?: string): Promise<TimeSlot[]>;
  getSlotById(id: string): Promise<TimeSlot | undefined>;
  createSlot(slot: TimeSlot): Promise<TimeSlot>;
  updateSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | null>;
  deleteSlot(id: string): Promise<boolean>;

  // Bookings
  getBookings(slotId?: string): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getBookingByCode(code: string): Promise<Booking | undefined>;
  createBooking(booking: Booking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null>;
  deleteBooking(id: string): Promise<boolean>;

  // Config
  getConfig(): Promise<ActivityConfig>;
  updateConfig(updates: Partial<ActivityConfig>): Promise<ActivityConfig>;
}

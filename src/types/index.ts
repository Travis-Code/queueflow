// src/types/index.ts

export type BookingStatus = 'confirmed' | 'waiting' | 'cancelled' | 'completed';

export interface TimeSlot {
  id: string;
  time: string;          // e.g. "9:00 AM"
  date: string;          // ISO date string e.g. "2026-05-06"
  capacity: number;
  bookedCount: number;
  isOpen: boolean;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  confirmationCode: string;
  slotId: string;
  slotTime: string;
  slotDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  status: BookingStatus;
  queuePosition: number;    // position within the slot
  waitlistPosition?: number; // only set when status === 'waiting'
  createdAt: string;
  notes?: string;
}

export interface ActivityConfig {
  name: string;
  description: string;
  defaultCapacity: number;
  defaultDurationMinutes: number;
  waitlistEnabled: boolean;
  maxPartySize: number;
  requiresApproval: boolean;
  adminPin?: string;
}

export interface QueueStats {
  totalConfirmed: number;
  totalWaiting: number;
  totalCancelled: number;
  openSlots: number;
  fullSlots: number;
}

// API request/response shapes
export interface CreateBookingRequest {
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  notes?: string;
  joinWaitlist?: boolean;
}

export interface CreateBookingResponse {
  booking: Booking;
  slot: TimeSlot;
}

export interface CreateSlotRequest {
  time: string;
  date: string;
  capacity?: number;
  durationMinutes?: number;
}

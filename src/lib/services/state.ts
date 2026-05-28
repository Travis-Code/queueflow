import type { ActivityConfig, Booking, TimeSlot } from '@/types';

const today = new Date().toISOString().split('T')[0];

function seedSlotId(date: string, time: string): string {
  return `slot:${date}:${time.toLowerCase().replace(/\s+/g, '-')}`;
}

const seedSlots: TimeSlot[] = [
  { id: seedSlotId(today, '9:00 AM'), time: '9:00 AM', date: today, capacity: 12, bookedCount: 4, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '9:30 AM'), time: '9:30 AM', date: today, capacity: 12, bookedCount: 9, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '10:00 AM'), time: '10:00 AM', date: today, capacity: 12, bookedCount: 12, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '10:30 AM'), time: '10:30 AM', date: today, capacity: 12, bookedCount: 2, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '11:00 AM'), time: '11:00 AM', date: today, capacity: 12, bookedCount: 7, isOpen: true, durationMinutes: 30 },
  { id: seedSlotId(today, '11:30 AM'), time: '11:30 AM', date: today, capacity: 12, bookedCount: 0, isOpen: true, durationMinutes: 30 },
];

export interface StoreState {
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

export const store = globalStore.__queueflowStore__;
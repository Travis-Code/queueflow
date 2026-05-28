import type { Booking, TimeSlot } from '@/types';
import { store } from './state';

export function generateCode(): string {
  return 'QF-' + Math.floor(1000 + Math.random() * 9000);
}

export function availableSpots(slot: TimeSlot): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

function byCreatedAtAscending(left: Booking, right: Booking): number {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

export function getOrderedConfirmedBookings(slotId: string): Booking[] {
  return store.bookings
    .filter((booking) => booking.slotId === slotId && booking.status === 'confirmed')
    .sort(byCreatedAtAscending);
}

export function getOrderedWaitingBookings(slotId: string): Booking[] {
  return store.bookings
    .filter((booking) => booking.slotId === slotId && booking.status === 'waiting')
    .sort(byCreatedAtAscending);
}

export function recalculateSlotPositions(slotId: string): void {
  const confirmed = getOrderedConfirmedBookings(slotId);
  const waiting = getOrderedWaitingBookings(slotId);

  confirmed.forEach((booking, index) => {
    const bookingIndex = store.bookings.findIndex((candidate) => candidate.id === booking.id);
    if (bookingIndex >= 0) {
      store.bookings[bookingIndex] = {
        ...store.bookings[bookingIndex],
        queuePosition: index + 1,
        waitlistPosition: undefined,
      };
    }
  });

  waiting.forEach((booking, index) => {
    const bookingIndex = store.bookings.findIndex((candidate) => candidate.id === booking.id);
    if (bookingIndex >= 0) {
      store.bookings[bookingIndex] = {
        ...store.bookings[bookingIndex],
        queuePosition: confirmed.length + index + 1,
        waitlistPosition: index + 1,
      };
    }
  });
}
import type { Booking, TimeSlot } from '@/types';
import type { StoreAdapter } from '@/lib/adapters/types';

export function generateCode(): string {
  return 'QF-' + Math.floor(1000 + Math.random() * 9000);
}

export function availableSpots(slot: TimeSlot): number {
  return Math.max(0, slot.capacity - slot.bookedCount);
}

function byCreatedAtAscending(left: Booking, right: Booking): number {
  return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
}

export function getOrderedConfirmedBookings(bookings: Booking[], slotId: string): Booking[] {
  return bookings
    .filter((booking) => booking.slotId === slotId && booking.status === 'confirmed')
    .sort(byCreatedAtAscending);
}

export function getOrderedWaitingBookings(bookings: Booking[], slotId: string): Booking[] {
  return bookings
    .filter((booking) => booking.slotId === slotId && booking.status === 'waiting')
    .sort(byCreatedAtAscending);
}

export async function recalculateSlotPositions(
  slotId: string,
  adapter: StoreAdapter,
  allBookings: Booking[],
): Promise<void> {
  const confirmed = getOrderedConfirmedBookings(allBookings, slotId);
  const waiting = getOrderedWaitingBookings(allBookings, slotId);

  // Update all confirmed bookings with correct queue positions
  for (const booking of confirmed) {
    const index = confirmed.indexOf(booking);
    await adapter.updateBooking(booking.id, {
      queuePosition: index + 1,
      waitlistPosition: undefined,
    });
  }

  // Update all waiting bookings with correct waitlist positions
  for (const booking of waiting) {
    const index = waiting.indexOf(booking);
    await adapter.updateBooking(booking.id, {
      queuePosition: confirmed.length + index + 1,
      waitlistPosition: index + 1,
    });
  }
}
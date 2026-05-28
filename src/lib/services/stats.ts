import type { QueueStats } from '@/types';
import { availableSpots } from './helpers';
import { getSlots } from './slots';
import { store } from './state';

export async function getStats(): Promise<QueueStats> {
  const slots = await getSlots();

  return {
    totalConfirmed: store.bookings.filter((booking) => booking.status === 'confirmed').length,
    totalWaiting: store.bookings.filter((booking) => booking.status === 'waiting').length,
    totalCancelled: store.bookings.filter((booking) => booking.status === 'cancelled').length,
    openSlots: slots.filter((slot) => slot.isOpen && availableSpots(slot) > 0).length,
    fullSlots: slots.filter((slot) => slot.isOpen && availableSpots(slot) === 0).length,
  };
}
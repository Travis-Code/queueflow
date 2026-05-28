import type { QueueStats } from '@/types';
import type { StoreAdapter } from '@/lib/adapters/types';
import { availableSpots } from './helpers';
import { getSlots } from './slots';
import { getBookings } from './bookings';
import { getAdapter } from '@/lib/adapters';

export async function getStats(adapter?: StoreAdapter): Promise<QueueStats> {
  const a = adapter || getAdapter();
  
  const slots = await getSlots(undefined, a);
  const bookings = await getBookings(undefined, a);

  return {
    totalConfirmed: bookings.filter((booking) => booking.status === 'confirmed').length,
    totalWaiting: bookings.filter((booking) => booking.status === 'waiting').length,
    totalCancelled: bookings.filter((booking) => booking.status === 'cancelled').length,
    openSlots: slots.filter((slot) => slot.isOpen && availableSpots(slot) > 0).length,
    fullSlots: slots.filter((slot) => slot.isOpen && availableSpots(slot) === 0).length,
  };
}
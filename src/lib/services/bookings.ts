import { v4 as uuidv4 } from 'uuid';
import type { Booking, TimeSlot } from '@/types';
import type { StoreAdapter } from '@/lib/adapters/types';
import { availableSpots, generateCode, getOrderedWaitingBookings, recalculateSlotPositions } from './helpers';
import { getAdapter } from '@/lib/adapters';
import { normalizePhoneNumber } from '@/lib/validation';

export interface CreateBookingOptions {
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  partySize: number;
  notes?: string;
  joinWaitlist?: boolean;
}

export async function getBookings(slotId?: string, adapter?: StoreAdapter): Promise<Booking[]> {
  const a = adapter || getAdapter();
  return a.getBookings(slotId);
}

export async function getBookingByPhoneNumber(phoneNumber: string, adapter?: StoreAdapter): Promise<Booking | undefined> {
  const a = adapter || getAdapter();
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const bookings = await a.getBookings();

  return bookings
    .filter((booking) => normalizePhoneNumber(booking.phoneNumber) === normalizedPhone && booking.status !== 'cancelled')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export async function getBookingById(id: string, adapter?: StoreAdapter): Promise<Booking | undefined> {
  const a = adapter || getAdapter();
  return a.getBookingById(id);
}

export async function createBooking(
  opts: CreateBookingOptions,
  adapter?: StoreAdapter,
): Promise<{ booking: Booking; slot: TimeSlot } | { error: string }> {
  const a = adapter || getAdapter();
  
  const slot = await a.getSlotById(opts.slotId);
  if (!slot) {
    return { error: 'Slot not found' };
  }

  if (!slot.isOpen) {
    return { error: 'Slot is closed' };
  }

  const config = await a.getConfig();
  if (opts.partySize > config.maxPartySize) {
    return { error: `Party size cannot exceed ${config.maxPartySize}` };
  }

  const avail = availableSpots(slot);
  const isWaiting = opts.joinWaitlist || avail < opts.partySize;

  if (!isWaiting && avail < opts.partySize) {
    return { error: `Only ${avail} spots remaining in this slot` };
  }

  if (isWaiting && !config.waitlistEnabled) {
    return { error: 'Waitlist is not enabled for this activity' };
  }

  const slotBookings = await a.getBookings(opts.slotId);
  const queuePosition = slotBookings.filter((booking) => booking.status === 'confirmed').length + 1;
  const waitlistPosition = isWaiting
    ? slotBookings.filter((booking) => booking.status === 'waiting').length + 1
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
    phoneNumber: opts.phoneNumber,
    partySize: opts.partySize,
    status: isWaiting ? 'waiting' : 'confirmed',
    queuePosition,
    waitlistPosition,
    createdAt: new Date().toISOString(),
    notes: opts.notes,
  };

  await a.createBooking(booking);

  if (!isWaiting) {
    await a.updateSlot(opts.slotId, { bookedCount: slot.bookedCount + opts.partySize });
  }

  // Recalculate positions for this slot
  const updatedBookings = await a.getBookings(opts.slotId);
  await recalculateSlotPositions(opts.slotId, a, updatedBookings);

  const updatedSlot = await a.getSlotById(opts.slotId);
  const finalBooking = await a.getBookingById(booking.id);

  return {
    booking: finalBooking || booking,
    slot: updatedSlot || slot,
  };
}

export async function cancelBooking(
  id: string,
  adapter?: StoreAdapter,
): Promise<{ booking: Booking; promoted?: Booking } | { error: string }> {
  const a = adapter || getAdapter();
  
  const booking = await a.getBookingById(id);
  if (!booking) {
    return { error: 'Booking not found' };
  }

  const wasConfirmed = booking.status === 'confirmed';
  await a.updateBooking(id, { status: 'cancelled' });

  if (!wasConfirmed) {
    const slotBookings = await a.getBookings(booking.slotId);
    await recalculateSlotPositions(booking.slotId, a, slotBookings);
    const updatedBooking = await a.getBookingById(id);
    return { booking: updatedBooking || booking };
  }

  const slot = await a.getSlotById(booking.slotId);
  if (slot) {
    await a.updateSlot(booking.slotId, {
      bookedCount: Math.max(0, slot.bookedCount - booking.partySize),
    });
  }

  const slotBookings = await a.getBookings(booking.slotId);
  await recalculateSlotPositions(booking.slotId, a, slotBookings);

  const refreshedSlot = await a.getSlotById(booking.slotId);
  const nextWaiting = getOrderedWaitingBookings(slotBookings, booking.slotId)[0];
  
  if (!nextWaiting || !refreshedSlot || availableSpots(refreshedSlot) < nextWaiting.partySize) {
    const updatedBooking = await a.getBookingById(id);
    return { booking: updatedBooking || booking };
  }

  await a.updateBooking(nextWaiting.id, {
    status: 'confirmed',
    waitlistPosition: undefined,
  });

  if (refreshedSlot) {
    await a.updateSlot(booking.slotId, {
      bookedCount: refreshedSlot.bookedCount + nextWaiting.partySize,
    });
  }

  const finalSlotBookings = await a.getBookings(booking.slotId);
  await recalculateSlotPositions(booking.slotId, a, finalSlotBookings);

  const updatedCancelledBooking = await a.getBookingById(id);
  const updatedPromotedBooking = await a.getBookingById(nextWaiting.id);

  return {
    booking: updatedCancelledBooking || booking,
    promoted: updatedPromotedBooking || nextWaiting,
  };
}

export async function removeBooking(id: string, adapter?: StoreAdapter): Promise<boolean> {
  const a = adapter || getAdapter();
  
  const booking = await a.getBookingById(id);
  if (!booking) {
    return false;
  }

  if (booking.status === 'confirmed') {
    const slot = await a.getSlotById(booking.slotId);
    if (slot) {
      await a.updateSlot(booking.slotId, {
        bookedCount: Math.max(0, slot.bookedCount - booking.partySize),
      });
    }
  }

  const slotBookings = await a.getBookings(booking.slotId);
  await recalculateSlotPositions(booking.slotId, a, slotBookings);

  return a.deleteBooking(id);
}
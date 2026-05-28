import { v4 as uuidv4 } from 'uuid';
import type { Booking, TimeSlot } from '@/types';
import { availableSpots, generateCode, getOrderedWaitingBookings, recalculateSlotPositions } from './helpers';
import { getSlotById, updateSlot } from './slots';
import { store } from './state';

export interface CreateBookingOptions {
  slotId: string;
  firstName: string;
  lastName: string;
  email: string;
  partySize: number;
  notes?: string;
  joinWaitlist?: boolean;
}

export async function getBookings(slotId?: string): Promise<Booking[]> {
  return slotId ? store.bookings.filter((booking) => booking.slotId === slotId) : store.bookings;
}

export async function getBookingByCode(code: string): Promise<Booking | undefined> {
  return store.bookings.find((booking) => booking.confirmationCode === code);
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  return store.bookings.find((booking) => booking.id === id);
}

function getUpdatedBooking(id: string): Booking {
  return store.bookings.find((booking) => booking.id === id)!;
}

export async function createBooking(
  opts: CreateBookingOptions,
): Promise<{ booking: Booking; slot: TimeSlot } | { error: string }> {
  const slot = await getSlotById(opts.slotId);
  if (!slot) {
    return { error: 'Slot not found' };
  }

  if (!slot.isOpen) {
    return { error: 'Slot is closed' };
  }

  const avail = availableSpots(slot);
  const isWaiting = opts.joinWaitlist || avail < opts.partySize;

  if (!isWaiting && avail < opts.partySize) {
    return { error: `Only ${avail} spots remaining in this slot` };
  }

  if (isWaiting && !store.config.waitlistEnabled) {
    return { error: 'Waitlist is not enabled for this activity' };
  }

  const slotBookings = await getBookings(opts.slotId);
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
    partySize: opts.partySize,
    status: isWaiting ? 'waiting' : 'confirmed',
    queuePosition,
    waitlistPosition,
    createdAt: new Date().toISOString(),
    notes: opts.notes,
  };

  store.bookings.push(booking);

  if (!isWaiting) {
    await updateSlot(opts.slotId, { bookedCount: slot.bookedCount + opts.partySize });
  }

  recalculateSlotPositions(opts.slotId);
  const updatedSlot = await getSlotById(opts.slotId);

  return {
    booking: getUpdatedBooking(booking.id),
    slot: updatedSlot ?? slot,
  };
}

export async function cancelBooking(id: string): Promise<{ booking: Booking; promoted?: Booking } | { error: string }> {
  const bookingIndex = store.bookings.findIndex((booking) => booking.id === id);
  if (bookingIndex === -1) {
    return { error: 'Booking not found' };
  }

  const existingBooking = store.bookings[bookingIndex];
  const wasConfirmed = existingBooking.status === 'confirmed';
  store.bookings[bookingIndex] = { ...existingBooking, status: 'cancelled' };

  if (!wasConfirmed) {
    recalculateSlotPositions(existingBooking.slotId);
    return { booking: getUpdatedBooking(id) };
  }

  const slot = await getSlotById(existingBooking.slotId);
  if (slot) {
    await updateSlot(existingBooking.slotId, {
      bookedCount: Math.max(0, slot.bookedCount - existingBooking.partySize),
    });
  }

  recalculateSlotPositions(existingBooking.slotId);

  const refreshedSlot = await getSlotById(existingBooking.slotId);
  const nextWaiting = getOrderedWaitingBookings(existingBooking.slotId)[0];
  if (!nextWaiting || !refreshedSlot || availableSpots(refreshedSlot) < nextWaiting.partySize) {
    return { booking: getUpdatedBooking(id) };
  }

  const waitingIndex = store.bookings.findIndex((booking) => booking.id === nextWaiting.id);
  store.bookings[waitingIndex] = {
    ...store.bookings[waitingIndex],
    status: 'confirmed',
    waitlistPosition: undefined,
  };

  await updateSlot(existingBooking.slotId, {
    bookedCount: refreshedSlot.bookedCount + nextWaiting.partySize,
  });

  recalculateSlotPositions(existingBooking.slotId);
  return {
    booking: getUpdatedBooking(id),
    promoted: getUpdatedBooking(nextWaiting.id),
  };
}

export async function removeBooking(id: string): Promise<boolean> {
  const booking = store.bookings.find((candidate) => candidate.id === id);
  if (!booking) {
    return false;
  }

  if (booking.status === 'confirmed') {
    const slot = await getSlotById(booking.slotId);
    if (slot) {
      await updateSlot(booking.slotId, { bookedCount: Math.max(0, slot.bookedCount - booking.partySize) });
    }
  }

  const before = store.bookings.length;
  store.bookings = store.bookings.filter((candidate) => candidate.id !== id);
  recalculateSlotPositions(booking.slotId);
  return store.bookings.length < before;
}
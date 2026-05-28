'use client';
// src/app/book/page.tsx

import { useState, useEffect } from 'react';
import type { TimeSlot, Booking } from '@/types';
import { SlotGrid } from '@/components/booking/SlotGrid';
import { BookingForm } from '@/components/booking/BookingForm';
import { QueuePosition } from '@/components/booking/QueuePosition';

export default function BookPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);

  async function loadSlots() {
    setLoadingSlots(true);
    const res = await fetch('/api/slots');
    setSlots(await res.json());
    setLoadingSlots(false);
  }

  useEffect(() => { loadSlots(); }, []);

  async function handleCancel() {
    if (!booking) return;
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    setBooking(null);
    setSelectedSlot(null);
    loadSlots();
  }

  function handleSuccess(b: Booking, slot: TimeSlot) {
    setBooking(b);
    setSlots(prev => prev.map(s => s.id === slot.id ? slot : s));
  }

  const totalWaiting = 3; // could be fetched from /api/bookings?stats=true

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {booking ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-gray-900">You&apos;re in the queue</h1>
            <p className="text-gray-500 text-sm mt-1">Here&apos;s your spot — we&apos;ll see you soon.</p>
          </div>
          <QueuePosition booking={booking} onCancel={handleCancel} />
        </>
      ) : (
        <>
          {/* Hero */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mb-3">
              General activity
            </div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Reserve your spot</h1>
            <p className="text-gray-500 text-sm mb-4">Pick a time slot and join the queue — or add yourself to the waitlist.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Open slots', slots.filter(s => s.isOpen && s.capacity - s.bookedCount > 0).length],
                ['Waitlisted', totalWaiting],
                ['Capacity', slots[0]?.capacity ?? '—'],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-medium text-gray-800">{val}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slots */}
          <div className="mb-5">
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Available time slots</h2>
            {loadingSlots ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading slots…</div>
            ) : (
              <SlotGrid slots={slots} selectedSlotId={selectedSlot?.id ?? null} onSelect={setSelectedSlot} />
            )}
          </div>

          {selectedSlot && (
            <div className="mb-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-800">
              Selected: <strong>{selectedSlot.time}</strong> · {Math.max(0, selectedSlot.capacity - selectedSlot.bookedCount)} spots remaining
            </div>
          )}

          <BookingForm selectedSlot={selectedSlot} onSuccess={handleSuccess} />
        </>
      )}
    </main>
  );
}

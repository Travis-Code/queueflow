
/**
 * BookingForm.tsx
 *
 * The form users fill out to book a slot or join the waitlist.
 *
 * - Collects name, email, phone number, party size, and optional notes.
 * - Validates required fields and selected slot.
 * - Submits booking or waitlist request to the backend.
 * - Shows errors or success messages.
 *
 * User sees: Input fields and “Confirm booking” / “Join waitlist” buttons.
 */
'use client';
// src/components/booking/BookingForm.tsx

import { useState } from 'react';
import type { TimeSlot, Booking } from '@/types';
import { clsx } from 'clsx';

interface BookingFormProps {
  selectedSlot: TimeSlot | null;
  onSuccess: (booking: Booking, slot: TimeSlot) => void;
}

export function BookingForm({ selectedSlot, onSuccess }: BookingFormProps) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', partySize: 1, notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avail = selectedSlot ? selectedSlot.capacity - selectedSlot.bookedCount : 0;
  const isFull = selectedSlot ? avail <= 0 : false;

  // Handles form submission for booking or waitlist
  async function submit(joinWaitlist: boolean) {
    // Validate slot and required fields
    if (!selectedSlot) { setError('Please select a time slot first.'); return; }
    if (!form.firstName || !form.email || !form.phoneNumber) { setError('Name, email, and phone number are required.'); return; }
    setError(''); setLoading(true);
    try {
      // Send booking request to API
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, ...form, joinWaitlist }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return; }
      // Call parent handler on success
      onSuccess(data.booking, data.slot);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Your details</h3>

      {/* Show error messages if any */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">First name *</label>
          <input
            value={form.firstName}
            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            placeholder="Alex"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Last name</label>
          <input
            value={form.lastName}
            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            placeholder="Kim"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Email field */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 block mb-1">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="alex@email.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Phone number field */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 block mb-1">Phone number *</label>
        <input
          type="tel"
          value={form.phoneNumber}
          onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
          placeholder="(555) 123-4567"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Party size dropdown */}
      <div className="mb-3">
        <label className="text-xs text-gray-500 block mb-1">Party size</label>
        <select
          value={form.partySize}
          onChange={e => setForm(f => ({ ...f, partySize: +e.target.value }))}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
        </select>
      </div>

      {/* Optional notes */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={2}
          placeholder="Any accessibility needs or requests…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Booking and waitlist buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => submit(false)}
          disabled={loading || !selectedSlot || isFull}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            loading || !selectedSlot || isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-teal-600 text-white hover:bg-teal-700'
          )}
        >
          {loading ? 'Booking…' : 'Confirm booking'}
        </button>

        <button
          onClick={() => submit(true)}
          disabled={loading || !selectedSlot}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Join waitlist
        </button>
      </div>

      {/* Show waitlist info if slot is full */}
      {isFull && selectedSlot && (
        <p className="text-xs text-amber-600 mt-2">This slot is full — you can join the waitlist.</p>
      )}
    </div>
  );
}

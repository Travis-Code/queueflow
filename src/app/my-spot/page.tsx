'use client';
// src/app/my-spot/page.tsx

import { useState } from 'react';
import type { Booking } from '@/types';
import { QueuePosition } from '@/components/booking/QueuePosition';

export default function MySpotPage() {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup() {
    if (!code.trim()) { setError('Enter your confirmation code'); return; }
    setLoading(true); setError('');
    const res = await fetch(`/api/waitlist?code=${encodeURIComponent(code.toUpperCase())}`);
    const data = await res.json();
    if (!res.ok) { setError('Booking not found — double-check your code.'); setBooking(null); }
    else setBooking(data);
    setLoading(false);
  }

  async function handleCancel() {
    if (!booking) return;
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    });
    setBooking(null); setCode('');
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-medium text-gray-900 mb-1">Check my spot</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your confirmation code to see your queue position.</p>

      {!booking ? (
        <div className="space-y-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            placeholder="QF-1234"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            onClick={lookup}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Looking up…' : 'Find my booking'}
          </button>
        </div>
      ) : (
        <QueuePosition booking={booking} onCancel={handleCancel} />
      )}
    </main>
  );
}

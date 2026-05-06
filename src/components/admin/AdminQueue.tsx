'use client';
// src/components/admin/AdminQueue.tsx

import { useState, useEffect } from 'react';
import type { Booking, QueueStats } from '@/types';
import { clsx } from 'clsx';

export function AdminQueue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/bookings?stats=true');
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setStats(data.stats ?? null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function removeBooking(id: string) {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    load();
  }

  const statusColor: Record<string, string> = {
    confirmed: 'bg-blue-50 text-blue-700',
    waiting: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-700',
    completed: 'bg-green-50 text-green-700',
  };

  return (
    <div>
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            ['Confirmed', stats.totalConfirmed],
            ['Waitlisted', stats.totalWaiting],
            ['Cancelled', stats.totalCancelled],
            ['Open slots', stats.openSlots],
          ].map(([label, val]) => (
            <div key={label} className="bg-white rounded-lg border border-gray-100 p-3">
              <div className="text-2xl font-medium text-gray-800">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Live queue</h3>
        <button onClick={load} className="text-xs text-teal-600 hover:underline">Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No bookings yet</div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b, i) => (
            <div key={b.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                {b.status === 'waiting' ? 'W' : `#${i + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{b.firstName} {b.lastName}</div>
                <div className="text-xs text-gray-500">{b.slotTime} · Party of {b.partySize} · {b.confirmationCode}</div>
              </div>
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', statusColor[b.status])}>
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
              <button
                onClick={() => removeBooking(b.id)}
                className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                aria-label={`Remove ${b.firstName}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

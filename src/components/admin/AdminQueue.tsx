
/**
 * AdminQueue.tsx
 *
 * Shows a live list of all bookings for admins.
 *
 * - Lists each booking’s details (name, slot, status).
 * - Updates in real time as bookings are made or cancelled.
 * - Lets admins remove bookings.
 *
 * Admin sees: A table or list of all current bookings, with status and remove button.
 */
'use client';
// src/components/admin/AdminQueue.tsx

import { useState, useEffect } from 'react';
import type { Booking, QueueStats } from '@/types';
import { clsx } from 'clsx';

export function AdminQueue() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'waiting' | 'cancelled' | 'completed'>('all');

  // Loads bookings and stats from the API
  async function load() {
    setLoading(true);
    const res = await fetch('/api/bookings?stats=true');
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setStats(data.stats ?? null);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Removes a booking and refreshes the list
  async function removeBooking(id: string) {
    await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    load();
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    if (!matchesStatus) return false;

    if (!normalizedSearch) return true;

    const fullName = `${booking.firstName} ${booking.lastName}`.toLowerCase();
    return (
      fullName.includes(normalizedSearch) ||
      booking.phoneNumber.toLowerCase().includes(normalizedSearch) ||
      booking.slotTime.toLowerCase().includes(normalizedSearch)
    );
  });

  function escapeCsv(value: string | number): string {
    const str = String(value ?? '');
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function exportCsv() {
    if (filteredBookings.length === 0) return;

    const rows = [
      ['First name', 'Last name', 'Phone number', 'Email', 'Slot time', 'Slot date', 'Party size', 'Status', 'Queue position', 'Waitlist position', 'Created at'],
      ...filteredBookings.map((booking) => [
        booking.firstName,
        booking.lastName,
        booking.phoneNumber,
        booking.email,
        booking.slotTime,
        booking.slotDate,
        booking.partySize,
        booking.status,
        booking.queuePosition,
        booking.waitlistPosition ?? '',
        booking.createdAt,
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `queueflow-bookings-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const statusColor: Record<string, string> = {
    confirmed: 'bg-blue-50 text-blue-700',
    waiting: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-700',
    completed: 'bg-green-50 text-green-700',
  };

  return (
    <div>
      {/* Stats summary for admin */}
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

      {/* Live queue list with refresh */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Live queue</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            disabled={filteredBookings.length === 0}
            className="text-xs px-2.5 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button onClick={load} className="text-xs text-teal-600 hover:underline">Refresh</button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, or slot"
          className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="waiting">Waitlisted</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">No bookings yet</div>
      ) : (
        <div className="space-y-2">
          {filteredBookings.map((b, i) => (
            <div key={b.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
              {/* Position indicator: W for waitlist, # for queue */}
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 flex-shrink-0">
                {b.status === 'waiting' ? 'W' : `#${i + 1}`}
              </div>
              {/* Booking details */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{b.firstName} {b.lastName}</div>
                <div className="text-xs text-gray-500">{b.slotTime} · Party of {b.partySize} · {b.phoneNumber}</div>
              </div>
              {/* Status badge */}
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', statusColor[b.status])}>
                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
              </span>
              {/* Remove button for admin */}
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

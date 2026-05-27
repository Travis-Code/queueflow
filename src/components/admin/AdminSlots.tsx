
/**
 * AdminSlots.tsx
 *
 * Lets admins manage all time slots.
 *
 * - Add new slots (time, date, capacity).
 * - Open/close or delete slots.
 * - See how many are booked or available, with a progress bar.
 *
 * Admin sees: Controls for creating, editing, or removing slots, and a live list of all slots.
 */
'use client';
// src/components/admin/AdminSlots.tsx

import { useState, useEffect } from 'react';
import type { TimeSlot } from '@/types';

export function AdminSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newTime, setNewTime] = useState('');
  const today = new Date().toISOString().split('T')[0];

  // Loads all slots from the API
  async function load() {
    setLoading(true);
    const res = await fetch('/api/slots');
    setSlots(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Adds a new slot for today
  async function addSlot() {
    if (!newTime) return;
    await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: newTime, date: today }),
    });
    setNewTime(''); setAdding(false); load();
  }

  // Toggles a slot open or closed
  async function toggleOpen(slot: TimeSlot) {
    await fetch(`/api/slots/${slot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen: !slot.isOpen }),
    });
    load();
  }

  // Deletes a slot
  async function deleteSlot(id: string) {
    await fetch(`/api/slots/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div>
      {/* Header and add slot button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Time slots</h3>
        <button
          onClick={() => setAdding(a => !a)}
          className="text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
        >
          + Add slot
        </button>
      </div>

      {/* Add slot form */}
      {adding && (
        <div className="flex gap-2 mb-4">
          <input
            value={newTime}
            onChange={e => setNewTime(e.target.value)}
            placeholder="e.g. 2:00 PM"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button onClick={addSlot} className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm hover:bg-teal-700">Save</button>
          <button onClick={() => setAdding(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50">Cancel</button>
        </div>
      )}

      {/* List of all slots with controls */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading…</div>
      ) : (
        <div className="space-y-2">
          {slots.map(slot => {
            // Calculate percent booked and choose bar color
            const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
            const barColor = pct >= 100 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-teal-500';
            return (
              <div key={slot.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{slot.time}</div>
                  <div className="text-xs text-gray-500 mb-1.5">{slot.bookedCount}/{slot.capacity} booked</div>
                  {/* Progress bar for slot fill level */}
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden w-24">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                {/* Open/close toggle */}
                <button
                  onClick={() => toggleOpen(slot)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    slot.isOpen ? 'bg-teal-50 text-teal-700 hover:bg-teal-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {slot.isOpen ? 'Open' : 'Closed'}
                </button>
                {/* Delete slot button */}
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  aria-label={`Delete slot ${slot.time}`}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

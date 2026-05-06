'use client';
// src/app/admin/page.tsx

import { useState } from 'react';
import { AdminQueue } from '@/components/admin/AdminQueue';
import { AdminSlots } from '@/components/admin/AdminSlots';

type Tab = 'queue' | 'slots' | 'settings';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('queue');

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Admin panel</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your queue and time slots</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">Live</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6 w-fit">
        {(['queue', 'slots', 'settings'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'queue' && <AdminQueue />}
      {tab === 'slots' && <AdminSlots />}
      {tab === 'settings' && <AdminSettings />}
    </main>
  );
}

function AdminSettings() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Activity settings</h3>
      <div className="space-y-4">
        {[
          { label: 'Activity name', placeholder: 'General Activity', type: 'text' },
          { label: 'Capacity per slot', placeholder: '12', type: 'number' },
          { label: 'Slot duration (min)', placeholder: '30', type: 'number' },
          { label: 'Max party size', placeholder: '6', type: 'number' },
        ].map(({ label, placeholder, type }) => (
          <div key={label}>
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input
              type={type}
              defaultValue={placeholder}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-500 block mb-1">Waitlist enabled</label>
          <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors">
          Save settings
        </button>
      </div>
    </div>
  );
}

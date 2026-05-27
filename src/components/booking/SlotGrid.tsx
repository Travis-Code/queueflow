
/**
 * SlotGrid.tsx
 *
 * Displays all available time slots as a grid of buttons.
 *
 * - Shows each slot’s time and how many spots are left.
 * - Lets users select a slot (unless it’s full).
 * - Highlights the selected slot.
 *
 * User sees: A grid of buttons like “9:00 AM (8 left)”, “10:00 AM (Full)”.
 */
'use client';
// src/components/booking/SlotGrid.tsx

import type { TimeSlot } from '@/types';
import { clsx } from 'clsx';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: TimeSlot) => void;
}


export function SlotGrid({ slots, selectedSlotId, onSelect }: SlotGridProps) {
  // If there are no slots, show a friendly message
  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        No time slots available for this date.
      </div>
    );
  }

  // Render each slot as a button in a responsive grid
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {slots.map((slot) => {
        // Calculate how many spots are left
        const avail = slot.capacity - slot.bookedCount;
        // Mark as full if no spots or slot is closed
        const isFull = avail <= 0 || !slot.isOpen;
        // Highlight if this slot is selected
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            onClick={() => !isFull && onSelect(slot)} // Only allow selecting if not full
            disabled={isFull}
            className={clsx(
              'rounded-lg border p-3 text-left transition-all',
              isFull
                ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                : isSelected
                ? 'border-[2px] border-teal-600 bg-teal-50'
                : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50 cursor-pointer'
            )}
          >
            {/* Show the slot time */}
            <div className="font-medium text-sm text-gray-800">{slot.time}</div>
            {/* Show how many spots are left, or 'Full' */}
            <div className="text-xs text-gray-500 mt-0.5">
              {isFull ? 'Full' : `${avail} left`}
            </div>
          </button>
        );
      })}
    </div>
  );
}

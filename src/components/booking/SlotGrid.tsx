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
  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        No time slots available for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const avail = slot.capacity - slot.bookedCount;
        const isFull = avail <= 0 || !slot.isOpen;
        const isSelected = selectedSlotId === slot.id;

        return (
          <button
            key={slot.id}
            onClick={() => !isFull && onSelect(slot)}
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
            <div className="font-medium text-sm text-gray-800">{slot.time}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {isFull ? 'Full' : `${avail} left`}
            </div>
          </button>
        );
      })}
    </div>
  );
}


/**
 * QueuePosition.tsx
 *
 * Shows the user their current position in the queue or waitlist.
 *
 * - Displays phone number, status (confirmed/waiting), and position.
 * - Shows a progress bar and estimated wait time.
 * - Lets users cancel their booking.
 *
 * User sees: “You’re #2 in the queue”, with a cancel button and booking details.
 */
'use client';
// src/components/booking/QueuePosition.tsx

import type { Booking } from '@/types';
import { clsx } from 'clsx';

interface QueuePositionProps {
  booking: Booking;
  onCancel: () => void;
}

export function QueuePosition({ booking, onCancel }: QueuePositionProps) {
  // Determine if user is on waitlist or confirmed
  const isWaiting = booking.status === 'waiting';
  // Get their position in queue or waitlist
  const position = isWaiting ? booking.waitlistPosition ?? 1 : booking.queuePosition;
  // Calculate progress bar percent
  const progressPct = isWaiting ? 15 : Math.max(10, 100 - position * 12);

  return (
    <div className="space-y-4">
      {/* Position card: shows queue or waitlist position and status */}
      <div className="bg-white rounded-xl border-2 border-teal-500 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-teal-600 flex flex-col items-center justify-center text-white flex-shrink-0">
            {isWaiting ? (
              <>
                <span className="text-xl font-medium leading-none">W{position}</span>
                <span className="text-[10px] opacity-75">waitlist</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-medium leading-none">#{position}</span>
                <span className="text-[10px] opacity-75">in queue</span>
              </>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-800">{booking.firstName} {booking.lastName}</div>
            <div className="text-sm text-gray-500">{booking.slotTime}</div>
            <span className={clsx(
              'inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full',
              isWaiting ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            )}>
              {isWaiting ? 'Waitlisted' : 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Progress bar visualizes how close the user is to the front */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {isWaiting
            ? `You're #${position} on the waitlist. We'll notify you if a spot opens up.`
            : position === 1
            ? "You're next — head over now!"
            : `Approximately ${(position - 1) * 5}–${(position - 1) * 10} min wait`}
        </p>
      </div>

      {/* Booking details card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Booking details</h3>
        <dl className="space-y-2">
          {[
            ['Phone number', booking.phoneNumber],
            ['Time slot', booking.slotTime],
            ['Date', booking.slotDate],
            ['Party size', `${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}`],
            ['Email', booking.email],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Cancel button for user to cancel their booking */}
      <button
        onClick={onCancel}
        className="w-full py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
      >
        Cancel my booking
      </button>
    </div>
  );
}

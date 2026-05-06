// src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBookingById, cancelBooking, removeBooking } from '@/lib/store';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const booking = getBookingById(params.id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(booking);
}

// PATCH /api/bookings/:id  { action: 'cancel' | 'complete' }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { action } = await req.json();
  if (action === 'cancel') {
    const result = cancelBooking(params.id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 422 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE — admin hard-remove
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const removed = removeBooking(params.id);
  if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

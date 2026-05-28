// src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking, getBookingById, removeBooking } from '@/lib/services/bookings';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const booking = await getBookingById(id);
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(booking);
}

// PATCH /api/bookings/:id  { action: 'cancel' | 'complete' }
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const { action } = await req.json();
  if (action === 'cancel') {
    const result = await cancelBooking(id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 422 });
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE — admin hard-remove
export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const removed = await removeBooking(id);
  if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

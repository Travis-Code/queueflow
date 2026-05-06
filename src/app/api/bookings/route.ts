// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBookings, createBooking, getStats } from '@/lib/store';

export async function GET(req: NextRequest) {
  const slotId = req.nextUrl.searchParams.get('slotId') ?? undefined;
  const includeStats = req.nextUrl.searchParams.get('stats') === 'true';

  if (includeStats) {
    return NextResponse.json({ bookings: getBookings(slotId), stats: getStats() });
  }
  return NextResponse.json(getBookings(slotId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slotId, firstName, lastName, email, partySize, notes, joinWaitlist } = body;

  if (!slotId || !firstName || !email || !partySize) {
    return NextResponse.json({ error: 'slotId, firstName, email, and partySize are required' }, { status: 400 });
  }

  const result = createBooking({ slotId, firstName, lastName, email, partySize, notes, joinWaitlist });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(result, { status: 201 });
}

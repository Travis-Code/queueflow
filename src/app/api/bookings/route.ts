// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/services/bookings';
import { getStats } from '@/lib/services/stats';

export async function GET(req: NextRequest) {
  const slotId = req.nextUrl.searchParams.get('slotId') ?? undefined;
  const includeStats = req.nextUrl.searchParams.get('stats') === 'true';

  if (includeStats) {
    return NextResponse.json({ bookings: await getBookings(slotId), stats: await getStats() });
  }
  return NextResponse.json(await getBookings(slotId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slotId, firstName, lastName, email, partySize, notes, joinWaitlist } = body;

  if (!slotId || !firstName || !email || !partySize) {
    return NextResponse.json({ error: 'slotId, firstName, email, and partySize are required' }, { status: 400 });
  }

  const result = await createBooking({ slotId, firstName, lastName, email, partySize, notes, joinWaitlist });

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(result, { status: 201 });
}

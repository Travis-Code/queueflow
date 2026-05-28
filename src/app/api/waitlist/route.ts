// src/app/api/waitlist/route.ts
// Lookup a booking by confirmation code (used by "Check my spot" flow)
import { NextRequest, NextResponse } from 'next/server';
import { getBookingByCode } from '@/lib/services/bookings';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'code param required' }, { status: 400 });
  const booking = await getBookingByCode(code.toUpperCase());
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json(booking);
}

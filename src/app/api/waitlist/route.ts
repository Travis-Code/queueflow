// src/app/api/waitlist/route.ts
// Lookup a booking by confirmation code (used by "Check my spot" flow)
import { NextRequest, NextResponse } from 'next/server';
import { getBookingByCode } from '@/lib/services/bookings';
import { createErrorResponse } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        createErrorResponse('code parameter is required', 'MISSING_PARAM'),
        { status: 400 }
      );
    }
    
    const booking = await getBookingByCode(code.toUpperCase());
    if (!booking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to lookup booking', 'LOOKUP_FAILED'),
      { status: 500 }
    );
  }
}

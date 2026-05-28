// src/app/api/waitlist/route.ts
// Lookup a booking by phone number (used by "Check my spot" flow)
import { NextRequest, NextResponse } from 'next/server';
import { getBookingByPhoneNumber } from '@/lib/services/bookings';
import { createErrorResponse, isValidPhoneNumber } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const phoneNumber = req.nextUrl.searchParams.get('phoneNumber') ?? req.nextUrl.searchParams.get('phone');
    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        createErrorResponse('phoneNumber parameter is required', 'MISSING_PARAM'),
        { status: 400 }
      );
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      return NextResponse.json(
        createErrorResponse('phoneNumber must contain 10 to 15 digits', 'VALIDATION_ERROR'),
        { status: 422 }
      );
    }

    const booking = await getBookingByPhoneNumber(phoneNumber);
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

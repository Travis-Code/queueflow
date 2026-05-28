// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings } from '@/lib/services/bookings';
import { getStats } from '@/lib/services/stats';
import { validateBookingRequest, createErrorResponse } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const slotId = req.nextUrl.searchParams.get('slotId') ?? undefined;
    const includeStats = req.nextUrl.searchParams.get('stats') === 'true';

    if (includeStats) {
      return NextResponse.json({ bookings: await getBookings(slotId), stats: await getStats() });
    }
    return NextResponse.json(await getBookings(slotId));
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to fetch bookings', 'FETCH_FAILED'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const validation = validateBookingRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(validation.error, 'VALIDATION_ERROR'),
        { status: validation.status }
      );
    }

    const { slotId, firstName, lastName, email, phoneNumber, partySize, notes, joinWaitlist } = body;

    const result = await createBooking({ slotId, firstName, lastName, email, phoneNumber, partySize, notes, joinWaitlist });

    if ('error' in result) {
      return NextResponse.json(
        createErrorResponse(result.error, 'BOOKING_ERROR'),
        { status: 422 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to create booking', 'CREATE_FAILED'),
      { status: 500 }
    );
  }
}

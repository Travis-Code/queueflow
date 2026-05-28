// src/app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking, getBookingById, removeBooking } from '@/lib/services/bookings';
import { createErrorResponse } from '@/lib/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to fetch booking', 'FETCH_FAILED'),
      { status: 500 }
    );
  }
}

// PATCH /api/bookings/:id  { action: 'cancel' | 'complete' }
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { action } = body;

    if (action === 'cancel') {
      const result = await cancelBooking(id);
      if ('error' in result) {
        return NextResponse.json(
          createErrorResponse(result.error, 'CANCEL_ERROR'),
          { status: 422 }
        );
      }
      return NextResponse.json(result);
    }

    return NextResponse.json(
      createErrorResponse('Unknown action', 'INVALID_ACTION'),
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to update booking', 'UPDATE_FAILED'),
      { status: 500 }
    );
  }
}

// DELETE — admin hard-remove
export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const removed = await removeBooking(id);
    if (!removed) {
      return NextResponse.json(
        createErrorResponse('Booking not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to delete booking', 'DELETE_FAILED'),
      { status: 500 }
    );
  }
}

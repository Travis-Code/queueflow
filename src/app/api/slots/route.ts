// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSlot, getSlots } from '@/lib/services/slots';
import { validateSlotRequest, createErrorResponse } from '@/lib/validation';

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date') ?? undefined;
    return NextResponse.json(await getSlots(date));
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to fetch slots', 'FETCH_FAILED'),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request
    const validation = validateSlotRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(validation.error, 'VALIDATION_ERROR'),
        { status: validation.status }
      );
    }

    const { time, date, capacity, durationMinutes } = body;
    const slot = await createSlot(time, date, capacity, durationMinutes);
    return NextResponse.json(slot, { status: 201 });
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to create slot', 'CREATE_FAILED'),
      { status: 500 }
    );
  }
}

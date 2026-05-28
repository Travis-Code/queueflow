// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSlot, getSlots } from '@/lib/services/slots';

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? undefined;
  return NextResponse.json(await getSlots(date));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { time, date, capacity, durationMinutes } = body;
  if (!time || !date) {
    return NextResponse.json({ error: 'time and date are required' }, { status: 400 });
  }
  const slot = await createSlot(time, date, capacity, durationMinutes);
  return NextResponse.json(slot, { status: 201 });
}

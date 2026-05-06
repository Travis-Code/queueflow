// src/app/api/slots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSlotById, updateSlot, deleteSlot } from '@/lib/store';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const slot = getSlotById(params.id);
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(slot);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = updateSlot(params.id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const deleted = deleteSlot(params.id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

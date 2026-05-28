// src/app/api/slots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteSlot, getSlotById, updateSlot } from '@/lib/services/slots';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const slot = await getSlotById(id);
  if (!slot) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(slot);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const body = await req.json();
  const updated = await updateSlot(id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const deleted = await deleteSlot(id);
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

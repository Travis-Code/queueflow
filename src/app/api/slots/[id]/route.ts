// src/app/api/slots/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteSlot, getSlotById, updateSlot } from '@/lib/services/slots';
import { createErrorResponse } from '@/lib/validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const slot = await getSlotById(id);
    if (!slot) {
      return NextResponse.json(
        createErrorResponse('Slot not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    return NextResponse.json(slot);
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to fetch slot', 'FETCH_FAILED'),
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const updated = await updateSlot(id, body);
    if (!updated) {
      return NextResponse.json(
        createErrorResponse('Slot not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to update slot', 'UPDATE_FAILED'),
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteSlot(id);
    if (!deleted) {
      return NextResponse.json(
        createErrorResponse('Slot not found', 'NOT_FOUND'),
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      createErrorResponse('Failed to delete slot', 'DELETE_FAILED'),
      { status: 500 }
    );
  }
}

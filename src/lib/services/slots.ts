import { v4 as uuidv4 } from 'uuid';
import type { TimeSlot } from '@/types';
import { query } from '@/lib/db';
import { getAdapter } from '@/lib/adapters';
import type { StoreAdapter } from '@/lib/adapters/types';

interface SlotRow {
  id: string;
  time: string;
  date: string | Date;
  capacity: number;
  bookedCount?: number;
  booked_count?: number;
  isOpen?: boolean;
  is_open?: boolean;
  durationMinutes?: number;
  duration_minutes?: number;
}

function normalizeSlot(row: SlotRow): TimeSlot {
  return {
    id: row.id,
    time: row.time,
    date: typeof row.date === 'string' ? row.date : row.date.toISOString().split('T')[0],
    capacity: row.capacity,
    bookedCount: row.bookedCount ?? row.booked_count ?? 0,
    isOpen: row.isOpen ?? row.is_open ?? true,
    durationMinutes: row.durationMinutes ?? row.duration_minutes ?? 30,
  };
}

export async function getSlots(date?: string, adapter?: StoreAdapter): Promise<TimeSlot[]> {
  const a = adapter || getAdapter();
  return a.getSlots(date);
}

export async function getSlotById(id: string, adapter?: StoreAdapter): Promise<TimeSlot | undefined> {
  const a = adapter || getAdapter();
  return a.getSlotById(id);
}

export async function createSlot(
  time: string,
  date: string,
  capacity?: number,
  durationMinutes?: number,
  adapter?: StoreAdapter,
): Promise<TimeSlot> {
  const a = adapter || getAdapter();
  const config = await a.getConfig();

  const slot: TimeSlot = {
    id: uuidv4(),
    time,
    date,
    capacity: capacity ?? config.defaultCapacity,
    bookedCount: 0,
    isOpen: true,
    durationMinutes: durationMinutes ?? config.defaultDurationMinutes,
  };

  // Try database first, fall back to in-memory adapter
  try {
    const { rows } = await query<SlotRow>(
      `
        INSERT INTO slots (id, time, date, capacity, booked_count, is_open, duration_minutes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          id,
          time,
          date::text AS "date",
          capacity,
          booked_count AS "bookedCount",
          is_open AS "isOpen",
          duration_minutes AS "durationMinutes"
      `,
      [slot.id, slot.time, slot.date, slot.capacity, slot.bookedCount, slot.isOpen, slot.durationMinutes],
    );
    return normalizeSlot(rows[0]);
  } catch {
    return a.createSlot(slot);
  }
}

export async function updateSlot(
  id: string,
  updates: Partial<TimeSlot>,
  adapter?: StoreAdapter,
): Promise<TimeSlot | null> {
  const a = adapter || getAdapter();
  
  const fields = [
    ['time', updates.time],
    ['date', updates.date],
    ['capacity', updates.capacity],
    ['booked_count', updates.bookedCount],
    ['is_open', updates.isOpen],
    ['duration_minutes', updates.durationMinutes],
  ].filter(([, value]) => value !== undefined);

  if (fields.length === 0) {
    return (await a.getSlotById(id)) ?? null;
  }

  // Try database first, fall back to adapter
  try {
    const setClause = fields
      .map(([column], index) => `${column} = $${index + 2}`)
      .join(', ');
    const params = [id, ...fields.map(([, value]) => value)];
    const { rows, rowCount } = await query<SlotRow>(
      `
        UPDATE slots
        SET ${setClause}
        WHERE id = $1
        RETURNING
          id,
          time,
          date::text AS "date",
          capacity,
          booked_count AS "bookedCount",
          is_open AS "isOpen",
          duration_minutes AS "durationMinutes"
      `,
      params,
    );

    if (rowCount === 0) {
      return null;
    }

    return normalizeSlot(rows[0]);
  } catch {
    return a.updateSlot(id, updates);
  }
}

export async function deleteSlot(id: string, adapter?: StoreAdapter): Promise<boolean> {
  const a = adapter || getAdapter();

  // Try database first, fall back to adapter
  try {
    const { rowCount } = await query('DELETE FROM slots WHERE id = $1', [id]);
    return rowCount > 0;
  } catch {
    return a.deleteSlot(id);
  }
}
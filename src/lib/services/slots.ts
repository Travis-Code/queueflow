import { v4 as uuidv4 } from 'uuid';
import type { TimeSlot } from '@/types';
import { query } from '@/lib/db';
import { store } from './state';

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

const slotSelectClause = `
  SELECT
    id,
    time,
    date::text AS "date",
    capacity,
    booked_count AS "bookedCount",
    is_open AS "isOpen",
    duration_minutes AS "durationMinutes"
  FROM slots
`;

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

export async function getSlots(date?: string): Promise<TimeSlot[]> {
  try {
    const params: unknown[] = [];
    let sql = slotSelectClause;

    if (date) {
      sql += ' WHERE date = $1';
      params.push(date);
    }

    const { rows } = await query<SlotRow>(sql, params);
    return rows.map(normalizeSlot);
  } catch {
    return date ? store.slots.filter((slot) => slot.date === date) : store.slots;
  }
}

export async function getSlotById(id: string): Promise<TimeSlot | undefined> {
  try {
    const { rows } = await query<SlotRow>(`${slotSelectClause} WHERE id = $1`, [id]);
    return rows[0] ? normalizeSlot(rows[0]) : undefined;
  } catch {
    return store.slots.find((slot) => slot.id === id);
  }
}

export async function createSlot(time: string, date: string, capacity?: number, durationMinutes?: number): Promise<TimeSlot> {
  const slot: TimeSlot = {
    id: uuidv4(),
    time,
    date,
    capacity: capacity ?? store.config.defaultCapacity,
    bookedCount: 0,
    isOpen: true,
    durationMinutes: durationMinutes ?? store.config.defaultDurationMinutes,
  };

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
    store.slots.push(slot);
    return slot;
  }
}

export async function updateSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | null> {
  const fields = [
    ['time', updates.time],
    ['date', updates.date],
    ['capacity', updates.capacity],
    ['booked_count', updates.bookedCount],
    ['is_open', updates.isOpen],
    ['duration_minutes', updates.durationMinutes],
  ].filter(([, value]) => value !== undefined);

  if (fields.length === 0) {
    return (await getSlotById(id)) ?? null;
  }

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
    const slotIndex = store.slots.findIndex((slot) => slot.id === id);
    if (slotIndex === -1) {
      return null;
    }

    store.slots[slotIndex] = { ...store.slots[slotIndex], ...updates };
    return store.slots[slotIndex];
  }
}

export async function deleteSlot(id: string): Promise<boolean> {
  try {
    const { rowCount } = await query('DELETE FROM slots WHERE id = $1', [id]);
    if (rowCount > 0) {
      return true;
    }
  } catch {
  }

  const before = store.slots.length;
  store.slots = store.slots.filter((slot) => slot.id !== id);
  return store.slots.length < before;
}
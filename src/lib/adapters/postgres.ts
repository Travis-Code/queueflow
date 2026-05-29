import type { ActivityConfig, Booking, TimeSlot } from '@/types';
import { query } from '@/lib/db';
import type { StoreAdapter } from './types';
import { v4 as uuidv4 } from 'uuid';

interface SlotRow {
  id: string;
  time: string;
  date: string;
  capacity: number;
  bookedCount?: number;
  booked_count?: number;
  isOpen?: boolean;
  is_open?: boolean;
  durationMinutes?: number;
  duration_minutes?: number;
}

interface BookingRow {
  id: string;
  confirmationCode?: string;
  confirmation_code?: string;
  slotId?: string;
  slot_id?: string;
  slotTime?: string;
  slot_time?: string;
  slotDate?: string;
  slot_date?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string | null;
  last_name?: string | null;
  email: string;
  phoneNumber?: string;
  phone_number?: string;
  partySize?: number;
  party_size?: number;
  status: Booking['status'];
  queuePosition?: number;
  queue_position?: number;
  waitlistPosition?: number | null;
  waitlist_position?: number | null;
  createdAt?: string;
  created_at?: string;
  notes?: string | null;
}

interface ActivityConfigRow {
  name: string;
  description: string;
  defaultCapacity?: number;
  default_capacity?: number;
  defaultDurationMinutes?: number;
  default_duration_minutes?: number;
  waitlistEnabled?: boolean;
  waitlist_enabled?: boolean;
  maxPartySize?: number;
  max_party_size?: number;
  requiresApproval?: boolean;
  requires_approval?: boolean;
  adminPin?: string | null;
  admin_pin?: string | null;
}

const DEFAULT_CONFIG: ActivityConfig = {
  name: 'General Activity',
  description: 'Reserve your spot for the activity.',
  defaultCapacity: 12,
  defaultDurationMinutes: 30,
  waitlistEnabled: true,
  maxPartySize: 6,
  requiresApproval: false,
};

const DEFAULT_SLOT_TIMES = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];

function normalizeSlot(row: SlotRow): TimeSlot {
  return {
    id: row.id,
    time: row.time,
    date: row.date,
    capacity: row.capacity,
    bookedCount: row.bookedCount ?? row.booked_count ?? 0,
    isOpen: row.isOpen ?? row.is_open ?? true,
    durationMinutes: row.durationMinutes ?? row.duration_minutes ?? 30,
  };
}

function normalizeBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    confirmationCode: row.confirmationCode ?? row.confirmation_code ?? '',
    slotId: row.slotId ?? row.slot_id ?? '',
    slotTime: row.slotTime ?? row.slot_time ?? '',
    slotDate: row.slotDate ?? row.slot_date ?? '',
    firstName: row.firstName ?? row.first_name ?? '',
    lastName: row.lastName ?? row.last_name ?? '',
    email: row.email,
    phoneNumber: row.phoneNumber ?? row.phone_number ?? '',
    partySize: row.partySize ?? row.party_size ?? 1,
    status: row.status,
    queuePosition: row.queuePosition ?? row.queue_position ?? 1,
    waitlistPosition: row.waitlistPosition ?? row.waitlist_position ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? new Date().toISOString(),
    notes: row.notes ?? undefined,
  };
}

function normalizeConfig(row: ActivityConfigRow): ActivityConfig {
  return {
    name: row.name,
    description: row.description,
    defaultCapacity: row.defaultCapacity ?? row.default_capacity ?? DEFAULT_CONFIG.defaultCapacity,
    defaultDurationMinutes: row.defaultDurationMinutes ?? row.default_duration_minutes ?? DEFAULT_CONFIG.defaultDurationMinutes,
    waitlistEnabled: row.waitlistEnabled ?? row.waitlist_enabled ?? DEFAULT_CONFIG.waitlistEnabled,
    maxPartySize: row.maxPartySize ?? row.max_party_size ?? DEFAULT_CONFIG.maxPartySize,
    requiresApproval: row.requiresApproval ?? row.requires_approval ?? DEFAULT_CONFIG.requiresApproval,
    adminPin: row.adminPin ?? row.admin_pin ?? undefined,
  };
}

async function ensureConfigRow(): Promise<void> {
  await query(
    `
      INSERT INTO activity_config (
        id,
        name,
        description,
        default_capacity,
        default_duration_minutes,
        waitlist_enabled,
        max_party_size,
        requires_approval,
        admin_pin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO NOTHING
    `,
    [
      1,
      DEFAULT_CONFIG.name,
      DEFAULT_CONFIG.description,
      DEFAULT_CONFIG.defaultCapacity,
      DEFAULT_CONFIG.defaultDurationMinutes,
      DEFAULT_CONFIG.waitlistEnabled,
      DEFAULT_CONFIG.maxPartySize,
      DEFAULT_CONFIG.requiresApproval,
      DEFAULT_CONFIG.adminPin ?? null,
    ],
  );
}

async function ensureDefaultSlots(): Promise<void> {
  const { rows } = await query<{ count: string }>('SELECT COUNT(*)::text AS count FROM slots');
  const count = Number.parseInt(rows[0]?.count ?? '0', 10);
  if (count > 0) {
    return;
  }

  await ensureConfigRow();
  const configRows = await query<ActivityConfigRow>(
    `
      SELECT
        default_capacity AS "defaultCapacity",
        default_duration_minutes AS "defaultDurationMinutes"
      FROM activity_config
      WHERE id = 1
      LIMIT 1
    `,
  );

  const defaultCapacity = configRows.rows[0]?.defaultCapacity ?? DEFAULT_CONFIG.defaultCapacity;
  const defaultDurationMinutes = configRows.rows[0]?.defaultDurationMinutes ?? DEFAULT_CONFIG.defaultDurationMinutes;
  const today = new Date().toISOString().split('T')[0];

  for (const time of DEFAULT_SLOT_TIMES) {
    await query(
      `
        INSERT INTO slots (id, time, date, capacity, booked_count, is_open, duration_minutes)
        VALUES ($1, $2, $3, $4, 0, TRUE, $5)
      `,
      [uuidv4(), time, today, defaultCapacity, defaultDurationMinutes],
    );
  }
}

export class PostgresAdapter implements StoreAdapter {
  async getSlots(date?: string): Promise<TimeSlot[]> {
    await ensureDefaultSlots();
    const { rows } = await query<SlotRow>(
      `
        SELECT
          id,
          time,
          date::text AS "date",
          capacity,
          booked_count AS "bookedCount",
          is_open AS "isOpen",
          duration_minutes AS "durationMinutes"
        FROM slots
        WHERE ($1::date IS NULL OR date = $1)
        ORDER BY date ASC, time ASC
      `,
      [date ?? null],
    );
    return rows.map(normalizeSlot);
  }

  async getSlotById(id: string): Promise<TimeSlot | undefined> {
    const { rows } = await query<SlotRow>(
      `
        SELECT
          id,
          time,
          date::text AS "date",
          capacity,
          booked_count AS "bookedCount",
          is_open AS "isOpen",
          duration_minutes AS "durationMinutes"
        FROM slots
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );
    return rows[0] ? normalizeSlot(rows[0]) : undefined;
  }

  async createSlot(slot: TimeSlot): Promise<TimeSlot> {
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
  }

  async updateSlot(id: string, updates: Partial<TimeSlot>): Promise<TimeSlot | null> {
    const fields = [
      ['time', updates.time],
      ['date', updates.date],
      ['capacity', updates.capacity],
      ['booked_count', updates.bookedCount],
      ['is_open', updates.isOpen],
      ['duration_minutes', updates.durationMinutes],
    ].filter(([, value]) => value !== undefined);

    if (fields.length === 0) {
      return (await this.getSlotById(id)) ?? null;
    }

    const setClause = fields.map(([column], index) => `${column} = $${index + 2}`).join(', ');
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

    if (rowCount === 0) return null;
    return normalizeSlot(rows[0]);
  }

  async deleteSlot(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM slots WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async getBookings(slotId?: string): Promise<Booking[]> {
    const { rows } = await query<BookingRow>(
      `
        SELECT
          id,
          confirmation_code AS "confirmationCode",
          slot_id AS "slotId",
          slot_time AS "slotTime",
          slot_date::text AS "slotDate",
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          phone_number AS "phoneNumber",
          party_size AS "partySize",
          status,
          queue_position AS "queuePosition",
          waitlist_position AS "waitlistPosition",
          created_at::text AS "createdAt",
          notes
        FROM bookings
        WHERE ($1::uuid IS NULL OR slot_id = $1)
        ORDER BY created_at ASC
      `,
      [slotId ?? null],
    );
    return rows.map(normalizeBooking);
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    const { rows } = await query<BookingRow>(
      `
        SELECT
          id,
          confirmation_code AS "confirmationCode",
          slot_id AS "slotId",
          slot_time AS "slotTime",
          slot_date::text AS "slotDate",
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          phone_number AS "phoneNumber",
          party_size AS "partySize",
          status,
          queue_position AS "queuePosition",
          waitlist_position AS "waitlistPosition",
          created_at::text AS "createdAt",
          notes
        FROM bookings
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );
    return rows[0] ? normalizeBooking(rows[0]) : undefined;
  }

  async getBookingByCode(code: string): Promise<Booking | undefined> {
    const { rows } = await query<BookingRow>(
      `
        SELECT
          id,
          confirmation_code AS "confirmationCode",
          slot_id AS "slotId",
          slot_time AS "slotTime",
          slot_date::text AS "slotDate",
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          phone_number AS "phoneNumber",
          party_size AS "partySize",
          status,
          queue_position AS "queuePosition",
          waitlist_position AS "waitlistPosition",
          created_at::text AS "createdAt",
          notes
        FROM bookings
        WHERE confirmation_code = $1
        LIMIT 1
      `,
      [code],
    );
    return rows[0] ? normalizeBooking(rows[0]) : undefined;
  }

  async createBooking(booking: Booking): Promise<Booking> {
    const { rows } = await query<BookingRow>(
      `
        INSERT INTO bookings (
          id,
          confirmation_code,
          slot_id,
          slot_time,
          slot_date,
          first_name,
          last_name,
          email,
          phone_number,
          party_size,
          status,
          queue_position,
          waitlist_position,
          created_at,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING
          id,
          confirmation_code AS "confirmationCode",
          slot_id AS "slotId",
          slot_time AS "slotTime",
          slot_date::text AS "slotDate",
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          phone_number AS "phoneNumber",
          party_size AS "partySize",
          status,
          queue_position AS "queuePosition",
          waitlist_position AS "waitlistPosition",
          created_at::text AS "createdAt",
          notes
      `,
      [
        booking.id,
        booking.confirmationCode,
        booking.slotId,
        booking.slotTime,
        booking.slotDate,
        booking.firstName,
        booking.lastName,
        booking.email,
        booking.phoneNumber,
        booking.partySize,
        booking.status,
        booking.queuePosition,
        booking.waitlistPosition ?? null,
        booking.createdAt,
        booking.notes ?? null,
      ],
    );
    return normalizeBooking(rows[0]);
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    const fields = [
      ['confirmation_code', updates.confirmationCode],
      ['slot_id', updates.slotId],
      ['slot_time', updates.slotTime],
      ['slot_date', updates.slotDate],
      ['first_name', updates.firstName],
      ['last_name', updates.lastName],
      ['email', updates.email],
      ['phone_number', updates.phoneNumber],
      ['party_size', updates.partySize],
      ['status', updates.status],
      ['queue_position', updates.queuePosition],
      ['waitlist_position', updates.waitlistPosition],
      ['created_at', updates.createdAt],
      ['notes', updates.notes],
    ].filter(([, value]) => value !== undefined);

    if (fields.length === 0) {
      return (await this.getBookingById(id)) ?? null;
    }

    const setClause = fields.map(([column], index) => `${column} = $${index + 2}`).join(', ');
    const params = [id, ...fields.map(([, value]) => value ?? null)];

    const { rows, rowCount } = await query<BookingRow>(
      `
        UPDATE bookings
        SET ${setClause}
        WHERE id = $1
        RETURNING
          id,
          confirmation_code AS "confirmationCode",
          slot_id AS "slotId",
          slot_time AS "slotTime",
          slot_date::text AS "slotDate",
          first_name AS "firstName",
          last_name AS "lastName",
          email,
          phone_number AS "phoneNumber",
          party_size AS "partySize",
          status,
          queue_position AS "queuePosition",
          waitlist_position AS "waitlistPosition",
          created_at::text AS "createdAt",
          notes
      `,
      params,
    );

    if (rowCount === 0) return null;
    return normalizeBooking(rows[0]);
  }

  async deleteBooking(id: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM bookings WHERE id = $1', [id]);
    return rowCount > 0;
  }

  async getConfig(): Promise<ActivityConfig> {
    await ensureConfigRow();
    const { rows } = await query<ActivityConfigRow>(
      `
        SELECT
          name,
          description,
          default_capacity AS "defaultCapacity",
          default_duration_minutes AS "defaultDurationMinutes",
          waitlist_enabled AS "waitlistEnabled",
          max_party_size AS "maxPartySize",
          requires_approval AS "requiresApproval",
          admin_pin AS "adminPin"
        FROM activity_config
        WHERE id = 1
        LIMIT 1
      `,
    );
    return normalizeConfig(rows[0]);
  }

  async updateConfig(updates: Partial<ActivityConfig>): Promise<ActivityConfig> {
    await ensureConfigRow();
    const fields = [
      ['name', updates.name],
      ['description', updates.description],
      ['default_capacity', updates.defaultCapacity],
      ['default_duration_minutes', updates.defaultDurationMinutes],
      ['waitlist_enabled', updates.waitlistEnabled],
      ['max_party_size', updates.maxPartySize],
      ['requires_approval', updates.requiresApproval],
      ['admin_pin', updates.adminPin],
    ].filter(([, value]) => value !== undefined);

    if (fields.length === 0) {
      return this.getConfig();
    }

    const setClause = fields.map(([column], index) => `${column} = $${index + 1}`).join(', ');
    const params = [...fields.map(([, value]) => value ?? null), 1];

    const { rows } = await query<ActivityConfigRow>(
      `
        UPDATE activity_config
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING
          name,
          description,
          default_capacity AS "defaultCapacity",
          default_duration_minutes AS "defaultDurationMinutes",
          waitlist_enabled AS "waitlistEnabled",
          max_party_size AS "maxPartySize",
          requires_approval AS "requiresApproval",
          admin_pin AS "adminPin"
      `,
      params,
    );

    return normalizeConfig(rows[0]);
  }
}

export const postgresAdapter = new PostgresAdapter();
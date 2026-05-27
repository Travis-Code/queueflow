-- Migration: Initial schema for QueueFlow

CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY,
  time VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  capacity INTEGER NOT NULL,
  booked_count INTEGER NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  duration_minutes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY,
  confirmation_code VARCHAR(16) NOT NULL,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE,
  slot_time VARCHAR(20) NOT NULL,
  slot_date DATE NOT NULL,
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64),
  email VARCHAR(128) NOT NULL,
  party_size INTEGER NOT NULL,
  status VARCHAR(16) NOT NULL,
  queue_position INTEGER NOT NULL,
  waitlist_position INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT
);

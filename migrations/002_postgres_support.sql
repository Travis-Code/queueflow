ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(32);

UPDATE bookings
SET phone_number = COALESCE(phone_number, '');

CREATE TABLE IF NOT EXISTS activity_config (
  id INTEGER PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  default_capacity INTEGER NOT NULL,
  default_duration_minutes INTEGER NOT NULL,
  waitlist_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  max_party_size INTEGER NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  admin_pin VARCHAR(64)
);

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
VALUES (1, 'General Activity', 'Reserve your spot for the activity.', 12, 30, TRUE, 6, FALSE, NULL)
ON CONFLICT (id) DO NOTHING;
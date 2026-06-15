-- Availability v2: buffer between sessions + date-specific exceptions.
--
-- buffer_mins        — gap inserted after each session before the next slot.
-- availability_exceptions — JSONB array of date-specific overrides:
--   [{ "date": "2026-08-15", "type": "off" }]                       → full day off
--   [{ "date": "2026-08-16", "type": "custom",
--      "ranges": [{ "start": "10:00", "end": "14:00" }] }]          → one-off hours

alter table therapists
  add column if not exists availability_buffer_mins integer not null default 0,
  add column if not exists availability_exceptions jsonb not null default '[]'::jsonb;

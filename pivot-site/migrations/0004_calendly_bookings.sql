-- S19 — Calendly bookings ledger (session GMV + owner handoff)
-- Booking upserts are the binary evidence the webhook handler is idempotent on
-- (booking_uuid UNIQUE, ON CONFLICT DO NOTHING). Each booking mirrors a lead row
-- in `leads` (channel 'calendly', source 'calendly_booking', status 'contacted').
-- stripe_invoice_id is reserved for the invoice-after-call flow (config/booking_billing).

CREATE TABLE calendly_bookings (
  id                TEXT PRIMARY KEY,
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  booking_uuid      TEXT NOT NULL UNIQUE,
  invitee_email     TEXT NOT NULL,
  invitee_name      TEXT,
  scheduled_for     TEXT,
  timezone          TEXT,
  event_name        TEXT,
  answers           TEXT,
  lead_id           TEXT REFERENCES leads(id),
  stripe_invoice_id TEXT,
  status            TEXT NOT NULL DEFAULT 'active',
  updated_at        TEXT,
  cancelled_at      TEXT
);

CREATE INDEX idx_calendly_bookings_email ON calendly_bookings(invitee_email);
CREATE INDEX idx_calendly_bookings_status ON calendly_bookings(status);
-- Database-backed content and theme editor for authorized administrators.
-- Idempotent and non-destructive: does not change users, sessions, scans or feedback.
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  config JSONB NOT NULL,
  updated_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Migration: 002_survey_feedback.sql
-- Description: Star-rating quality survey (feedback for admins) + per-user
--              invitation state kept server-side. Additive & idempotent:
--              no existing table or row is altered or deleted.
-- ============================================================================

CREATE TABLE IF NOT EXISTS survey_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  positive_aspects TEXT[] NOT NULL DEFAULT '{}',
  improvement_areas TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT NOT NULL DEFAULT '',
  contact_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'acknowledged', 'resolved', 'no_action')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survey_feedback_created_at ON survey_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_rating ON survey_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_status ON survey_feedback(status);
CREATE INDEX IF NOT EXISTS idx_survey_feedback_user_id ON survey_feedback(user_id, created_at DESC);

-- Per-user invitation state (server-side, never localStorage).
CREATE TABLE IF NOT EXISTS survey_invitation_state (
  user_id BIGINT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  snoozed_until TIMESTAMPTZ,
  dismissed_until TIMESTAMPTZ,
  last_prompted_at TIMESTAMPTZ,
  last_submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_survey_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_survey_feedback_updated_at ON survey_feedback;
CREATE TRIGGER trg_survey_feedback_updated_at
BEFORE UPDATE ON survey_feedback
FOR EACH ROW
EXECUTE FUNCTION update_survey_feedback_updated_at();

-- Completed SafeBot replies (scan_audit only tracks scans). Used ONLY to decide
-- survey eligibility; stores no message content.
CREATE TABLE IF NOT EXISTS usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id, kind, created_at DESC);

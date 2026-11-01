-- Additive migration: feedback attached to a completed scan result.
-- Safe to run repeatedly; does not alter existing user or scan rows.
CREATE TABLE IF NOT EXISTS result_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  module TEXT NOT NULL CHECK (module IN ('scanner', 'link_scanner')),
  result_id TEXT NOT NULL,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('helpful', 'okay', 'not_helpful')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module, result_id)
);
CREATE INDEX IF NOT EXISTS idx_result_feedback_created_at ON result_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_result_feedback_module_sentiment ON result_feedback(module, sentiment);

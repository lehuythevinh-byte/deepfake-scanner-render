-- ============================================================================
-- Migration: 004_result_feedback.sql
-- Description: Inline "Bạn thấy kết quả này thế nào?" feedback shown under each
--              AI Scanner / Link Scanner result. Additive & idempotent.
--              Stores NO uploaded media, NO URLs and NO chat content.
-- ============================================================================

CREATE TABLE IF NOT EXISTS result_feedback (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  module TEXT NOT NULL CHECK (module IN ('scanner', 'link_scanner')),
  result_id TEXT NOT NULL CHECK (char_length(result_id) BETWEEN 4 AND 80),
  sentiment TEXT NOT NULL CHECK (sentiment IN ('helpful', 'okay', 'not_helpful')),
  comment TEXT NOT NULL DEFAULT '' CHECK (char_length(comment) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One rating per result per user: blocks double submissions at the database level.
CREATE UNIQUE INDEX IF NOT EXISTS uq_result_feedback_user_result
  ON result_feedback(user_id, module, result_id);
CREATE INDEX IF NOT EXISTS idx_result_feedback_created_at ON result_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_result_feedback_module_sentiment ON result_feedback(module, sentiment);

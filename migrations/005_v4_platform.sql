-- Deepfake Scanner V4 platform schema.
-- Idempotent additive migration. Does not alter or delete V3 tables or user records.
CREATE TABLE IF NOT EXISTS v4_user_consents (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  purpose TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v4_user_consents_user_created
  ON v4_user_consents(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS v4_evidence_items (
  id UUID PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(128) NOT NULL DEFAULT 'application/octet-stream',
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0 AND size_bytes <= 52428800),
  sha256 CHAR(64) NOT NULL CHECK (sha256 ~ '^[0-9a-f]{64}$'),
  storage_mode TEXT NOT NULL DEFAULT 'device_only' CHECK (storage_mode = 'device_only'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, id)
);
CREATE INDEX IF NOT EXISTS idx_v4_evidence_user_created
  ON v4_evidence_items(user_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS v4_evidence_events (
  id BIGSERIAL PRIMARY KEY,
  evidence_id UUID NOT NULL,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  previous_event_hash CHAR(64),
  event_hash CHAR(64) NOT NULL CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id, evidence_id)
    REFERENCES v4_evidence_items(user_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_v4_evidence_events_item
  ON v4_evidence_events(user_id, evidence_id, created_at);

CREATE TABLE IF NOT EXISTS v4_quest_completions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  answer_id TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL CHECK (xp_awarded BETWEEN 0 AND 500),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quest_id)
);
CREATE INDEX IF NOT EXISTS idx_v4_quest_completions_user
  ON v4_quest_completions(user_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS v4_threat_advisories (
  id UUID PRIMARY KEY,
  created_by BIGINT NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(48) NOT NULL,
  severity VARCHAR(16) NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','withdrawn')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v4_threat_published
  ON v4_threat_advisories(status, created_at DESC) WHERE status = 'published';

CREATE TABLE IF NOT EXISTS v4_analysis_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v4_analysis_audit_user_created
  ON v4_analysis_audit(user_id, created_at DESC);

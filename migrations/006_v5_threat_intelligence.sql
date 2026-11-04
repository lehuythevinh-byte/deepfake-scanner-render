-- V5 threat-intelligence persistence and scheduler state.
-- Additive and idempotent: preserves all V3/V4 accounts, sessions, scans and evidence.

CREATE TABLE IF NOT EXISTS v5_threat_sources (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  source_url TEXT NOT NULL UNIQUE,
  source_type VARCHAR(32) NOT NULL DEFAULT 'official',
  reliability_level VARCHAR(16) NOT NULL DEFAULT 'unrated'
    CHECK (reliability_level IN ('high','medium','low','unrated')),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  last_checked_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS v5_threat_feed_snapshots (
  id BIGSERIAL PRIMARY KEY,
  feed JSONB NOT NULL,
  source_status VARCHAR(20) NOT NULL DEFAULT 'ai_only'
    CHECK (source_status IN ('web_grounded','ai_only')),
  model VARCHAR(180) NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_feed_snapshots_created
  ON v5_threat_feed_snapshots(created_at DESC);

CREATE TABLE IF NOT EXISTS v5_threat_update_runs (
  id UUID PRIMARY KEY,
  trigger_type VARCHAR(24) NOT NULL
    CHECK (trigger_type IN ('scheduler','manual','startup','on_demand')),
  status VARCHAR(20) NOT NULL
    CHECK (status IN ('running','succeeded','failed','skipped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  sources_checked INTEGER NOT NULL DEFAULT 0,
  records_discovered INTEGER NOT NULL DEFAULT 0,
  records_published INTEGER NOT NULL DEFAULT 0,
  records_rejected INTEGER NOT NULL DEFAULT 0,
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_version VARCHAR(48) NOT NULL DEFAULT 'v5.0.0'
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_runs_started
  ON v5_threat_update_runs(started_at DESC);

CREATE TABLE IF NOT EXISTS v5_threat_scheduler_state (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_successful_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  locked_until TIMESTAMPTZ,
  last_run_id UUID REFERENCES v5_threat_update_runs(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO v5_threat_scheduler_state(id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS v5_detector_versions (
  id BIGSERIAL PRIMARY KEY,
  version VARCHAR(48) NOT NULL,
  update_type VARCHAR(24) NOT NULL
    CHECK (update_type IN ('knowledge','detection_rule','model')),
  changelog TEXT NOT NULL DEFAULT '',
  test_status VARCHAR(24) NOT NULL DEFAULT 'not_tested'
    CHECK (test_status IN ('not_tested','passed','failed','approved','rolled_back')),
  approved_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_v5_detector_versions_created
  ON v5_detector_versions(created_at DESC);


-- Initial source registry. The fetcher applies an additional HTTPS host allowlist.
INSERT INTO v5_threat_sources(name, source_url, source_type, reliability_level, is_active)
VALUES
  ('CISA Cybersecurity Advisories', 'https://www.cisa.gov/cybersecurity-advisories/all.xml', 'official', 'high', TRUE),
  ('FBI National Press Releases', 'https://www.fbi.gov/news/press-releases/RSS', 'official', 'high', TRUE)
ON CONFLICT (source_url) DO UPDATE SET
  name = EXCLUDED.name,
  source_type = EXCLUDED.source_type,
  reliability_level = EXCLUDED.reliability_level,
  is_active = TRUE,
  updated_at = NOW();

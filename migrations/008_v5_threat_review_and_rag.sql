-- V5 verified threat intelligence records and review workflow.
-- Additive only. Unreviewed RSS entries never become detector rules automatically.

CREATE TABLE IF NOT EXISTS v5_threat_reports (
  id UUID PRIMARY KEY,
  source_id BIGINT REFERENCES v5_threat_sources(id) ON DELETE SET NULL,
  source_name VARCHAR(180) NOT NULL DEFAULT '',
  title VARCHAR(240) NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  source_url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMPTZ,
  incident_date TIMESTAMPTZ,
  discovery_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  classification VARCHAR(32) NOT NULL DEFAULT 'unclassified'
    CHECK (classification IN ('unclassified','deepfake','synthetic_media','voice_cloning','ai_impersonation','ai_assisted_scam','conventional_phishing','other')),
  media_type VARCHAR(24) NOT NULL DEFAULT 'unknown'
    CHECK (media_type IN ('image','video','audio','text','multimodal','unknown')),
  geographic_scope VARCHAR(120) NOT NULL DEFAULT '',
  language VARCHAR(32) NOT NULL DEFAULT '',
  target_type VARCHAR(120) NOT NULL DEFAULT '',
  attack_context TEXT NOT NULL DEFAULT '',
  observable_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  detection_relevance TEXT NOT NULL DEFAULT '',
  false_positive_risks TEXT NOT NULL DEFAULT '',
  defensive_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_reliability VARCHAR(16) NOT NULL DEFAULT 'unrated'
    CHECK (source_reliability IN ('high','medium','low','unrated')),
  evidence_confidence SMALLINT NOT NULL DEFAULT 0 CHECK (evidence_confidence BETWEEN 0 AND 100),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','needs_review','verified','rejected')),
  verification_notes TEXT NOT NULL DEFAULT '',
  verified_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  last_verified_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_reports_review
  ON v5_threat_reports(verification_status, published_at DESC NULLS LAST, discovery_date DESC);
CREATE INDEX IF NOT EXISTS idx_v5_threat_reports_verified
  ON v5_threat_reports(last_verified_at DESC) WHERE verification_status = 'verified';

CREATE TABLE IF NOT EXISTS v5_threat_review_events (
  id BIGSERIAL PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES v5_threat_reports(id) ON DELETE CASCADE,
  reviewer_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('verified','rejected','needs_review')),
  notes TEXT NOT NULL,
  evidence_confidence SMALLINT NOT NULL DEFAULT 0 CHECK (evidence_confidence BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_review_events_report
  ON v5_threat_review_events(report_id, created_at DESC);

CREATE TABLE IF NOT EXISTS v5_threat_patterns (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES v5_threat_reports(id) ON DELETE SET NULL,
  pattern_name VARCHAR(180) NOT NULL,
  category VARCHAR(48) NOT NULL,
  media_type VARCHAR(24) NOT NULL DEFAULT 'unknown',
  attack_pattern TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  first_observed_at TIMESTAMPTZ,
  last_verified_at TIMESTAMPTZ,
  geographic_scope VARCHAR(120) NOT NULL DEFAULT '',
  language VARCHAR(32) NOT NULL DEFAULT '',
  target_type VARCHAR(120) NOT NULL DEFAULT '',
  attack_context TEXT NOT NULL DEFAULT '',
  observable_indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  detection_relevance TEXT NOT NULL DEFAULT '',
  false_positive_risks TEXT NOT NULL DEFAULT '',
  defensive_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence SMALLINT NOT NULL DEFAULT 0 CHECK (evidence_confidence BETWEEN 0 AND 100),
  intelligence_version VARCHAR(48) NOT NULL DEFAULT 'v5.0.0',
  update_type VARCHAR(24) NOT NULL DEFAULT 'knowledge'
    CHECK (update_type IN ('knowledge','detection_rule')),
  test_status VARCHAR(24) NOT NULL DEFAULT 'not_tested'
    CHECK (test_status IN ('not_tested','passed','failed','approved','rolled_back')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','pending_review','approved','rejected','withdrawn')),
  -- A pattern can inform RAG after review; it is not silently wired into detector thresholds.
  enforced_by_detector BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  approved_by BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  review_due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_patterns_approved
  ON v5_threat_patterns(last_verified_at DESC) WHERE status = 'approved';

CREATE TABLE IF NOT EXISTS v5_threat_pattern_review_events (
  id BIGSERIAL PRIMARY KEY,
  pattern_id UUID NOT NULL REFERENCES v5_threat_patterns(id) ON DELETE CASCADE,
  reviewer_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('approve','reject','withdraw')),
  notes TEXT NOT NULL,
  test_evidence TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_v5_threat_pattern_review_events_pattern
  ON v5_threat_pattern_review_events(pattern_id, created_at DESC);

-- These tables are accessed only by the server-side PostgreSQL connection.
-- Enable RLS so Supabase anon/authenticated REST roles cannot read or mutate them directly.
ALTER TABLE v5_threat_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_feed_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_update_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_scheduler_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_detector_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE v5_threat_pattern_review_events ENABLE ROW LEVEL SECURITY;

-- Official feeds. If a provider changes its feed endpoint, the collector records the failure
-- and retains previous snapshots/reports rather than deleting historical information.
INSERT INTO v5_threat_sources(name, source_url, source_type, reliability_level, is_active)
VALUES
  ('FBI Internet Crime Complaint Center (IC3) Public Service Announcements', 'https://www.ic3.gov/PSA/RSS', 'official', 'high', TRUE),
  ('NIST Cybersecurity Insights', 'https://www.nist.gov/blogs/cybersecurity-insights/rss.xml', 'official', 'high', TRUE)
ON CONFLICT (source_url) DO UPDATE SET
  name = EXCLUDED.name,
  source_type = EXCLUDED.source_type,
  reliability_level = EXCLUDED.reliability_level,
  is_active = TRUE,
  updated_at = NOW();

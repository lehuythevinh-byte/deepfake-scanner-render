-- ============================================================================
-- Migration: 001_init_users_roles_scan_history.sql
-- Description: Automated idempotent schema initialization for users, roles, 
--              sessions, and scan history without deleting existing data.
-- Engine: PostgreSQL
-- ============================================================================

-- 1. Bảng Vai trò & Quyền hạn hệ thống (Roles & Permissions)
-- Giúp mở rộng RBAC phân quyền bảo mật cao trong tương lai mà không ảnh hưởng bảng hiện có
CREATE TABLE IF NOT EXISTS app_roles (
  role_id VARCHAR(32) PRIMARY KEY,
  role_name VARCHAR(64) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Khởi tạo các vai trò mặc định (nếu chưa có, không ghi đè dữ liệu cũ)
INSERT INTO app_roles (role_id, role_name, description, permissions)
VALUES 
  ('admin', 'Quản trị viên hệ thống', 'Toàn quyền cấu hình, xem nhật ký, chẩn đoán hệ thống và quản lý tài khoản.', '["all", "view_audit", "manage_users", "view_diagnostics"]'::jsonb),
  ('user', 'Người dùng tiêu chuẩn', 'Quyền sử dụng AI Scanner, Link Scanner, SafeBot và quản lý lịch sử cá nhân.', '["scan_media", "scan_link", "chat_safebot", "view_own_history", "delete_own_history"]'::jsonb),
  ('moderator', 'Kiểm duyệt viên an toàn', 'Quyền xem xét các báo cáo cảnh báo khẩn cấp và rà soát bẫy lừa đảo.', '["view_reports", "flag_threats"]'::jsonb)
ON CONFLICT (role_id) DO NOTHING;

-- 2. Bảng Tài khoản người dùng (App Users)
CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bổ sung an toàn các cột mới nếu bảng app_users đã tồn tại từ phiên bản cũ
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Bảng Phiên làm việc Opaque Session (App Sessions)
CREATE TABLE IF NOT EXISTS app_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bổ sung an toàn các cột cho app_sessions nếu đã tồn tại
ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS token_hash CHAR(64);
ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE app_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Bảng Lịch sử giám định an toàn số (Scan Audit / Scan History)
CREATE TABLE IF NOT EXISTS scan_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
  scan_mode TEXT NOT NULL,
  engine TEXT NOT NULL,
  model TEXT,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bổ sung an toàn tất cả các trường nâng cấp của Master Prompt V2 vào scan_audit
-- Đảm bảo 100% không xóa hoặc gián đoạn các bản ghi quét trước đó!
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS report_id TEXT;
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS risk_level TEXT;
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS summary_label TEXT;
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE scan_audit ADD COLUMN IF NOT EXISTS duration_ms INTEGER NOT NULL DEFAULT 0;

-- 5. Tạo các Index tối ưu hiệu năng truy vấn (Tự động bỏ qua nếu đã có)
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);
CREATE INDEX IF NOT EXISTS idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_sessions_expires_at ON app_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_scan_audit_user_id ON scan_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_audit_created_at ON scan_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_audit_report_id ON scan_audit(report_id);
CREATE INDEX IF NOT EXISTS idx_scan_audit_risk_level ON scan_audit(risk_level);
CREATE INDEX IF NOT EXISTS idx_scan_audit_scan_mode ON scan_audit(scan_mode);

-- 6. Trigger tự động cập nhật `updated_at` cho `app_users` khi có thay đổi
CREATE OR REPLACE FUNCTION update_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW
EXECUTE FUNCTION update_app_users_updated_at();

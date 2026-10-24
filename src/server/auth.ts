import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Express, Request, Response, NextFunction } from 'express';
import { Pool, type PoolClient } from 'pg';

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const SESSION_COOKIE = 'dfscan_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const authRateBuckets = new Map<string, { count: number; resetAt: number }>();

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt?: string;
  lastLoginAt?: string | null;
};

type DbUser = {
  id: string | number;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  password_hash?: string;
  created_at?: Date | string;
  last_login_at?: Date | string | null;
};

let pool: Pool | null = null;
let authStoreReady = false;
let authStoreErrorCode: string | null = null;

function getPool(): Pool | null {
  const databaseUrl = (process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    });
    pool.on('error', (error) => {
      console.error('[AuthStore] PostgreSQL idle client error:', error.message);
      authStoreErrorCode = 'DATABASE_CONNECTION_ERROR';
    });
  }
  return pool;
}

export function getAuthStoreStatus() {
  return {
    configured: Boolean((process.env.DATABASE_URL || '').trim()),
    ready: authStoreReady,
    errorCode: authStoreReady ? null : authStoreErrorCode,
  };
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex || !/^[a-f0-9]+$/i.test(saltHex) || !/^[a-f0-9]+$/i.test(hashHex)) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  // Password hashes created by this application use a 16-byte salt and a 64-byte key.
  // Reject malformed/corrupted rows cleanly rather than throwing from scrypt.
  if (salt.length !== 16 || expected.length !== 64) return false;
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function mapUser(row: DbUser): AuthUser {
  return {
    id: String(row.id),
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    ...(row.created_at ? { createdAt: new Date(row.created_at).toISOString() } : {}),
    ...(row.last_login_at ? { lastLoginAt: new Date(row.last_login_at).toISOString() } : { lastLoginAt: null }),
  };
}

function readCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      try { return decodeURIComponent(part.slice(separator + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

function setSessionCookie(req: Request, res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production' || req.secure;
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure ? '; Secure' : ''}`);
}

function clearSessionCookie(req: Request, res: Response) {
  const secure = process.env.NODE_ENV === 'production' || req.secure;
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
}

function rateLimit(req: Request, res: Response, bucketName: string, maxRequests: number): boolean {
  const now = Date.now();
  // Keep the in-memory guard bounded even if requests arrive from many IPs.
  if (authRateBuckets.size > 3000) {
    for (const [key, value] of authRateBuckets) if (value.resetAt <= now) authRateBuckets.delete(key);
    if (authRateBuckets.size > 3000) authRateBuckets.clear();
  }
  const key = `${bucketName}:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  const current = authRateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    authRateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= maxRequests) {
    res.status(429).json({ error: 'RATE_LIMITED', message: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.' });
    return false;
  }
  current.count += 1;
  return true;
}

function authUnavailable(res: Response) {
  res.status(503).json({
    error: 'AUTH_STORE_UNAVAILABLE',
    message: 'Hệ thống tài khoản chưa sẵn sàng. Quản trị viên cần cấu hình DATABASE_URL và kiểm tra kết nối PostgreSQL.',
  });
}

async function findSessionUser(req: Request): Promise<DbUser | null> {
  if (!authStoreReady) return null;
  const db = getPool();
  const token = readCookie(req, SESSION_COOKIE);
  if (!db || !token || token.length > 200) return null;
  const result = await db.query<DbUser>(
    `SELECT u.id::text AS id, u.email, u.display_name, u.role, u.status, u.created_at, u.last_login_at
     FROM auth_sessions s JOIN app_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()
     LIMIT 1`,
    [sha256(token)],
  );
  return result.rows[0] || null;
}

async function requireUser(req: Request, res: Response): Promise<AuthUser | null> {
  if (!authStoreReady) {
    authUnavailable(res);
    return null;
  }
  let row: DbUser | null;
  try {
    row = await findSessionUser(req);
  } catch (error: any) {
    console.error('[Auth] Session validation failed:', error?.message || error);
    res.status(503).json({ error: 'AUTH_STORE_TEMPORARILY_UNAVAILABLE', message: 'Dịch vụ tài khoản tạm thời không khả dụng. Vui lòng thử lại.' });
    return null;
  }
  if (!row) {
    clearSessionCookie(req, res);
    res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Vui lòng đăng nhập để tiếp tục.' });
    return null;
  }
  if (row.status !== 'active') {
    await revokeRequestSession(req).catch(() => undefined);
    clearSessionCookie(req, res);
    res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'Tài khoản đang bị tạm khóa. Vui lòng liên hệ quản trị viên.' });
    return null;
  }
  return mapUser(row);
}

async function requireAdmin(req: Request, res: Response): Promise<AuthUser | null> {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'ADMIN_REQUIRED', message: 'Bạn không có quyền truy cập chức năng quản trị.' });
    return null;
  }
  return user;
}

async function revokeRequestSession(req: Request) {
  const db = getPool();
  const token = readCookie(req, SESSION_COOKIE);
  if (db && token) await db.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [sha256(token)]);
}

async function createSessionToken(client: PoolClient, userId: string): Promise<string> {
  // Insert the session using the caller's transaction so an account and its first
  // session cannot be left half-created if the database fails midway.
  const token = randomBytes(32).toString('base64url');
  await client.query(
    'INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
    [userId, sha256(token)],
  );
  return token;
}

async function writeAudit(adminId: string, action: string, targetUserId: string | null, details: Record<string, unknown>, req: Request) {
  const db = getPool();
  if (!db) return;
  await db.query(
    'INSERT INTO admin_audit_logs (admin_user_id, action, target_user_id, details, ip_address) VALUES ($1, $2, $3, $4::jsonb, $5)',
    [adminId, action, targetUserId, JSON.stringify(details), String(req.ip || '').slice(0, 100)],
  );
}

export async function initializeAuthStore(): Promise<void> {
  const db = getPool();
  if (!db) {
    authStoreReady = false;
    authStoreErrorCode = 'DATABASE_URL_MISSING';
    console.warn('[AuthStore] DATABASE_URL is not set. Existing guest tools remain available; User/Admin features are disabled.');
    return;
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        display_name VARCHAR(80) NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        status VARCHAR(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        token_hash CHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        revoked_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions(user_id);
      CREATE INDEX IF NOT EXISTS auth_sessions_expiry_idx ON auth_sessions(expires_at);
      CREATE TABLE IF NOT EXISTS scan_history (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
        scan_mode VARCHAR(40) NOT NULL,
        file_name VARCHAR(255) NOT NULL DEFAULT 'content_sample',
        overall_status VARCHAR(60) NOT NULL DEFAULT 'inconclusive',
        summary TEXT NOT NULL DEFAULT '',
        is_heuristic BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS scan_history_user_created_idx ON scan_history(user_id, created_at DESC);
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id BIGSERIAL PRIMARY KEY,
        admin_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        target_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        ip_address VARCHAR(100),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS admin_audit_created_idx ON admin_audit_logs(created_at DESC);
      CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    `);

    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const adminName = (process.env.ADMIN_NAME || 'System Administrator').trim().slice(0, 80);
    if (adminEmail && EMAIL_RE.test(adminEmail) && adminPassword.length >= 12) {
      const bootstrap = await db.query("SELECT value FROM app_settings WHERE key = 'admin_bootstrap_completed' LIMIT 1");
      if (bootstrap.rowCount === 0) {
        const existing = await db.query('SELECT id FROM app_users WHERE email = $1 LIMIT 1', [adminEmail]);
        if (existing.rowCount) {
          // Preserve the existing password; the environment bootstrap only grants the initial role.
          await db.query("UPDATE app_users SET role = 'admin', status = 'active' WHERE email = $1", [adminEmail]);
        } else {
          const passwordHash = await hashPassword(adminPassword);
          await db.query(
            `INSERT INTO app_users (email, display_name, password_hash, role, status)
             VALUES ($1, $2, $3, 'admin', 'active') ON CONFLICT (email) DO NOTHING`,
            [adminEmail, adminName || 'System Administrator', passwordHash],
          );
        }
        await db.query(`INSERT INTO app_settings (key, value) VALUES ('admin_bootstrap_completed', 'true') ON CONFLICT (key) DO NOTHING`);
        console.info('[AuthStore] Initial administrator bootstrap was applied.');
      } else {
        console.info('[AuthStore] Initial administrator bootstrap already completed; existing role changes are preserved.');
      }
    } else {
      console.warn('[AuthStore] ADMIN_EMAIL / ADMIN_PASSWORD not valid for bootstrap. Set a valid email and password of at least 12 characters to provision an admin.');
    }

    await db.query('DELETE FROM auth_sessions WHERE expires_at < NOW() OR revoked_at < NOW() - INTERVAL \'30 days\'');
    authStoreReady = true;
    authStoreErrorCode = null;
    console.info('[AuthStore] PostgreSQL schema is ready.');
  } catch (error: any) {
    authStoreReady = false;
    authStoreErrorCode = 'DATABASE_INITIALIZATION_FAILED';
    console.error('[AuthStore] Database initialization failed:', error?.message || error);
  }
}

export async function initializeAuthStoreWithRetry(): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await initializeAuthStore();
    const state = getAuthStoreStatus();
    if (state.ready || !state.configured) return;
    if (attempt < 4) {
      const delayMs = Math.min(1000 * (2 ** attempt), 8000);
      console.warn(`[AuthStore] Will retry PostgreSQL initialization in ${delayMs}ms (attempt ${attempt + 1}/5).`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

export function registerAuthRoutes(app: Express): void {
  app.set('trust proxy', 1);

  app.post('/api/auth/register', async (req, res) => {
    if (!rateLimit(req, res, 'register', 5)) return;
    if (!authStoreReady) return authUnavailable(res);
    const db = getPool();
    if (!db) return authUnavailable(res);

    const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (displayName.length < 2 || displayName.length > 80) {
      return res.status(400).json({ error: 'INVALID_NAME', message: 'Tên hiển thị phải từ 2 đến 80 ký tự.' });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Vui lòng nhập địa chỉ email hợp lệ.' });
    }
    if (password.length < 10 || password.length > 128) {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'Mật khẩu phải có từ 10 đến 128 ký tự.' });
    }

    let client: PoolClient | null = null;
    let transactionStarted = false;
    try {
      client = await db.connect();
      await client.query('BEGIN');
      transactionStarted = true;
      const passwordHash = await hashPassword(password);
      const result = await client.query<DbUser>(
        `INSERT INTO app_users (email, display_name, password_hash) VALUES ($1, $2, $3)
         RETURNING id::text AS id, email, display_name, role, status, created_at, last_login_at`,
        [email, displayName, passwordHash],
      );
      const user = result.rows[0];
      const token = await createSessionToken(client, String(user.id));
      await client.query('COMMIT');
      transactionStarted = false;
      setSessionCookie(req, res, token);
      return res.status(201).json({ success: true, user: mapUser(user) });
    } catch (error: any) {
      if (client && transactionStarted) {
        await client.query('ROLLBACK').catch((rollbackError: any) => {
          console.warn('[Auth] Registration rollback failed:', rollbackError?.message || rollbackError);
        });
      }
      if (error?.code === '23505') {
        return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email này đã được đăng ký. Hãy đăng nhập hoặc sử dụng email khác.' });
      }
      console.error('[Auth] Registration failed:', error?.message || error);
      return res.status(500).json({ error: 'REGISTER_FAILED', message: 'Không thể tạo tài khoản lúc này. Vui lòng thử lại sau ít phút.' });
    } finally {
      client?.release();
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    if (!rateLimit(req, res, 'login', 10)) return;
    if (!authStoreReady) return authUnavailable(res);
    const db = getPool();
    if (!db) return authUnavailable(res);

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!EMAIL_RE.test(email) || email.length > 254 || !password || password.length > 128) {
      return res.status(400).json({ error: 'INVALID_CREDENTIALS', message: 'Vui lòng kiểm tra lại email và mật khẩu.' });
    }

    let client: PoolClient | null = null;
    let transactionStarted = false;
    try {
      client = await db.connect();
      await client.query('BEGIN');
      transactionStarted = true;
      // Lock the account row while checking status and creating the session, so a
      // concurrent admin suspension cannot race with successful login.
      const result = await client.query<DbUser>(
        'SELECT id::text AS id, email, display_name, password_hash, role, status, created_at, last_login_at FROM app_users WHERE email = $1 LIMIT 1 FOR UPDATE',
        [email],
      );
      const row = result.rows[0];
      const valid = row ? await verifyPassword(password, row.password_hash || '') : false;
      if (!row || !valid) {
        await client.query('ROLLBACK');
        transactionStarted = false;
        return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu chưa chính xác.' });
      }
      if (row.status !== 'active') {
        await client.query('ROLLBACK');
        transactionStarted = false;
        return res.status(403).json({ error: 'ACCOUNT_SUSPENDED', message: 'Tài khoản đang bị tạm khóa. Vui lòng liên hệ quản trị viên.' });
      }

      await client.query('UPDATE app_users SET last_login_at = NOW() WHERE id = $1', [row.id]);
      const token = await createSessionToken(client, String(row.id));
      await client.query('COMMIT');
      transactionStarted = false;
      setSessionCookie(req, res, token);
      return res.json({ success: true, user: mapUser({ ...row, last_login_at: new Date() }) });
    } catch (error: any) {
      if (client && transactionStarted) {
        await client.query('ROLLBACK').catch((rollbackError: any) => {
          console.warn('[Auth] Login rollback failed:', rollbackError?.message || rollbackError);
        });
      }
      console.error('[Auth] Login failed:', error?.message || error);
      return res.status(500).json({ error: 'LOGIN_FAILED', message: 'Không thể đăng nhập lúc này. Vui lòng thử lại sau ít phút.' });
    } finally {
      client?.release();
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try { await revokeRequestSession(req); } catch (error: any) { console.warn('[Auth] Session revoke failed:', error?.message || error); }
    clearSessionCookie(req, res);
    res.json({ success: true });
  });

  app.get('/api/auth/me', async (req, res) => {
    const state = getAuthStoreStatus();
    if (!authStoreReady) return res.json({ authenticated: false, authAvailable: state.configured && state.ready, authStore: state.errorCode });
    try {
      const row = await findSessionUser(req);
      if (!row || row.status !== 'active') {
        if (row?.status === 'suspended') await revokeRequestSession(req).catch(() => undefined);
        clearSessionCookie(req, res);
        return res.json({ authenticated: false, authAvailable: true });
      }
      return res.json({ authenticated: true, authAvailable: true, user: mapUser(row) });
    } catch (error: any) {
      console.error('[Auth] Session lookup failed:', error?.message || error);
      return res.json({ authenticated: false, authAvailable: false, authStore: 'DATABASE_QUERY_FAILED' });
    }
  });

  app.get('/api/me/scans', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const rows = await getPool()!.query(
        `SELECT id::text AS id, scan_mode AS "scanMode", file_name AS "fileName",
                overall_status AS "overallStatus", summary, is_heuristic AS "isHeuristic", created_at AS "createdAt"
         FROM scan_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
        [user.id],
      );
      return res.json({ scans: rows.rows });
    } catch (error: any) {
      console.error('[User] Scan history lookup failed:', error?.message || error);
      return res.status(500).json({ error: 'HISTORY_FAILED', message: 'Không thể tải lịch sử phân tích.' });
    }
  });

  app.delete('/api/me/scans', async (req, res) => {
    const user = await requireUser(req, res);
    if (!user) return;
    try {
      const result = await getPool()!.query('DELETE FROM scan_history WHERE user_id = $1', [user.id]);
      return res.json({ success: true, deleted: result.rowCount || 0 });
    } catch (error: any) {
      console.error('[User] Scan history deletion failed:', error?.message || error);
      return res.status(500).json({ error: 'HISTORY_DELETE_FAILED', message: 'Không thể xóa lịch sử lúc này.' });
    }
  });

  app.get('/api/admin/overview', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const db = getPool()!;
      const [users, scans, recentScans, recentUsers] = await Promise.all([
        db.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'active')::int AS active,
                         COUNT(*) FILTER (WHERE status = 'suspended')::int AS suspended,
                         COUNT(*) FILTER (WHERE role = 'admin')::int AS admins FROM app_users`),
        db.query('SELECT COUNT(*)::int AS total FROM scan_history'),
        db.query('SELECT COUNT(*)::int AS total FROM scan_history WHERE created_at >= NOW() - INTERVAL \'24 hours\''),
        db.query('SELECT COUNT(*)::int AS total FROM app_users WHERE created_at >= NOW() - INTERVAL \'7 days\''),
      ]);
      return res.json({
        users: users.rows[0],
        scans: { total: scans.rows[0].total, last24Hours: recentScans.rows[0].total },
        newUsersLast7Days: recentUsers.rows[0].total,
        authStore: getAuthStoreStatus(),
        ai: { configured: Boolean((process.env.GEMINI_API_KEY || '').trim()), model: (process.env.GEMINI_MODEL || 'gemini-3.8-flash').trim() },
      });
    } catch (error: any) {
      console.error('[Admin] Overview failed:', error?.message || error);
      return res.status(500).json({ error: 'ADMIN_OVERVIEW_FAILED', message: 'Không thể tải số liệu quản trị.' });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    try {
      const result = await getPool()!.query<DbUser>(
        `SELECT id::text AS id, email, display_name, role, status, created_at, last_login_at
         FROM app_users
         WHERE ($1 = '' OR email ILIKE '%' || $1 || '%' OR display_name ILIKE '%' || $1 || '%')
         ORDER BY created_at DESC LIMIT 200`, [search],
      );
      return res.json({ users: result.rows.map(mapUser) });
    } catch (error: any) {
      console.error('[Admin] User list failed:', error?.message || error);
      return res.status(500).json({ error: 'ADMIN_USERS_FAILED', message: 'Không thể tải danh sách tài khoản.' });
    }
  });

  app.patch('/api/admin/users/:id/status', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const targetId = req.params.id;
    const status = req.body?.status;
    if (!/^\d{1,18}$/.test(targetId) || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'INVALID_USER_STATUS', message: 'Thông tin tài khoản hoặc trạng thái không hợp lệ.' });
    }
    if (admin.id === targetId && status === 'suspended') {
      return res.status(400).json({ error: 'CANNOT_SUSPEND_SELF', message: 'Bạn không thể tự khóa tài khoản quản trị đang sử dụng.' });
    }
    const db = getPool()!;
    const client: PoolClient = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(984201)');
      const targetResult = await client.query<DbUser>('SELECT id::text AS id, email, display_name, role, status FROM app_users WHERE id = $1 FOR UPDATE', [targetId]);
      const target = targetResult.rows[0];
      if (!target) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Không tìm thấy tài khoản.' });
      }
      if (target.role === 'admin' && target.status === 'active' && status === 'suspended') {
        const count = await client.query('SELECT COUNT(*)::int AS count FROM app_users WHERE role = \'admin\' AND status = \'active\'');
        if (count.rows[0].count <= 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'LAST_ADMIN', message: 'Không thể khóa Admin hoạt động cuối cùng.' });
        }
      }
      await client.query('UPDATE app_users SET status = $1 WHERE id = $2', [status, targetId]);
      if (status === 'suspended') await client.query('UPDATE auth_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [targetId]);
      await client.query('COMMIT');
      await writeAudit(admin.id, status === 'suspended' ? 'user.suspend' : 'user.activate', targetId, { email: target.email }, req).catch((auditError: any) => console.warn('[Admin] Audit write failed:', auditError?.message || auditError));
      return res.json({ success: true, userId: targetId, status });
    } catch (error: any) {
      await client.query('ROLLBACK').catch(() => undefined);
      console.error('[Admin] User status update failed:', error?.message || error);
      return res.status(500).json({ error: 'USER_STATUS_UPDATE_FAILED', message: 'Không thể cập nhật trạng thái tài khoản.' });
    } finally {
      client.release();
    }
  });

  app.patch('/api/admin/users/:id/role', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const targetId = req.params.id;
    const role = req.body?.role;
    if (!/^\d{1,18}$/.test(targetId) || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'INVALID_USER_ROLE', message: 'Vai trò không hợp lệ.' });
    }
    if (admin.id === targetId) return res.status(400).json({ error: 'CANNOT_CHANGE_SELF_ROLE', message: 'Bạn không thể tự đổi vai trò của mình.' });
    const client: PoolClient = await getPool()!.connect();
    let target: DbUser | undefined;
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(984201)');
      const targetResult = await client.query<DbUser>('SELECT id::text AS id, email, role, status FROM app_users WHERE id = $1 FOR UPDATE', [targetId]);
      target = targetResult.rows[0];
      if (!target) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Không tìm thấy tài khoản.' });
      }
      if (target.role === 'admin' && target.status === 'active' && role === 'user') {
        const count = await client.query("SELECT COUNT(*)::int AS count FROM app_users WHERE role = 'admin' AND status = 'active'");
        if (count.rows[0].count <= 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'LAST_ADMIN', message: 'Không thể hạ quyền Admin hoạt động cuối cùng.' });
        }
      }
      await client.query('UPDATE app_users SET role = $1 WHERE id = $2', [role, targetId]);
      await client.query('COMMIT');
    } catch (error: any) {
      await client.query('ROLLBACK').catch(() => undefined);
      console.error('[Admin] User role update failed:', error?.message || error);
      return res.status(500).json({ error: 'USER_ROLE_UPDATE_FAILED', message: 'Không thể cập nhật vai trò.' });
    } finally {
      client.release();
    }
    if (target) {
      await writeAudit(admin.id, role === 'admin' ? 'user.promote_admin' : 'user.demote_admin', targetId, { email: target.email }, req).catch((auditError: any) => console.warn('[Admin] Audit write failed:', auditError?.message || auditError));
    }
    return res.json({ success: true, userId: targetId, role });
  });

  app.get('/api/admin/audit', async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      const result = await getPool()!.query(
        `SELECT l.id::text AS id, l.action, l.details, l.ip_address AS "ipAddress", l.created_at AS "createdAt",
                a.email AS "adminEmail", t.email AS "targetEmail"
         FROM admin_audit_logs l
         LEFT JOIN app_users a ON a.id = l.admin_user_id
         LEFT JOIN app_users t ON t.id = l.target_user_id
         ORDER BY l.created_at DESC LIMIT 100`,
      );
      return res.json({ logs: result.rows });
    } catch (error: any) {
      console.error('[Admin] Audit lookup failed:', error?.message || error);
      return res.status(500).json({ error: 'AUDIT_LOG_FAILED', message: 'Không thể tải nhật ký kiểm toán.' });
    }
  });
}

export function attachOptionalUserForScans(app: Express): void {
  app.use('/api/scan', async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (authStoreReady) {
        const row = await findSessionUser(req);
        if (row?.status === 'active') (req as any).authUser = mapUser(row);
      }
    } catch (error: any) {
      console.warn('[Auth] Optional scan identity lookup failed:', error?.message || error);
    }
    next();
  });
}

export async function saveScanHistory(user: AuthUser | undefined, record: {
  scanMode: string;
  fileName?: string;
  overallStatus?: string;
  summary?: string;
  isHeuristic?: boolean;
}): Promise<void> {
  const db = getPool();
  if (!db || !authStoreReady || !user || user.status !== 'active') return;
  try {
    await db.query(
      `INSERT INTO scan_history (user_id, scan_mode, file_name, overall_status, summary, is_heuristic)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, String(record.scanMode).slice(0, 40), String(record.fileName || 'content_sample').slice(0, 255), String(record.overallStatus || 'inconclusive').slice(0, 60), String(record.summary || '').slice(0, 1200), Boolean(record.isHeuristic)],
    );
  } catch (error: any) {
    console.warn('[Auth] Could not save scan history:', error?.message || error);
  }
}

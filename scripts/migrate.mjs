// ============================================================================
// Automated Database Migration Runner for PostgreSQL
// Project: DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ
// Mode: Fully Idempotent, Non-Destructive
// ============================================================================

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { scrypt as scryptCallback, randomBytes } from 'node:crypto';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.resolve(ROOT_DIR, 'migrations');

// Helper to hash password matching server.ts scrypt convention
function scryptPassword(password, salt) {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, 32, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptPassword(password, salt);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

/**
 * Executes all pending database migrations safely without deleting existing data.
 * @param {pg.Pool} [customPool] - Optional existing pg.Pool instance
 * @returns {Promise<{ success: boolean, applied: string[], skipped: string[], errors: string[] }>}
 */
export async function runMigrations(customPool = null) {
  const startTime = Date.now();
  console.log('------------------------------------------------------------');
  console.log('[Migration] Starting automated PostgreSQL database migration...');
  console.log('------------------------------------------------------------');

  const databaseUrl = (process.env.DATABASE_URL || '').trim();

  let pool = customPool;
  let shouldClosePool = false;

  if (!pool) {
    if (!databaseUrl) {
      console.warn('[Migration] [WARNING] DATABASE_URL is not set.');
      console.warn('[Migration] Skipping migrations. Account and scan history persistence requires DATABASE_URL.');
      return { success: false, applied: [], skipped: [], errors: ['DATABASE_URL_NOT_CONFIGURED'] };
    }

    pool = new Pool({
      connectionString: databaseUrl,
      max: 3,
      connectionTimeoutMillis: 8000,
      ssl:
        process.env.DATABASE_SSL === 'disable'
          ? false
          : process.env.NODE_ENV === 'production' || databaseUrl.includes('render.com') || databaseUrl.includes('sslmode=require')
          ? { rejectUnauthorized: false }
          : undefined,
    });
    shouldClosePool = true;
  }

  const client = await pool.connect();
  const summary = {
    success: true,
    applied: [],
    skipped: [],
    errors: [],
  };

  try {
    // 1. Tạo bảng quản lý phiên bản migration nếu chưa tồn tại
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(128) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        duration_ms INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
    `);

    // 2. Lấy danh sách các migration đã thực thi
    const appliedRes = await client.query('SELECT version FROM schema_migrations ORDER BY id ASC');
    const appliedVersions = new Set(appliedRes.rows.map((r) => r.version));

    // 3. Đọc tất cả các tệp .sql trong thư mục migrations
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log(`[Migration] Creating missing migrations directory at: ${MIGRATIONS_DIR}`);
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[Migration] No SQL migration files found in migrations/ directory.');
    }

    // 4. Chạy từng migration chưa áp dụng theo thứ tự
    for (const file of files) {
      const version = file.split('_')[0] || file;
      if (appliedVersions.has(version)) {
        console.log(`[Migration] [SKIPPED] ${file} (already applied)`);
        summary.skipped.push(file);
        continue;
      }

      console.log(`[Migration] [APPLYING] ${file}...`);
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      const migrationStart = Date.now();
      try {
        await client.query('BEGIN');
        await client.query(sqlContent);

        const durationMs = Date.now() - migrationStart;
        await client.query(
          `INSERT INTO schema_migrations (version, name, duration_ms)
           VALUES ($1, $2, $3)
           ON CONFLICT (version) DO UPDATE SET duration_ms = $3`,
          [version, file, durationMs]
        );

        await client.query('COMMIT');
        console.log(`[Migration] [SUCCESS] ${file} completed in ${durationMs}ms`);
        summary.applied.push(file);
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(`[Migration] [FAILED] ${file}:`, migrationError.message);
        summary.errors.push(`${file}: ${migrationError.message}`);
        summary.success = false;
        throw migrationError;
      }
    }

    // 5. Đồng bộ an toàn tài khoản Quản trị viên (Admin) từ biến môi trường
    const adminEmail = String(process.env.ADMIN_EMAIL || process.env.ADMIN_INITIAL_EMAIL || '')
      .trim()
      .replace(/^["']|["']$/g, '')
      .toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || process.env.ADMIN_INITIAL_PASSWORD || '')
      .trim()
      .replace(/^["']|["']$/g, '');

    if (adminEmail && adminPassword && adminPassword.length >= 6 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      console.log(`[Migration] Synchronizing administrator account: ${adminEmail}`);
      const passwordHash = await hashPassword(adminPassword);
      await client.query(
        `INSERT INTO app_users (email, display_name, password_hash, role, status)
         VALUES ($1, 'Quản trị viên', $2, 'admin', 'active')
         ON CONFLICT (email) DO UPDATE SET
           display_name = 'Quản trị viên',
           password_hash = $2,
           role = 'admin',
           status = 'active',
           updated_at = NOW()`,
        [adminEmail, passwordHash]
      );
      console.log('[Migration] Administrator account verified & updated successfully.');
    } else if (adminEmail || adminPassword) {
      console.warn('[Migration] [NOTICE] ADMIN_EMAIL or ADMIN_PASSWORD format invalid. Admin sync skipped.');
    }

    const totalDuration = Date.now() - startTime;
    console.log('------------------------------------------------------------');
    console.log(`[Migration] Finished in ${totalDuration}ms. Applied: ${summary.applied.length}, Skipped: ${summary.skipped.length}`);
    console.log('------------------------------------------------------------');
  } catch (error) {
    console.error('[Migration] [ERROR] Migration pipeline failed:', error.message);
    summary.success = false;
    summary.errors.push(error.message);
  } finally {
    client.release();
    if (shouldClosePool && pool) {
      await pool.end();
    }
  }

  return summary;
}

// Nếu tệp được chạy trực tiếp bằng dòng lệnh: node scripts/migrate.mjs
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isDirectExecution) {
  runMigrations()
    .then((result) => {
      if (!result.success && result.errors.length > 0 && !result.errors.includes('DATABASE_URL_NOT_CONFIGURED')) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Fatal error:', err);
      process.exit(1);
    });
}

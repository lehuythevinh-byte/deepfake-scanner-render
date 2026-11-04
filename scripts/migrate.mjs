import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS = [
  '001_init_users_roles_scan_history.sql',
  '002_survey_feedback.sql',
  '003_site_customization.sql',
  '004_result_feedback.sql',
  '005_v4_platform.sql',
  '006_v5_threat_intelligence.sql',
  '007_v5_brand_refresh.sql',
  '008_v5_threat_review_and_rag.sql',
];

export async function runMigrations(pool) {
  if (!pool) return;
  const here = path.dirname(fileURLToPath(import.meta.url));
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const migrationName of MIGRATIONS) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Serialize all migration runners across Render instances / manual CLI runs.
      await client.query('SELECT pg_advisory_xact_lock(74020261102)');
      const check = await client.query(
        'SELECT migration_name FROM schema_migrations WHERE migration_name = $1 FOR UPDATE',
        [migrationName],
      );
      if (check.rowCount === 0) {
        const sql = await readFile(path.join(here, '..', 'migrations', migrationName), 'utf8');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations(migration_name) VALUES($1) ON CONFLICT(migration_name) DO NOTHING',
          [migrationName],
        );
        console.info(`[Postgres] Migration applied: ${migrationName}`);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      console.error(`[Postgres] Migration failed: ${migrationName}`, error?.message || error);
      throw error;
    } finally {
      client.release();
    }
  }
}


// Standalone CLI entry point. The server imports runMigrations() directly.
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  dotenv.config();
  const databaseUrl = String(process.env.DATABASE_URL || '').trim();
  if (!databaseUrl) {
    console.error('[Migration] DATABASE_URL is required.');
    process.exitCode = 1;
  } else {
    const caFile = String(process.env.DATABASE_SSL_CA_FILE || '').trim();
    let ca;
    if (caFile) ca = readFileSync(path.resolve(process.cwd(), caFile));
    const url = new URL(databaseUrl);
    if (caFile) ['sslmode', 'sslrootcert', 'sslcert', 'sslkey', 'uselibpqcompat'].forEach((key) => url.searchParams.delete(key));
    const pool = new pg.Pool({
      connectionString: caFile ? url.toString() : databaseUrl,
      max: 2,
      connectionTimeoutMillis: 10000,
      ssl: process.env.DATABASE_SSL === 'disable' && process.env.NODE_ENV !== 'production'
        ? false
        : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    });
    try {
      await runMigrations(pool);
      console.info('[Migration] All migrations are up to date.');
    } catch (error) {
      console.error('[Migration] Failed:', error?.message || error);
      process.exitCode = 1;
    } finally {
      await pool.end();
    }
  }
}

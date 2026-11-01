export async function runMigrations(pool) {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY,
        config JSONB NOT NULL,
        updated_by VARCHAR(120),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    console.warn('[Postgres] Migration warning:', err?.message || err);
  }
}

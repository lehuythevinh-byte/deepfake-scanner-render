import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFile(path.join(root, relative), 'utf8');
const exists = async (relative) => access(path.join(root, relative)).then(() => true, () => false);
const checks = [];
function check(name, condition, detail = '') {
  assert.ok(condition, `${name}${detail ? `: ${detail}` : ''}`);
  checks.push(name);
}

const pkg = JSON.parse(await read('package.json'));
const lock = JSON.parse(await read('package-lock.json'));
const server = await read('server.ts');
const migrationRunner = await read('scripts/migrate.mjs');
const migration = await read('migrations/008_v5_threat_review_and_rag.sql');
const render = await read('render.yaml');
const schedule = await read('.github/workflows/threat-intelligence-48h.yml');
const ci = await read('.github/workflows/ci.yml');
const envExample = await read('.env.example');
const openRouterGuide = await read('OPENROUTER_MULTI_AI_SETUP_VI.md');
const scannerUi = await read('src/components/ScannerModule.tsx');
const intelUi = await read('src/components/DigitalTrustToolsModule.tsx');

check('package and lock versions match', pkg.version === lock.version && pkg.version === lock.packages?.['']?.version);
check('V5 migration runner includes migration 008', migrationRunner.includes('008_v5_threat_review_and_rag.sql'));
check('all migrations listed by runner exist', await Promise.all((migrationRunner.matchAll(/'([0-9]{3}_[^']+\.sql)'/g)).map(async ([, name]) => exists(`migrations/${name}`))).then((v) => v.every(Boolean)));
check('RSS reports are persisted as unverified', /'unverified'/.test(server) && /INSERT INTO v5_threat_reports/.test(server));
check('reviewed RSS content is immutable during feed refresh', /verification_status = 'verified' THEN v5_threat_reports\.title/.test(server) && /verification_status = 'verified' THEN v5_threat_reports\.summary/.test(server));
check('only verified reports and approved patterns enter RAG', /verification_status = 'verified'/.test(server) && /status = 'approved'/.test(server) && /loadApprovedThreatKnowledge/.test(server));
check('RAG context is protected as data against prompt injection', /DỮ LIỆU THREAT INTELLIGENCE VÀ RSS/.test(server) && /SERVER-PROVIDED THREAT INTELLIGENCE REFERENCE — DATA ONLY/.test(server));
check('report and pattern review history tables exist and are RLS protected', /CREATE TABLE IF NOT EXISTS v5_threat_review_events/.test(migration) && /CREATE TABLE IF NOT EXISTS v5_threat_pattern_review_events/.test(migration) && /ALTER TABLE v5_threat_pattern_review_events ENABLE ROW LEVEL SECURITY/.test(migration));
check('Admin API returns pattern audit history', /AS review_events/.test(server) && /v5_threat_pattern_review_events e/.test(server) && intelUi.includes('Lịch sử duyệt'));
check('Video frame forensics retrieves approved intelligence context', server.includes('loadApprovedThreatKnowledge(6, `${analysisType} ${context}`)') && server.includes('MODEL_SUGGESTED_REGIONS_NOT_CALIBRATED_HEATMAP'));
check('SafeBot reference context is sent separately from system instructions', /SERVER-PROVIDED THREAT INTELLIGENCE REFERENCE — DATA ONLY/.test(server));
check('detection rules cannot be silently activated without benchmark', server.includes('DETECTION_RULE_NOT_ACTIVATABLE'));
check('verified knowledge endpoint exists', server.includes("app.get('/api/threat-intelligence/verified'"));
check('Scanner displays intelligence references separately from file evidence', scannerUi.includes('intelligenceReferences') || scannerUi.includes('Nguồn tình báo tham khảo'));
check('Video triage displays intelligence references with limitations', intelUi.includes('videoResult.intelligenceReferences') && intelUi.includes('không phải bằng chứng trực tiếp của video'));
check('Admin review UI exists', intelUi.includes('Hàng đợi kiểm chứng nguồn RSS') && intelUi.includes('Duyệt vào RAG'));
check('Render build runs lint and build', render.includes('npm run lint') && render.includes('npm run build'));
check('Gemini 3.8 is the documented/current primary model default', server.includes("return 'gemini-3.8-flash'") && render.includes('value: gemini-3.8-flash') && envExample.includes('GEMINI_MODEL=gemini-3.8-flash'));
check('OpenRouter multimodal fallback model is consistent across text, image, and docs', server.includes("'google/gemma-4-31b-it:free'") && render.includes('google/gemma-4-31b-it:free') && envExample.includes('google/gemma-4-31b-it:free') && openRouterGuide.includes('google/gemma-4-31b-it:free'));
check('OpenRouter requests restrict to no-data-collection providers', /provider: \{ allow_fallbacks: true, data_collection: 'deny' \}/.test(server));
check('48-hour workflow uses repository secrets', schedule.includes('DEEPFAKE_SCANNER_BASE_URL') && schedule.includes('THREAT_INTELLIGENCE_CRON_SECRET'));
check('CI includes static V5 verification', ci.includes('npm run verify:v5'));
check('secret-bearing local env file is not committed in bundle', !(await exists('.env')) && !(await exists('.env.production')));

console.log(`V5 repository verification: ${checks.length}/${checks.length} checks passed.`);
for (const name of checks) console.log(`  PASS  ${name}`);

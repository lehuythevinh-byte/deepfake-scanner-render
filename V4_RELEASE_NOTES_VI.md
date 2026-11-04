> **Tài liệu lịch sử V4:** dự án đã được tái cấu trúc thành V5. Hướng dẫn vận hành hiện tại nằm trong `V5_IMPLEMENTATION_GUIDE_VI.md`; không dùng riêng tài liệu này để triển khai bản V5.

# V4 Release Notes (Implementation Bundle)

## Added
- V4 Advanced Platform workspace at `/app/v4`.
- Digital Origin: local SHA-256, JPEG EXIF subset, optional C2PA verification.
- Scam Message Intelligence: local Vietnamese rules and explicit-consent AI analysis.
- QR Shield: browser QR decode/camera with manual fallback and reuse of existing Link Scanner.
- AI Forensics: AI-assisted image triage with bounded region suggestions.
- Evidence Vault: AES-GCM local browser file storage, server metadata, SHA-256 and hash-linked event history verification.
- Video frame contact-sheet triage and local audio signal measurements.
- Server-validated Cyber Safety Quest XP with duplicate completion protection.
- Admin-curated Threat Intelligence advisories with expiration and withdrawal.
- Additive PostgreSQL migration `005_v4_platform.sql`.

## Preserved
- V3 Scanner, Link Scanner, History, EvidenceLab, Academy, Simulator, SafeBot, Research, Emergency, Account/Admin, authentication, sessions, Supabase/PostgreSQL, feedback, survey, site customization and deployment files.
- Existing V3 tables and user data are not altered by migration 005.
- No Reports module has been added.

## Explicit limitations
- AI Forensics regions are not calibrated heatmaps.
- Video is sampled-frame triage, not temporal deepfake detection.
- Audio has no validated deepfake classifier; results remain inconclusive.
- Threat Intelligence is manually curated by Admin, not automatically ingested.
- Evidence Vault binary data remains encrypted in the browser that captured it; server stores metadata/hash only.

## Validation status
- TypeScript/TSX syntax transpilation check: passed for all 38 `.ts`/`.tsx` files.
- TypeScript/TSX syntax transpilation check: passed for all 38 `.ts`/`.tsx` files; `node --check scripts/migrate.mjs` and JSON parse checks also passed.
- Full `npm run lint` and `npm run build`: not run in this packaging environment because dependencies could not be installed (npm registry DNS/network unavailable).
- `package-lock.json` root metadata declares the optional C2PA SDK, but its full resolved dependency tree could not be written in this environment. Run `npm install --include=dev --no-audit --no-fund` once on a network-enabled machine to regenerate/update the lockfile; do not use `npm ci` before that step.
- Run `npm run lint` and `npm run build` on the target machine before deployment.

# Deepfake Scanner V5 — Trạng thái gói bàn giao

**Phiên bản nguồn:** 5.0.1 (hardening patch)  
**Ngày đóng gói:** 02/11/2026

## Đã thực hiện trong working copy

- Tái cấu trúc điều hướng V5 thành Content Analysis, Safety Center, Scan History; User Account/Admin nằm riêng.
- Gom Image/Video/Audio/Message và các công cụ Link/QR/Digital Origin/Forensics/Scam/Evidence trong Content Analysis.
- Đưa SafeBot, Knowledge Base, Threat Intelligence và Incident Response vào Safety Center.
- Hợp nhất bằng chứng vào kết quả Scanner; bỏ trang Evidence Lab độc lập.
- Bỏ giao diện Research/STEM, Simulator và Quest khỏi bundle V5; không drop bảng dữ liệu lịch sử Quest trong PostgreSQL.
- Giữ cơ chế góp ý chất lượng sản phẩm, đổi nhãn thành Đánh giá trải nghiệm; giữ API/schema cũ để bảo toàn dữ liệu.
- Thêm pipeline RSS allowlist HTTPS, snapshot PostgreSQL, dedup URL, source status, update-run log và khoá thời gian 48 giờ.
- Thêm workflow GitHub Actions kiểm tra 6 giờ/lần và endpoint scheduler có Bearer secret.
- Thêm RAG từ báo cáo đã được Admin xác minh và knowledge pattern đã duyệt cho Scanner, Video/Image Forensics, Message Risk Check và SafeBot; tin RSS chưa xác minh không đi vào kho tri thức đã duyệt.
- Thêm API và giao diện Admin để xem/duyệt/từ chối báo cáo, tạo/duyệt/rút knowledge pattern; chặn kích hoạt detection rule khi chưa có detector benchmark. Lưu audit event riêng cho các quyết định duyệt knowledge pattern. RSS refresh không được sửa title/summary của báo cáo đã xác minh.
- Đồng bộ `.env.example` và `render.yaml` với chuỗi Gemini → OpenRouter → OpenAI → DeepSeek, database, Admin bootstrap và secret scheduler.
- Thêm GitHub Actions CI chạy kiểm tra repository V5, install lockfile, type-check và production build. Bổ sung `npm run verify:v5` với 23 kiểm tra tĩnh về migration, RLS, RAG, prompt-injection guard, workflow và đồng bộ package.
- Thêm migrations 006–008; migration runner áp dụng tuần tự 001–008, additive/idempotent. Migration 008 bổ sung hàng đợi duyệt RSS, lịch sử quyết định kiểm chứng, kho knowledge pattern, RLS và hai nguồn RSS chính thức bổ sung.
- Bổ sung kiểm tra consent gửi dữ liệu tới nhà cung cấp AI ở server boundary.
- Gỡ các ZIP snapshot mã nguồn cũ khỏi `public/assets/aistudio/` để không phát hành source archive qua web static.
- Giữ IndexedDB store của Evidence Vault và các bảng legacy để không làm mất dữ liệu cục bộ/cơ sở dữ liệu.

## Kiểm tra đã chạy trong môi trường đóng gói

- TypeScript/TSX syntax parse: **31 tệp, 0 lỗi cú pháp** (bộ phân tích TypeScript toàn cục; đây không thay thế type-check đầy đủ).
- Kiểm tra đường dẫn import tương đối: **0 import nội bộ bị thiếu**.
- `node --check scripts/migrate.mjs`: **đạt**.
- `npm run verify:v5`: **23/23 kiểm tra repository tĩnh đạt**; các kiểm tra này không thay thế test API/DB/runtime.
- Đồng bộ package/package-lock: **đạt**.
- `npm run lint`: **chưa đạt trong môi trường đóng gói** vì thiếu `@types/node` và `vite/client`; `npm run build`: **chưa chạy được** vì binary Vite không có sau lần cài dependency lỗi/timeout. Cần chạy lại sau `npm ci` thành công trên máy có mạng.
- Đồng bộ định danh và phiên bản `package.json` / `package-lock.json`: **đạt**.
- Rà soát public assets: không còn ZIP snapshot trong `public/`.

## Chưa được xác nhận

- `npm ci` bị timeout khi tải dependency trong môi trường đóng gói. Vì vậy **chưa xác nhận được** `npm run lint`, `npm run build`, kiểm thử runtime hoặc giao diện trên browser cho working copy V5.
- Chưa kết nối Supabase staging để chạy migrations 001–008, kiểm thử RLS/auth hoặc xác minh giữ dữ liệu thực tế.
- Chưa cấu hình GitHub repository secrets/Render secret; chưa có bằng chứng scheduler production đã chạy chu kỳ 48 giờ. Workflow CI và cấu hình Render đã được thêm vào mã nguồn, nhưng chỉ có thể xác nhận chạy sau khi push/deploy trong tài khoản của bạn.
- Chưa có benchmark detector deepfake chuyên dụng; không quảng bá accuracy/precision/recall hoặc kết luận thật/giả tuyệt đối.

## Các giới hạn vẫn cần dịch vụ/dữ liệu bên ngoài

- Không có thể tạo ra một audio-deepfake classifier hoặc video-temporal/lip-sync detector đáng tin cậy chỉ bằng sửa UI/prompt. Cần model/dịch vụ chuyên dụng, dataset có nhãn, benchmark và quy trình đánh giá; hiện V5 tiếp tục công bố rõ giới hạn.
- Scheduler 48 giờ kiểm tra RSS và sinh tình huống phòng ngừa; RSS item cần Admin review, và knowledge đã duyệt được dùng trong RAG. Đây chưa phải hệ thống tự động xác minh sự kiện độc lập.
- Không có quyền truy cập Render/GitHub/Supabase trong phiên làm việc này nên không thể tạo secrets, chạy migration production hoặc xác nhận deployment.

## Trước khi đưa lên Render

1. Sao lưu database và dùng staging trước.
2. Tạo `.env` từ cấu hình V4 hiện có, giữ API provider đang dùng; không dùng `.env.example` để ghi đè mất cấu hình riêng.
3. Sao chép `certs/supabase-root.crt` từ V4 nếu đang dùng Supabase CA riêng, rồi đặt `DATABASE_SSL_CA_FILE=certs/supabase-root.crt`.
4. Cấu hình `THREAT_INTELLIGENCE_CRON_SECRET` (ít nhất 32 ký tự) ở Render và GitHub repository secrets; thêm `DEEPFAKE_SCANNER_BASE_URL` ở GitHub.
5. Chạy `npm ci`, `npm run db:migrate`, `npm run lint`, `npm run build` trên máy có mạng; sau đó kiểm thử đăng nhập, Scanner, Message Risk, SafeBot, History, Admin và scheduler trên staging.

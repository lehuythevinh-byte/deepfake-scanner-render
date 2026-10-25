# Nâng cấp V3 — Cinematic Landing, Auth Gate, Khảo sát sao

## Đã thay đổi
**Backend (`server.ts`)**
- `authRequired` middleware bảo vệ `POST /api/scan`, `/api/link-scan`, `/api/chat` (401 nếu chưa đăng nhập, 503 nếu chưa cấu hình DB).
- Khảo sát: `GET /api/survey/status`, `POST /api/survey/defer`, `POST /api/survey/submit`.
- Admin: `GET /api/admin/feedback` (lọc, tìm kiếm, phân trang 20/trang, thống kê), `PATCH /api/admin/feedback/:id` (trạng thái, ghi chú). Dùng `requireAdmin` hiện có.
- `user_id` luôn lấy từ phiên; client không thể gửi `user_id`/`status`. Kiểm tra Origin cho các request ghi; rate-limit; advisory lock chống gửi trùng.
- SafeBot hoàn tất (phản hồi Gemini thành công) được ghi vào `usage_events` (không lưu nội dung) để tính điều kiện mời.

**Database** — `migrations/002_survey_feedback.sql` (chỉ thêm bảng mới: `survey_feedback`, `survey_invitation_state`, `usage_events`; idempotent, không đụng dữ liệu cũ). Chạy tự động qua `runMigrations` hiện có.

**Frontend**
- URL thật (`/`, `/login?next=...`, `/app/...`) thay cho hash; `src/lib/routes.ts` là nguồn duy nhất, `next` chỉ chấp nhận đường dẫn nội bộ khớp whitelist (chặn `//host`, `http:`, `javascript:`, `\`).
- Route guard ở App + backend guard ở API.
- Header công khai tối giản (Logo / Đăng nhập / Tạo tài khoản); menu nội bộ chỉ hiện khi đã đăng nhập.
- Hero cinematic bằng CSS/SVG (không tải ảnh nặng), hỗ trợ `prefers-reduced-motion`.
- `SurveyModal`, `FeedbackAdminPanel`, khu "Hoạt động gần đây" trên Dashboard.

## Quy tắc mời khảo sát (cấu hình qua env)
Đủ điều kiện khi: ≥5 tác vụ hoàn tất, HOẶC ≥7 ngày kể từ ngày đăng ký (hoặc lần gửi trước) kèm ≥1 tác vụ.
Chỉ kiểm tra khi người dùng ở Dashboard (không che kết quả tác vụ), tối đa 1 lần mỗi lần tải trang.
"Để sau"/đóng = hoãn 3 ngày; "Không phải lúc này" = hoãn 30 ngày; sau khi gửi = nghỉ ≥30 ngày. Trạng thái lưu trên server.

## Triển khai
```bash
git checkout -b feature/v3-landing-auth-survey
npm install --include=dev
npm run lint && npm run build
# Local: DATABASE_URL=... npm run db:migrate && npm run dev
git add -A && git commit -m "feat: cinematic landing, auth gate, star survey"
git push origin feature/v3-landing-auth-survey   # tạo PR, kiểm tra preview, rồi merge -> Render tự deploy
```
Sau deploy: kiểm tra `/api/health`, log có `[Migration] [APPLYING] 002_survey_feedback.sql`, rồi chạy checklist bên dưới.

## Rollback
1. Render > Deploys > chọn deploy trước > *Rollback* (hoặc `git revert <commit>`).
2. Các bảng mới vô hại với bản cũ (chỉ thêm) nên có thể giữ nguyên. Chỉ khi cần xóa hẳn:
   `DROP TABLE usage_events, survey_invitation_state, survey_feedback;` và `DELETE FROM schema_migrations WHERE version LIKE '002%';` (kiểm tra tên cột `version` trước).

## Checklist kiểm thử thủ công (chưa được chạy tự động)
- Chưa đăng nhập: `curl -X POST /api/scan` → 401; `/app/scanner` → chuyển tới `/login?next=%2Fapp%2Fscanner`, đăng nhập xong về đúng trang.
- `/login?next=https://evil.com`, `?next=//evil.com`, `?next=javascript:alert(1)` → về `/app`.
- User thường: `GET /api/admin/feedback` → 403.
- Tài khoản mới: không bị mời khảo sát. Sau 5 lần quét thành công → modal hiện ở Dashboard.
- Gửi 1–5 sao; gửi 2 lần liên tiếp → lần 2 nhận 409; ngắt mạng → báo lỗi, giữ nội dung, gửi lại được.
- Admin: thấy phản hồi, lọc, đổi trạng thái, lưu ghi chú; số liệu khớp DB.
- Hồi quy: AI Scanner, Link Scanner, SafeBot, lịch sử, đăng xuất, `/api/health`.

## Giới hạn đã biết
- Chưa gửi email báo Admin (chưa có email service); Admin xem qua dashboard.
- Khi chưa cấu hình `DATABASE_URL`, các công cụ sẽ bị khóa (vì bắt buộc đăng nhập).
- FAQ/Chính sách riêng tư cũ trong `LandingPage.tsx` chưa được rà soát lại về mặt nội dung.

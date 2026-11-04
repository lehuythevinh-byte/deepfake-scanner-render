# Deepfake Scanner V5 — Hướng dẫn triển khai

## 1. Cấu trúc sản phẩm

V5 tổ chức sản phẩm thành bốn khu vực (ba mục điều hướng chính và tài khoản/quản trị riêng):

- **Content Analysis**: Image, Video, Audio, Message Risk Check; các công cụ Link, QR, Digital Origin, Image Forensics, Scam Intelligence, Evidence Vault và Verification Guide nằm trong cùng workspace.
- **Safety Center**: SafeBot, Knowledge Base, Threat Intelligence và Incident Response.
- **Scan History**: lịch sử kiểm tra theo tài khoản.
- **User Account**: hồ sơ, bảo mật, quyền riêng tư và khu vực Admin.

Các URL V3/V4 cũ được ánh xạ sang workspace V5 tương ứng để giữ bookmark. Các trang nghiên cứu STEM và dữ liệu benchmark minh họa không còn được import vào ứng dụng.

## 2. Bảo toàn dữ liệu

Các migration V5 là migration bổ sung. Không xóa `app_users`, `app_sessions`, `scan_audit`, lịch sử, phản hồi, cài đặt website hoặc dữ liệu hiện hữu. `scripts/migrate.mjs` áp dụng migration 001–008 theo thứ tự. Migration 007 chỉ thay các chuỗi mặc định V3/V4 trong `site_settings`; giá trị đã được Admin tùy chỉnh sẽ được giữ nguyên.

Đánh giá trải nghiệm sản phẩm vẫn được giữ để quản trị viên nhận góp ý người dùng; tên endpoint/schema `survey_*` được duy trì tương thích, không còn là khảo sát STEM/học sinh.

Chạy kiểm tra repository V5 không cần dependency trước khi cài gói:

```bash
npm run verify:v5
```

Chạy thủ công tại môi trường local:

```bash
npm run db:migrate
npm run lint
npm run build
```

Máy chủ cũng gọi `runMigrations()` khi khởi tạo cơ sở dữ liệu. Không chạy migration trên một `DATABASE_URL` khác với database mà ứng dụng V5 sẽ sử dụng.

## 3. Threat Intelligence 48 giờ

Pipeline chỉ lấy RSS/XML HTTPS từ miền nằm trong allowlist của máy chủ. Redirect được kiểm tra lại; nội dung nguồn được giới hạn kích thước; dữ liệu cũ được giữ nếu lượt cập nhật mới thất bại. Các mục RSS thu thập được hiển thị rõ là **chưa phải cảnh báo đã xác minh**. Các kịch bản AI hiện được gắn `proactive_scenario`, không được trình bày như sự kiện có thật hoặc quy tắc detector đã phê duyệt.

Scheduler dùng GitHub Actions trong `.github/workflows/threat-intelligence-48h.yml`. Workflow kiểm tra mỗi 6 giờ; khóa trong PostgreSQL chỉ cho phép một lượt thành công sau mỗi 48 giờ. Như vậy lịch có thể trễ tối đa khoảng một chu kỳ kiểm tra cộng thời gian GitHub Actions khởi chạy; không nên quảng bá thời điểm chạy chính xác tuyệt đối. Cần cấu hình GitHub repository secrets:

- `DEEPFAKE_SCANNER_BASE_URL`: URL công khai của dịch vụ Render, ví dụ `https://ten-dich-vu.onrender.com`.
- `THREAT_INTELLIGENCE_CRON_SECRET`: cùng giá trị với biến môi trường Render `THREAT_INTELLIGENCE_CRON_SECRET` (ít nhất 32 ký tự ngẫu nhiên).

Đồng thời thêm `THREAT_INTELLIGENCE_CRON_SECRET` trong Render Environment. Không đưa secret vào frontend, commit hoặc gửi qua chat. Sau khi deploy, có thể chạy workflow thủ công một lần để kiểm tra; HTTP 202 nghĩa là scheduler đã bỏ qua vì chưa đến hạn hoặc đang có khóa, không phải cập nhật thất bại.

Để sinh kịch bản phòng ngừa bằng AI cần cấu hình ít nhất một provider AI. Không có AI key thì nguồn RSS vẫn có thể được lấy snapshot, nhưng phần tạo kịch bản AI sẽ không sẵn sàng. Muốn nguồn hoạt động phải kiểm tra trạng thái từng feed trong Threat Intelligence Center; một URL nằm trong allowlist không đồng nghĩa feed luôn hoạt động.

## 4. Hàng đợi kiểm chứng và RAG Admin

Migration `008_v5_threat_review_and_rag.sql` bổ sung `v5_threat_reports`, `v5_threat_review_events`, `v5_threat_patterns` và `v5_threat_pattern_review_events`. RSS mới được lưu dưới trạng thái `unverified`; chỉ Admin mới có thể duyệt/từ chối sau khi ghi căn cứ. Nội dung của báo cáo đã duyệt không bị RSS ghi đè ở lần thu thập sau; thay đổi nguồn cần quay lại quy trình kiểm chứng. Bản ghi `verified` và knowledge pattern `approved` có thời hạn rà soát 180 ngày, được đưa vào bối cảnh RAG với nguồn tham chiếu. Truy xuất hiện dùng full-text search PostgreSQL theo từ khóa và độ mới (lexical RAG), chưa phải vector/embedding semantic search. Các bảng tình báo bật RLS và chỉ được đọc/ghi qua kết nối PostgreSQL phía máy chủ; không cấp quyền trực tiếp cho anon/authenticated REST.

Pattern loại `detection_rule` hiện không thể kích hoạt: API chủ động trả lỗi vì repository chưa có detector chuyên dụng cùng benchmark để kiểm thử. Duyệt knowledge chỉ bổ sung tài liệu tham khảo, không đổi trọng số, ngưỡng hoặc model.

## 5. Giới hạn hiện tại — không được quảng bá quá mức

- Image Scanner và AI Forensics là công cụ sàng lọc; chưa phải detector deepfake chuyên dụng đã benchmark.
- Video & Audio hiện vẫn dựa trên lấy mẫu frame/đặc trưng tín hiệu cục bộ và các khả năng AI hiện có; chưa có mô hình temporal deepfake detection hoặc audio-video lip-sync forensic đã được kiểm chứng.
- C2PA chỉ kiểm tra manifest/chữ ký trong phạm vi thư viện và định dạng được hỗ trợ; không có manifest không chứng minh nội dung giả.
- Threat Intelligence thu thập RSS từ nguồn allowlist và tạo kịch bản phòng ngừa. Các bản tin tự động được lưu vào hàng đợi `unverified`; Admin phải mở nguồn gốc, đối chiếu độc lập và ghi lý do trước khi đánh dấu `verified`. Các bản ghi bị từ chối được lưu lịch sử review. Chỉ knowledge pattern đã được duyệt mới tham gia RAG. Điều này không tương đương xác minh sự kiện bằng mô hình độc lập tự động.
- RAG đưa snapshot mới nhất vào Scanner, phân tích tin nhắn và SafeBot như bối cảnh tham khảo, không biến kịch bản giả định thành sự thật.

## 6. Kiểm tra sau deploy

1. Đăng nhập tài khoản User và Admin.
2. Mở lần lượt Content Analysis, Safety Center, Scan History và User Account.
3. Kiểm tra ảnh, video, âm thanh, tin nhắn và các công cụ bổ trợ riêng.
4. Trong Safety Center, kiểm tra tình trạng Threat Intelligence, bản tin RSS và nguồn tham chiếu.
5. Với Admin, thử bật/tắt nguồn RSS và chạy cập nhật thủ công.
6. Xác nhận `last_successful_at`, `next_run_at`, `sources_checked`, `records_discovered` trong status endpoint.
7. Mở các URL cũ `/app/simulator`, `/app/v4`, `/app/link-scanner`, `/app/evidence-lab` và xác nhận chúng được ánh xạ tới workspace V5 thay vì trang V3 riêng.

Không coi V5 production-ready trước khi `npm run lint`, `npm run build`, Functional Testing, kiểm tra quyền Admin và kiểm tra scheduler trên môi trường Render thật đều thành công.

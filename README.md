# Deepfake Scanner V5 — Digital Trust & Forensics

V5 tái cấu trúc ứng dụng V4 hiện có thành nền tảng phân tích nội dung số, hỗ trợ xác minh và an toàn trực tuyến. Đây là nâng cấp trên repository hiện tại, không phải một website độc lập.

## Workspace V5

- **Content Analysis** — Image, Video, Audio và Message Risk Check; công cụ Link Scanner, QR Shield, Digital Origin, AI Forensics, Scam Intelligence và Evidence Vault nằm trong cùng workspace.
- **Safety Center** — AI Safety Assistant, Knowledge Base, Threat Intelligence và hướng dẫn ứng phó sự cố.
- **Scan History** — lịch sử theo tài khoản.
- **User Account** — hồ sơ, quyền riêng tư, bảo mật và khu vực Admin.

Các URL V3/V4 cũ được ánh xạ sang workspace V5 để giữ bookmark. Evidence Lab được tích hợp vào kết quả phân tích, không còn trang riêng. Research/STEM Dashboard, Simulator và Cyber Safety Quest không còn là chức năng công khai của V5; dữ liệu lịch sử trong PostgreSQL không bị xóa.

## Bảo toàn dữ liệu và nâng cấp database

- Giữ nguyên Supabase/PostgreSQL, đăng nhập, vai trò Admin, RLS, lịch sử quét, phản hồi và cấu hình website.
- Migration V5 bổ sung schema tình báo `006_v5_threat_intelligence.sql`, làm mới thương hiệu có bảo toàn cấu hình Admin ở `007_v5_brand_refresh.sql`, và thêm hàng đợi kiểm chứng/RAG ở `008_v5_threat_review_and_rag.sql`; không xóa bảng người dùng hoặc lịch sử.
- `scripts/migrate.mjs` áp dụng migration theo thứ tự 001–008 và có advisory lock để tránh hai tiến trình chạy migration đồng thời.
- Bảng hoàn thành Quest cũ được giữ làm dữ liệu lịch sử; API và giao diện Quest không còn được công bố trong V5.

**Khuyến nghị:** sao lưu hoặc dùng database staging trước lần chạy V5 đầu tiên. Không dùng production database để thử nghiệm nếu bạn chưa xem xét migration.

## Cài đặt local trên Windows Git Bash

```bash
cd ~/Documents/Deepfake_Scanner_V5_Advanced
cp .env.example .env
# Nếu nâng cấp từ V4, ưu tiên sao chép .env hiện tại sang đây để giữ cấu hình provider; tuyệt đối không đưa file này vào ZIP/GitHub.
# Kiểm tra DATABASE_URL, API keys và THREAT_INTELLIGENCE_CRON_SECRET trong .env.
npm ci
npm run db:migrate
npm run lint
npm run build
PORT=3004 npm run dev
```

Mở `http://localhost:3004`. Nếu dùng Supabase với CA riêng, sao chép `certs/supabase-root.crt` từ bản V4 hiện tại sang thư mục `certs/` của V5, sau đó đặt `DATABASE_SSL_CA_FILE=certs/supabase-root.crt` trong `.env`. Với kết nối có CA hệ thống sẵn, có thể để biến này trống. Không đưa `.env` hoặc khóa API lên GitHub.

## Kiểm tra repository V5

Chạy bộ kiểm tra tĩnh cho migration, RLS, RAG, review audit, nguồn và cấu hình workflow (không cần cài dependency):

```bash
npm run verify:v5
```

Kiểm tra này không thay thế `npm run lint`, `npm run build` hoặc kiểm thử trên Supabase/Render staging.

## Threat Intelligence cập nhật 48 giờ

V5 dùng GitHub Actions scheduler (workflow `.github/workflows/threat-intelligence-48h.yml`) kiểm tra mỗi 6 giờ; khóa PostgreSQL chỉ cho phép một lượt cập nhật thành công sau mỗi 48 giờ. Do độ trễ khởi chạy của GitHub Actions, đây là chu kỳ mục tiêu tối thiểu giữa các lần chạy hợp lệ chứ không phải cam kết chạy chính xác theo phút.

Cấu hình hai GitHub repository secrets và biến môi trường Render tương ứng:

- `DEEPFAKE_SCANNER_BASE_URL`: URL dịch vụ Render đang chạy.
- `THREAT_INTELLIGENCE_CRON_SECRET`: chuỗi ngẫu nhiên tối thiểu 32 ký tự; cùng giá trị ở GitHub và Render.

RSS được lấy từ allowlist HTTPS; redirect, host, port và giới hạn dung lượng được kiểm tra. Bản tin thu thập tự động được gắn nhãn **chưa xác minh**. Chỉ cảnh báo được Admin phê duyệt mới trở thành cảnh báo đã xuất bản. Kịch bản do AI tạo là tình huống phòng ngừa, không phải sự kiện có thật hay detector rule.

## CI và triển khai Render

`render.yaml` dùng `npm ci`, `npm run lint` và `npm run build`; GitHub Actions trong `.github/workflows/ci.yml` chạy cùng bộ kiểm tra khi push hoặc mở pull request. Trên Render cần khai báo `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `THREAT_INTELLIGENCE_CRON_SECRET` và ít nhất một API key AI. Nếu dùng Supabase với CA riêng, đặt `DATABASE_SSL_CA_FILE=certs/supabase-root.crt` sau khi đưa đúng file CA vào thư mục `certs/`. `sync: false` có nghĩa Render sẽ yêu cầu nhập secret khi tạo/cập nhật dịch vụ; không điền khóa thật trong YAML.

## Giới hạn kỹ thuật cần công bố

- Image Scanner và AI Forensics là công cụ sàng lọc; chưa có benchmark deepfake chuyên dụng đủ để tuyên bố accuracy.
- Video hiện lấy mẫu frame; chưa có temporal deepfake classifier được kiểm định.
- Audio hiện phân tích đặc trưng tín hiệu; chưa có audio-deepfake classifier đã hiệu chuẩn.
- C2PA chỉ xác minh manifest/chữ ký trong phạm vi SDK và định dạng được hỗ trợ. Không có manifest không chứng minh nội dung giả.
- RAG đưa nguồn đã thu thập vào bối cảnh cho Scanner và AI Assistant, nhưng không tự biến nguồn chưa xác minh thành sự thật hoặc tự cập nhật trọng số mô hình.

## Kiểm thử trước khi deploy

```bash
npm run db:migrate
npm run lint
npm run build
```

Sau đó kiểm thử đăng nhập User/Admin, Content Analysis (ảnh/video/audio/tin nhắn), công cụ Link/QR, Evidence Vault, Scan History, Safety Center, giới hạn upload/consent và workflow Threat Intelligence trên môi trường staging. Xem `V5_IMPLEMENTATION_GUIDE_VI.md` và `V5_CHANGELOG_VI.md` để biết chi tiết.

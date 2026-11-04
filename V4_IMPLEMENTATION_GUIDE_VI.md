> **Tài liệu lịch sử V4:** dự án đã được tái cấu trúc thành V5. Hướng dẫn vận hành hiện tại nằm trong `V5_IMPLEMENTATION_GUIDE_VI.md`; không dùng riêng tài liệu này để triển khai bản V5.

# DEEPFAKE SCANNER V4 — ADVANCED DIGITAL TRUST PLATFORM

Tài liệu triển khai cho bản V4 được phát triển bổ sung trên mã nguồn V3. V4 không thay thế V3 và không tạo module Reports.

## 1. Phạm vi đã tích hợp

| Module | Tình trạng trong bản này | Giới hạn cần hiểu |
|---|---|---|
| Digital Origin | SHA-256 tại trình duyệt; đọc một số trường EXIF JPEG; kiểm tra C2PA qua SDK Node tùy chọn | EXIF parser hiện tập trung JPEG; C2PA chỉ hỗ trợ các MIME mà endpoint cho phép và file tối đa 8 MB |
| Scam Message Intelligence | Bộ quy tắc tiếng Việt chạy cục bộ; AI phân tích ngữ cảnh khi người dùng đồng ý | Điểm rule là thang cảnh báo nội bộ, không phải xác suất lừa đảo |
| QR Shield | BarcodeDetector trên trình duyệt; có thể nhập payload thủ công; URL chuyển sang Link Scanner V3 | BarcodeDetector phụ thuộc trình duyệt; Link Scanner hiện đánh giá URL chứ không tải nội dung trang đích |
| AI Forensics | Gửi ảnh tới AI hiện có khi người dùng đồng ý; hiển thị vùng do model đề xuất | Đây là vùng gợi ý của VLM, không phải heatmap pháp chứng đã hiệu chuẩn hay detector deepfake chuyên biệt |
| Evidence Vault | Metadata/hash và hash-linked event log trên PostgreSQL; file gốc AES-GCM mã hóa trong IndexedDB trên thiết bị hiện tại | Không có khôi phục mật khẩu; dữ liệu local có thể mất khi xóa dữ liệu trình duyệt; chuỗi hash không phải kho bất biến chống quản trị DB |
| Video & Audio | Lấy tối đa 6 frame video làm contact sheet rồi phân tích bằng AI thị giác; audio triage cục bộ | Chưa có temporal video classifier, lip-sync detector hoặc audio deepfake classifier được xác thực |
| Cyber Safety Quest | 5 tình huống; server kiểm tra đáp án và chỉ cộng XP một lần mỗi user/quest | Nội dung nhiệm vụ là bộ khởi đầu, có thể mở rộng qua dữ liệu/administration sau |
| Threat Intelligence | Admin tự biên tập cảnh báo có nguồn HTTPS, thời hạn, mức độ; có thể rút cảnh báo | Chưa tự động thu thập feed; cảnh báo chỉ được coi là đã duyệt nếu Admin đã xác minh nguồn |

## 2. Giữ nguyên V3

Các module V3 tiếp tục được giữ trong source và điều hướng hiện tại: Scanner, Link Scanner, History, EvidenceLab, Academy, Simulator, SafeBot, Research, Emergency, Account/Admin, khảo sát/feedback, Website Customizer, đăng nhập và đăng ký.

- Tab mới: `v4-platform`.
- URL: `/app/v4`.
- Entry point bổ sung trong User Dashboard.
- Các API V4 nằm dưới `/api/v4`.
- Không đổi bảng `app_users`, `app_sessions`, `scan_audit`, `result_feedback` hoặc `site_settings` trong migration V4.

## 3. Cấu trúc chính

- `src/components/V4PlatformModule.tsx`: giao diện workspace V4 và 8 module.
- `src/lib/v4Local.ts`: hash, EXIF JPEG, rule-based scam screening, AES-GCM evidence local store.
- `src/data/v4QuestData.ts`: kịch bản quest và câu trả lời đúng phía UI.
- `server.ts`: API V4 dùng lại session, AI router, rate limiter và PostgreSQL hiện có.
- `migrations/005_v4_platform.sql`: migration bổ sung, idempotent.
- `scripts/migrate.mjs`: tích hợp migration V4 cho database đã có `app_users`.
- `src/lib/routes.ts`, `src/types/index.ts`, `src/App.tsx`: route/tab mới.
- `render.yaml`: ghim Node.js 24.22.1 cho SDK C2PA hiện tại.

## 4. Database V4

Migration `005_v4_platform.sql` tạo thêm các bảng:

- `v4_user_consents`: ghi nhận lựa chọn gửi file/văn bản tới dịch vụ ngoài.
- `v4_evidence_items`: metadata, hash và trạng thái lưu trữ `device_only`.
- `v4_evidence_events`: chuỗi sự kiện có previous hash và event hash.
- `v4_quest_completions`: một lần hoàn thành cho mỗi user/quest.
- `v4_threat_advisories`: cảnh báo do Admin biên tập.
- `v4_analysis_audit`: provider/model/thời lượng/trạng thái, không lưu raw prompt hay media.

Migration dùng `CREATE TABLE/INDEX IF NOT EXISTS` và chỉ tham chiếu `app_users` hiện có. Không xóa hoặc đổi dữ liệu V3.

Khi ứng dụng khởi động và có `DATABASE_URL`, `ensureDatabase()` tạo/đảm bảo bảng tài khoản V3 rồi áp dụng migration V4. `scripts/migrate.mjs` cung cấp hàm migration dùng bởi server; không chạy script này như một lệnh CLI độc lập.

## 5. API V4

| Method | Endpoint | Quyền |
|---|---|---|
| GET | `/api/v4/capabilities` | User đã đăng nhập |
| POST | `/api/v4/digital-origin/c2pa` | User đã đăng nhập + consent C2PA |
| POST | `/api/v4/scam/analyze-ai` | User đã đăng nhập + consent AI |
| POST | `/api/v4/forensics/image` | User đã đăng nhập + consent AI |
| GET | `/api/v4/evidence` | User đã đăng nhập, dữ liệu của chính mình |
| GET | `/api/v4/evidence/:id/events` | Chủ sở hữu bằng chứng |
| POST | `/api/v4/evidence` | User đã đăng nhập |
| DELETE | `/api/v4/evidence/:id` | Chủ sở hữu bằng chứng |
| GET | `/api/v4/quests/progress` | User đã đăng nhập |
| POST | `/api/v4/quests/complete` | User đã đăng nhập |
| GET | `/api/v4/threats` | User đã đăng nhập |
| POST | `/api/v4/admin/threats` | Admin |
| PATCH | `/api/v4/admin/threats/:id/withdraw` | Admin |

Các route dùng session hiện tại, không tin `user_id` do client truyền. Admin route kiểm tra role ở backend bằng `requireAdmin`.

## 6. Quyền riêng tư và lưu trữ

### Dữ liệu không tự động rời khỏi thiết bị

- SHA-256 được tính trên bytes trong trình duyệt.
- EXIF JPEG được đọc cục bộ; GPS chỉ được ghi nhận có metadata, không xuất tọa độ.
- Scam rule screening chạy cục bộ.
- Phân tích tín hiệu audio chạy cục bộ và luôn kết luận `INCONCLUSIVE` về deepfake.
- File gốc Evidence Vault được mã hóa AES-GCM 256-bit và lưu trong IndexedDB.

### Khi gửi dữ liệu lên server/AI

- C2PA: người dùng cần tick consent. File tối đa 8 MB, xử lý trong bộ nhớ request, không được lưu vào Vault.
- Scam AI: checkbox consent bắt buộc; raw message không ghi vào bảng audit.
- Image Forensics: checkbox consent bắt buộc; ảnh được gửi tới nhà cung cấp AI đã cấu hình.
- Video: chỉ contact sheet của tối đa 6 frame mẫu được gửi AI sau consent; không upload video gốc.
- QR URL: chuyển sang API Link Scanner hiện tại; URL không tự động được mở.

Việc tick consent không thay đổi chính sách retention của nhà cung cấp AI. Không gửi dữ liệu nhạy cảm nếu người dùng không có quyền hoặc không thực sự cần xử lý cloud.

### Evidence Vault

- File gốc mã hóa bằng AES-GCM; khóa được dẫn xuất bằng PBKDF2-SHA-256 (310.000 vòng) từ mật khẩu do người dùng tự đặt.
- Mật khẩu không gửi lên backend, không được lưu trong IndexedDB và không có cơ chế khôi phục.
- File chỉ có trên trình duyệt/thiết bị đã tiếp nhận. Đăng nhập ở trình duyệt khác chỉ thấy metadata, không có bản file.
- Xóa dữ liệu trình duyệt, mất thiết bị hoặc quên mật khẩu có thể khiến file không thể khôi phục. Hãy giữ bản sao riêng an toàn.
- Event hash chain giúp phát hiện sai lệch trong chuỗi được lưu, nhưng không phải timestamp authority, không chống được chủ sở hữu database có quyền sửa toàn bộ DB và không tự xác nhận tính xác thực pháp lý.

## 7. C2PA dependency và Node.js

V4 khai báo `@contentauth/c2pa-node` phiên bản `0.9.11` ở `optionalDependencies`. Đây là SDK native tùy chọn để đọc và xác thực C2PA. Tài liệu chính thức hiện yêu cầu bản Node đã vá: Node 22.23.4+, 24.22.1+ hoặc 26.12.1+. `render.yaml` đã đặt `NODE_VERSION=24.22.1`.

Nếu optional native package không được cài thành công, các chức năng V4 khác vẫn dùng được; endpoint C2PA trả thông báo SDK chưa cài thay vì giả lập kết quả.

## 8. Cài đặt local

Không chép đè dự án V3 đang dùng. Giải nén ZIP V4 vào thư mục mới. **Không sao chép nguyên `.env` đang dùng với production nếu `DATABASE_URL` trỏ tới Supabase/Render đang lưu dữ liệu thật.** V4 tự áp dụng migration bổ sung khi server khởi động có database; vì vậy hãy tạo một Supabase project/database staging riêng để thử trước. Sao chép `.env` cục bộ vào thư mục mới, sau đó thay `DATABASE_URL` bằng connection string của staging và dùng tài khoản Admin thử nghiệm riêng. Không đưa `.env` lên GitHub hoặc gửi file này cho người khác.

Nếu chưa có database staging, hãy để `DATABASE_URL` trống và chỉ kiểm tra phần giao diện/công cụ cục bộ; tính năng yêu cầu đăng nhập, lưu Evidence metadata, Quest progress và Threat feed sẽ chưa hoạt động. Không kết nối V4 với database production để thử nghiệm ban đầu.

Ví dụ Git Bash (sau khi đã chuẩn bị `.env` an toàn với database staging):

```bash
cd ~/Documents
unzip -o ~/Downloads/Deepfake_Scanner_V4_Advanced_2026-11-01.zip -d ./Deepfake_Scanner_V4_Advanced
cd ~/Documents/Deepfake_Scanner_V4_Advanced
cp ../deepfake-scanner-atlascloud-20261101/Deepfake_Scanner_Full_Features_No_Reports_2026-10-31/.env ./.env
# Mo .env va thay DATABASE_URL bang database STAGING; thay ADMIN_EMAIL/ADMIN_PASSWORD bang tai khoan thu nghiem.
node -v
npm install --include=dev --no-audit --no-fund
npm run lint
npm run build
PORT=3003 npm run dev
```

Dùng cổng `3003` để thử song song nếu V3 đang chiếm cổng `3002`. Node local phải là Node 24.22.1 trở lên theo yêu cầu SDK C2PA.

`npm install` được dùng để cập nhật `package-lock.json` tương ứng với optional C2PA dependency. **Không dùng `npm ci` với lockfile đi kèm trước khi chạy `npm install` và xác nhận lockfile đã được cập nhật**, vì môi trường đóng gói không thể tải dependency để tạo lock hoàn chỉnh. Render build command hiện dùng `npm install --include=dev --no-audit --no-fund && npm run build`.

## 9. Deploy

1. Chạy lint và build ở thư mục V4.
2. Kiểm tra `git rev-parse --show-toplevel`, `git remote -v` và `git status` ở thư mục dự án, không chạy lệnh Git từ Downloads hoặc thư mục patch.
3. Không stage `.env`, backup, `node_modules`, `dist`, file dữ liệu người dùng hoặc archive tạm.
4. Đẩy lên nhánh thử nghiệm trước; không force-push `main`.
5. Kiểm tra migration V4 trên database staging/backup trước khi triển khai production.
6. Cập nhật `NODE_VERSION=24.22.1` trên Render nếu cấu hình Environment UI ghi đè `render.yaml`.
7. Kiểm tra Render logs, `/api/health`, `/api/v4/capabilities`, đăng nhập, V3 modules và từng module V4.
8. Chỉ merge vào main sau khi kiểm tra quyền truy cập và các luồng dữ liệu.

## 10. Kiểm thử cần chạy trên máy có dependencies

Trong thư mục V4:

```bash
npm install --include=dev --no-audit --no-fund
npm run lint
npm run build
```

Sau đó kiểm tra thủ công:

- User V3 và Admin V3 vẫn đăng nhập được.
- `/app/v4` yêu cầu session hợp lệ.
- API V4 từ chối request không có session.
- C2PA và AI image từ chối nếu không có consent.
- C2PA hiển thị NO_CREDENTIALS/PRESENT_UNVERIFIED/VALID_NOT_TRUSTED/TRUSTED/INVALID đúng theo kết quả SDK.
- Evidence: user A không đọc/xóa metadata của user B; mật khẩu sai không giải mã được file.
- Event chain: event hash/previous hash được kiểm tra theo từng evidence owner.
- Quest: gửi lại cùng quest không được cộng XP lần thứ hai.
- Threat advisory: user thường không thể tạo hoặc rút cảnh báo.
- QR URL không tự mở và Link Scanner không tải nội dung trang đích.
- AI lỗi phải báo lỗi/inconclusive, không tạo heatmap hoặc phán quyết giả.
- Audio hiển thị INCONCLUSIVE vì chưa có model detector.

## 11. Giới hạn đã biết — không được quảng cáo quá mức

- Không có model deepfake chuyên dụng mới được huấn luyện trong package này.
- AI Forensics hiển thị vùng do VLM đề xuất, không phải heatmap đã hiệu chuẩn.
- Video là lấy mẫu frame, không phân tích temporal đầy đủ.
- Audio chỉ mô tả tín hiệu, không phát hiện giọng deepfake.
- Threat Intel là curated feed do Admin nhập, chưa tự động đồng bộ nguồn ngoài.
- QR scanning phụ thuộc `BarcodeDetector`; cần nhập payload thủ công khi browser không hỗ trợ.
- EXIF parser cục bộ tập trung JPEG; các định dạng khác được ghi chú chưa hỗ trợ.

Đây là các giới hạn minh bạch để tránh biến một bộ công cụ sàng lọc thành lời khẳng định giám định không có cơ sở.

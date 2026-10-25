# HƯỚNG DẪN MIGRATION CƠ SỞ DỮ LIỆU POSTGRESQL (TỰ ĐỘNG & AN TOÀN DỮ LIỆU)

Tài liệu này hướng dẫn cách sử dụng tập lệnh di chuyển dữ liệu (automated database migration script) cho hệ thống **DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ**.

---

## 1. Nguyên tắc An toàn & Bảo toàn dữ liệu (Zero Data Loss)

1. **Idempotency (Tính bất biến khi chạy lại):** Mọi câu lệnh SQL đều sử dụng `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` và `ON CONFLICT DO NOTHING / UPDATE`.
2. **Không xóa dữ liệu (Non-Destructive):** Tuyệt đối không sử dụng `DROP TABLE`, `TRUNCATE` hay thay đổi kiểu dữ liệu phá hủy dữ liệu đang có.
3. **Theo dõi phiên bản (Migration Tracking):** Tự động tạo và ghi nhận tiến trình vào bảng `schema_migrations`. Các tệp migration đã chạy sẽ được ghi nhận và bỏ qua trong các lần tiếp theo.
4. **Giao dịch nguyên tử (Atomic Transactions):** Từng file migration được bao bọc trong khối `BEGIN ... COMMIT`. Nếu có lỗi xảy ra ở bất kỳ dòng lệnh nào, hệ thống tự động `ROLLBACK` và không để lại trạng thái dở dang.

---

## 2. Các bảng cơ sở dữ liệu được khởi tạo

### Bảng 1: `app_roles` (Vai trò & Quyền hạn hệ thống)
- `role_id VARCHAR(32) PRIMARY KEY`: Khóa định danh vai trò (`admin`, `user`, `moderator`).
- `role_name VARCHAR(64)`: Tên hiển thị của vai trò.
- `permissions JSONB`: Danh sách quyền hạn chi tiết (RBAC).
- `created_at TIMESTAMPTZ`: Thời gian khởi tạo.

### Bảng 2: `app_users` (Tài khoản người dùng & Quản trị viên)
- `id BIGSERIAL PRIMARY KEY`: Khóa chính tự tăng.
- `email TEXT NOT NULL UNIQUE`: Địa chỉ email đăng nhập.
- `display_name TEXT`: Tên hiển thị người dùng.
- `password_hash TEXT`: Chuỗi băm mật khẩu thuật toán `scrypt` kèm salt ngẫu nhiên.
- `role TEXT`: Vai trò tài khoản (`user`, `admin`, `moderator`).
- `status TEXT`: Trạng thái hoạt động (`active`, `disabled`).
- `created_at TIMESTAMPTZ`: Thời gian tạo.
- `last_login_at TIMESTAMPTZ`: Lần đăng nhập cuối.
- `updated_at TIMESTAMPTZ`: Tự động cập nhật qua trigger PostgreSQL khi có thay đổi.

### Bảng 3: `app_sessions` (Phiên làm việc Opaque Token)
- `id BIGSERIAL PRIMARY KEY`: Khóa chính.
- `user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE`: Liên kết tài khoản.
- `token_hash CHAR(64) UNIQUE`: Băm SHA-256 của token phiên làm việc ngẫu nhiên 32-byte.
- `expires_at TIMESTAMPTZ`: Thời điểm hết hạn (7 ngày).
- `created_at TIMESTAMPTZ`: Thời điểm khởi tạo.

### Bảng 4: `scan_audit` (Lịch sử giám định an toàn số)
- `id BIGSERIAL PRIMARY KEY`: Khóa chính.
- `user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL`: Liên kết tài khoản người quét.
- `scan_mode TEXT`: Chế độ quét (`image`, `social_post`, `message_scam`, `video_frame`, `link`).
- `engine TEXT`: Động cơ xử lý (`gemini-flash-lite`, `heuristic`).
- `model TEXT`: Mô hình sử dụng (ví dụ: `gemini-3.1-flash-lite`).
- `duration_ms INTEGER`: Thời gian xử lý tính bằng mili-giây.
- `report_id TEXT`: Mã định danh báo cáo quốc tế duy nhất (`REP-YYYYMMDD-HEX` hoặc `LNK-YYYYMMDD-HEX`).
- `status TEXT`: Trạng thái tác vụ (`completed`, `insufficient_data`, `failed`).
- `risk_level TEXT`: Mức độ rủi ro (`suspicious`, `inconclusive`, `safe`).
- `summary_label TEXT`: Nhãn tóm tắt nhận định rủi ro.
- `file_name TEXT`: Tên tệp đã phân tích (chỉ lưu tên tệp metadata, **không bao giờ lưu tệp ảnh/video người dùng** để tuân thủ quyền riêng tư).
- `created_at TIMESTAMPTZ`: Thời điểm thực hiện quét.

### Bảng 5: `schema_migrations` (Bảng quản lý phiên bản)
- `id SERIAL PRIMARY KEY`
- `version VARCHAR(128) UNIQUE`
- `name VARCHAR(255)`
- `applied_at TIMESTAMPTZ`
- `duration_ms INTEGER`

---

## 3. Cách thực thi migration

### Cách 1: Tự động chạy khi khởi động Server (Khuyên dùng)
Hệ thống đã được tích hợp sẵn hàm `runMigrations(dbPool)` ngay trong `ensureDatabase()` của `server.ts`. Mỗi khi server Render hoặc local khởi động, hệ thống sẽ tự động kiểm tra và áp dụng mọi migration còn thiếu.

### Cách 2: Chạy thủ công bằng dòng lệnh NPM
Từ thư mục dự án, chạy lệnh:
```bash
npm run db:migrate
# hoặc
npm run migrate
```

### Cách 3: Chạy trực tiếp qua Node.js với chuỗi kết nối tùy chỉnh
```bash
DATABASE_URL="postgres://user:pass@host:5432/dbname" node scripts/migrate.mjs
```

### Cách 4: Chạy trực tiếp tệp SQL trong psql, pgAdmin hoặc Render Shell
Bạn có thể mở tệp:
`migrations/001_init_users_roles_scan_history.sql`
và dán trực tiếp vào cửa sổ Query Tool của PostgreSQL.

---

## 4. Tự động đồng bộ tài khoản Admin
Nếu trong file `.env` hoặc Render Environment có đặt `ADMIN_EMAIL` và `ADMIN_PASSWORD`, migration runner sẽ:
1. Băm mật khẩu an toàn bằng `scrypt`.
2. Kiểm tra xem tài khoản đã tồn tại hay chưa.
3. Nếu chưa có -> Tạo mới với vai trò `admin` và trạng thái `active`.
4. Nếu đã có -> Cập nhật mật khẩu và đảm bảo quyền `admin`, **không bao giờ xóa lịch sử hay tài khoản khác**.

---

## 5. Kiểm tra chẩn đoán kết quả Migration
Bạn có thể gọi trực tiếp API chẩn đoán:
```bash
curl https://deepfake-scanner-safety-center.onrender.com/api/auth/diagnostic
```
Phản hồi JSON sẽ trả về danh sách các migration đã được áp dụng trong mảng `databaseState.appliedMigrations` cùng số lượng bản ghi hiện có.

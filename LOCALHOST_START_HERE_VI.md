# Chạy Deepfake Scanner V5.0.1 trên localhost (Windows)

## 1. Yêu cầu
- Windows 10/11.
- Node.js 22.12 trở lên (khuyến nghị Node.js 24 LTS) và npm.
- Kết nối Internet ở lần cài thư viện đầu tiên.
- Không cần Docker Desktop.

## 2. Khởi động
1. Giải nén toàn bộ ZIP vào một thư mục dễ tìm, ví dụ `C:\Users\admin\Downloads\Deepfake_Scanner_V5_Localhost`.
2. Nhấp đúp `START_LOCALHOST.bat`.
3. Lần chạy đầu, chương trình tạo `.env` từ `.env.example`. Nếu file chưa có, Notepad sẽ mở để bạn cấu hình.
4. Chờ terminal hiển thị `Deepfake Scanner server is running on http://0.0.0.0:3000`.
5. Mở trình duyệt tại `http://localhost:3000`.
6. Kiểm tra API tại `http://localhost:3000/api/health`.

Giữ cửa sổ terminal đang chạy. Đóng cửa sổ hoặc nhấn `Ctrl+C` sẽ dừng localhost. Mở lại bằng `START_LOCALHOST.bat`.

## 3. Cấu hình AI
Mở `.env`, sau đó điền ít nhất một nhà cung cấp AI mà bạn có API key:
- `GEMINI_API_KEY=...`
- hoặc `OPENROUTER_API_KEY=...`
- hoặc `OPENAI_API_KEY=...`
- hoặc `DEEPSEEK_API_KEY=...`

Không dán API key vào mã nguồn, không gửi file `.env` cho người khác và không commit `.env` lên GitHub. `.gitignore` đã loại trừ file này.

## 4. Đăng nhập, đăng ký và Admin
Nếu `DATABASE_URL` để trống, giao diện Scanner vẫn có thể chạy nhưng đăng nhập/đăng ký, lịch sử lưu trên server và chức năng Admin dùng PostgreSQL sẽ không hoạt động.

Để bật các chức năng tài khoản, cấu hình `DATABASE_URL` của một database Supabase/PostgreSQL phù hợp trong `.env`. **Cảnh báo:** server tự chạy các migration 001–008 khi khởi động với `DATABASE_URL`. Không trỏ vào database production đang chứa dữ liệu thật để thử localhost nếu chưa sao lưu và chưa có kế hoạch migration. Khuyến nghị dùng database staging riêng hoặc bản sao database.

Các biến quản trị ban đầu (nếu luồng bootstrap admin của bản triển khai này được sử dụng) là `ADMIN_EMAIL` và `ADMIN_PASSWORD`. Dùng mật khẩu mạnh, riêng biệt; không dùng mật khẩu ví dụ.

## 5. Lệnh chạy thủ công trong Git Bash
```bash
cd "/c/Users/admin/Downloads/Deepfake_Scanner_V5_Localhost/Deepfake_Scanner_V5_Advanced"
cp -n .env.example .env
npm ci --include=dev --no-audit --no-fund
npm run dev
```
Sau đó mở `http://localhost:3000`.

Nếu `npm ci` báo lỗi đồng bộ lockfile, thử:
```bash
npm install --include=dev --no-audit --no-fund
npm run dev
```

## 6. Lỗi thường gặp
- **`EADDRINUSE` / port 3000 đang được sử dụng:** sửa `PORT=3000` trong `.env` thành `PORT=3001`, khởi động lại và mở `http://localhost:3001`.
- **`node` hoặc `npm` không được nhận diện:** cài Node.js 22.12+ / 24 LTS, đóng toàn bộ terminal cũ và mở lại.
- **AI không trả lời:** kiểm tra API key, model và quota của provider trong `.env`; không có API key hợp lệ thì không thể gọi AI thật.
- **Không đăng nhập được:** kiểm tra `DATABASE_URL`, kết nối PostgreSQL và log server. Không chạy migration lên database chính khi chưa backup.
- **Lỗi cài dependencies:** kiểm tra mạng, proxy, dung lượng ổ đĩa rồi chạy `npm install --include=dev --no-audit --no-fund`.

## 7. Phạm vi mạng
Mặc định ứng dụng nghe trên `0.0.0.0` nhưng URL nên dùng trên chính máy là `http://localhost:3000`. Không mở port ra Internet hoặc chia sẻ ứng dụng công khai khi chưa cấu hình HTTPS, secrets, database và bảo mật production.

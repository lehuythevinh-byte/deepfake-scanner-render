# DEEPFAKE SCANNER — Nâng cấp User/Admin (source code)

## Những phần đã được thêm vào source

### Người dùng
- Khu vực `#account` với đăng ký, đăng nhập và đăng xuất.
- Tài khoản có tên hiển thị, email và vai trò do server trả về.
- Xem lịch sử phân tích của chính mình.
- Xuất lịch sử sang JSON và xóa lịch sử.
- Khi người dùng đăng nhập trong lúc quét, server lưu chế độ quét, tên tệp, trạng thái, tóm tắt và cờ kết quả heuristic; không lưu ảnh/tin nhắn gốc vào bảng lịch sử.

### Quản trị viên
- Khu vực `#admin` chỉ truy cập khi server xác nhận vai trò `admin`.
- Dashboard số liệu tài khoản, lượt quét, kết nối DB và trạng thái cấu hình Gemini.
- Tìm kiếm tài khoản, tạm khóa/mở khóa, cấp/hạ quyền Admin.
- Thu hồi session khi khóa tài khoản.
- Nhật ký kiểm toán cho các thay đổi vai trò/trạng thái.
- Bảo vệ Admin hoạt động cuối cùng và chặn tự khóa/tự hạ quyền trong giao diện/API quản trị.

### Backend và vận hành
- PostgreSQL schema tự khởi tạo cho users, sessions, scan history, audit logs và cờ bootstrap.
- Mật khẩu băm với scrypt; session token ngẫu nhiên chỉ lưu dạng SHA-256 hash trong DB.
- Cookie `HttpOnly`, `SameSite=Lax`, `Secure` trong production.
- Giới hạn tốc độ cơ bản trên đăng ký/đăng nhập.
- Các endpoint Admin kiểm tra quyền tại server; ẩn nút trong frontend không phải lớp bảo mật duy nhất.
- `/api/health` trả thêm trạng thái auth store mà không tiết lộ thông tin bí mật.
- Khi chưa có `DATABASE_URL`, server vẫn khởi động cho các công cụ khách hiện có; chức năng User/Admin thông báo chưa cấu hình.
- Cập nhật `render.yaml`, `.env.example`, README và thông báo quyền riêng tư.

## Trạng thái kiểm thử

- Đã kiểm tra JSON `package.json` và `metadata.json`.
- Đã chạy trình chuyển đổi TypeScript có sẵn trên toàn bộ source `.ts`/`.tsx`: không phát hiện lỗi cú pháp.
- **Chưa xác nhận được build toàn dự án** vì `npm install` trong môi trường tạo gói không hoàn tất do registry/network timeout. Cần chạy `npm install`, `npm run build` và `npm run lint` sau khi tải source về hoặc trong Render.
- Chưa kiểm thử tích hợp với một PostgreSQL thật; cần cấu hình `DATABASE_URL` và kiểm thử trên môi trường staging trước khi dùng thật.

## Cách bật User/Admin trên Render

1. Tạo PostgreSQL database trên Render.
2. Trong Web Service → Environment, đặt `DATABASE_URL` bằng Internal Database URL.
3. Đặt `ADMIN_EMAIL`, `ADMIN_PASSWORD` (mật khẩu tối thiểu 12 ký tự, không dùng mật khẩu có thật ở nơi khác) và tùy chọn `ADMIN_NAME`.
4. Giữ `GEMINI_API_KEY` ở biến môi trường server, không commit API key lên GitHub.
5. Deploy lại và kiểm tra `/api/health`, yêu cầu `authStore.ready: true`.
6. Mở khu vực Tài khoản; đăng nhập bằng tài khoản bootstrap. Sau đó thử đăng ký User bình thường và thử toàn bộ thao tác Admin trên môi trường staging.

Admin bootstrap chạy một lần cho mỗi database; nếu email đã tồn tại, tài khoản đó được cấp vai trò Admin nhưng mật khẩu hiện có không bị ghi đè. Những thay đổi vai trò về sau không bị đảo lại trong lần redeploy tiếp theo.

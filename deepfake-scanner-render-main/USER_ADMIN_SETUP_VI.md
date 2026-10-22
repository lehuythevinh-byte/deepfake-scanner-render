# Hướng dẫn cấu hình User/Admin — Deepfake Scanner

## Cần trước khi dùng

- Node.js 22+
- PostgreSQL có kết nối từ backend
- `GEMINI_API_KEY` nếu muốn dùng tính năng AI thực
- Không đưa `.env` hoặc dữ liệu bí mật lên GitHub

## Chạy local

1. Sao chép `.env.example` thành `.env`.
2. Điền `DATABASE_URL` PostgreSQL, `GEMINI_API_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
3. Dùng mật khẩu Admin riêng biệt có ít nhất 12 ký tự.
4. Cài dependencies bằng `npm install`.
5. Chạy `npm run dev`.
6. Vào `/#account` để đăng ký/đăng nhập. Nếu đăng nhập bằng email bootstrap, tài khoản đó sẽ có quyền Admin.

## Chạy trên Render

1. Tạo PostgreSQL database trên Render.
2. Trong Web Service → Environment, thêm `DATABASE_URL` = Internal Database URL của database.
3. Điền `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `GEMINI_API_KEY` trong phần Environment. Không dán các giá trị bí mật vào code hoặc chat công khai.
4. Deploy lại service. Xem `https://TEN-SERVICE.onrender.com/api/health` và cần thấy `authStore.ready: true`.
5. Đăng nhập tài khoản Admin ở nút **Tài khoản** trên đầu trang; chuyển đến **Admin** nếu vai trò là `admin`.

## Có gì trong bản này

- Đăng ký/đăng nhập bằng email và mật khẩu, mật khẩu được băm bằng scrypt.
- Phiên đăng nhập lưu dạng hash trong PostgreSQL; cookie `HttpOnly`, `SameSite=Lax`, `Secure` khi chạy production.
- Vai trò User/Admin kiểm tra ở backend; không nhận role do người đăng ký gửi lên.
- User xem, tải JSON hoặc xóa lịch sử quét của chính tài khoản.
- Admin xem số liệu tổng hợp, tìm kiếm tài khoản, tạm khóa/mở khóa, cấp/hạ quyền và xem audit log.
- Chống khóa/hạ quyền Admin đang hoạt động cuối cùng.
- Lịch sử không lưu tệp gốc hay toàn văn tin nhắn; chỉ lưu tên tệp, chế độ, trạng thái và tóm tắt.

## Giới hạn cần biết

- Chưa có khôi phục mật khẩu qua email, MFA, CAPTCHA hoặc xác minh email; không nên mở rộng quyền đăng ký Admin ngoài quy trình cấp quyền có kiểm soát.
- Bootstrap Admin chỉ áp dụng một lần cho mỗi database. Nếu email đã có trong database, vai trò được nâng lên Admin nhưng mật khẩu không bị ghi đè; các thay đổi vai trò sau đó được giữ qua lần redeploy.
- Khi chưa đặt `DATABASE_URL`, website vẫn khởi động để các công cụ khách cũ có thể hoạt động, nhưng tính năng User/Admin sẽ báo chưa cấu hình.
- Đây không phải kiểm định bảo mật độc lập; hãy kiểm thử staging trước khi dùng với người dùng thực.

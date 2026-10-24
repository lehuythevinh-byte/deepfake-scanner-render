# Bản sửa đăng ký và đăng nhập — Deepfake Scanner

## Đã thay đổi

- Chuẩn hóa email ở cả giao diện và máy chủ bằng cách bỏ khoảng trắng đầu/cuối và chuyển thành chữ thường.
- Đồng bộ giới hạn mật khẩu đăng ký giữa giao diện và máy chủ: từ 10 đến 128 ký tự. Mật khẩu không bị tự động cắt khoảng trắng.
- Thêm nút hiện/ẩn mật khẩu và nhãn trợ năng cho nút này.
- Thông báo rõ hơn khi tài khoản chưa sẵn sàng hoặc không thể kết nối máy chủ.
- Nếu đăng ký thành công phần ghi tài khoản nhưng lỗi khi tạo phiên, giao dịch PostgreSQL được rollback để tránh tạo tài khoản dở dang.
- Đăng nhập cập nhật lần đăng nhập gần nhất và tạo phiên trong cùng giao dịch; kiểm tra trạng thái tài khoản trong lúc khóa hàng để giảm nguy cơ đăng nhập đua với thao tác khóa tài khoản của Admin.
- Kiểm tra định dạng hash mật khẩu được lưu trước khi gọi `scrypt`, tránh lỗi nếu dữ liệu hash bị hỏng.
- Nếu email đã tồn tại, thông báo hướng dẫn đăng nhập hoặc dùng email khác.
- Đăng xuất chỉ thông báo thành công khi máy chủ trả lời thành công.

## Biến môi trường cần có trên Render

- `DATABASE_URL`: URI PostgreSQL của Supabase hoặc PostgreSQL đang dùng.
- `PGSSLMODE=require`: bật TLS khi cần kết nối SSL.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`: chỉ dùng để khởi tạo Admin lần đầu theo cơ chế hiện có. Mật khẩu Admin phải tối thiểu 12 ký tự.
- Giữ nguyên `GEMINI_API_KEY` và các biến AI hiện tại.

## Kiểm tra sau khi triển khai

1. Xem Render Logs để xác nhận dòng `[AuthStore] PostgreSQL schema is ready.`.
2. Thử đăng ký với email mới và mật khẩu từ 10 ký tự.
3. Thử đăng xuất, đăng nhập lại, sau đó tải lại trang để xác nhận phiên được khôi phục.
4. Thử đăng ký lại cùng email để xác nhận giao diện báo email đã tồn tại.
5. Thử mật khẩu sai và email sai; hệ thống không được cấp phiên đăng nhập.
6. Thử tài khoản bị khóa (nếu có tài khoản thử nghiệm) để xác nhận máy chủ từ chối đăng nhập.

Không đưa `DATABASE_URL`, `GEMINI_API_KEY` hoặc bất kỳ mật khẩu thật nào vào GitHub hay tài liệu này.

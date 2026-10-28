# ADMIN CENTER V4 — Chỉnh sửa website trực tiếp, không cần sửa code

## Có thể chỉnh gì trong bảng quản trị?

- Tên website và dòng mô tả thương hiệu.
- Bật/tắt thông báo hiển thị ở đầu trang chủ và sửa nội dung thông báo.
- Sửa dòng chữ nhỏ, hai dòng tiêu đề lớn, mô tả và nhãn hai nút ở khu vực mở đầu.
- Sửa tiêu đề và mô tả phần giới thiệu, ba thẻ giới thiệu, tiêu đề/mô tả ba công cụ nổi bật và nhãn các nút.
- Sửa tiêu đề, mô tả, 4 câu hỏi và câu trả lời của mục FAQ.
- Đổi màu nhấn chính và màu nền chính; có khung xem trước.
- Ẩn/hiện các khu vực trên trang chủ: mở đầu, giới thiệu, tính năng, giới hạn AI, cách sử dụng, cẩm nang an toàn, quyền riêng tư và FAQ.
- Khôi phục toàn bộ cấu hình về mặc định.

## Cách sử dụng

1. Đăng nhập bằng tài khoản có quyền `admin`.
2. Mở **Tài khoản / Quản trị** trên website.
3. Tìm phần **Chỉnh sửa website không cần sửa code**.
4. Sửa các trường, bật/tắt khu vực, chọn màu hoặc nhấn **Xem trước nội dung**.
5. Nhấn **Lưu thay đổi**. Cấu hình được ghi vào bảng PostgreSQL `site_settings`; người dùng khác sẽ nhận cấu hình mới khi tải lại trang.

## Triển khai và dữ liệu

- API công khai chỉ đọc cấu hình: `GET /api/site-config`.
- API quản trị: `GET /api/admin/site-config` và `PUT /api/admin/site-config`; backend xác minh session và vai trò admin.
- Nội dung được lưu dưới dạng JSONB trong PostgreSQL. Migration `migrations/003_site_customization.sql` chạy qua hệ thống migration hiện có; `server.ts` cũng tạo bảng theo cách idempotent để tương thích khi khởi động.
- Khi chưa có `DATABASE_URL`, website vẫn dùng cấu hình mặc định, nhưng phần lưu cấu hình quản trị không hoạt động.
- Chỉ cho phép văn bản thuần, độ dài có giới hạn và mã màu HEX `#RRGGBB`. Không cho phép nhập HTML hoặc JavaScript tùy ý qua bảng quản trị.

## Kiểm tra trước khi đưa lên website chính

Trong thư mục dự án chạy:

```bash
git diff --check
npm install
npm run lint
npm run build
```

Chỉ đẩy code lên GitHub khi các lệnh kiểm tra thành công. Sau khi Render deploy bản mới, đăng nhập admin và kiểm tra API `/api/site-config`, rồi thử thay đổi một dòng tiêu đề, lưu, tải lại trang chủ và xác nhận thay đổi còn tồn tại.

# Đưa Deepfake Scanner V5.0.1 lên GitHub

1. Giải nén ZIP vào thư mục Downloads.
2. Mở thư mục `Deepfake_Scanner_V5_Advanced`.
3. Nhấp đúp `PUSH_TO_GITHUB.bat`.
4. Script sẽ clone nhánh `release/v5.0.1-localhost-ready-20261104`, thay nội dung nhánh bằng mã nguồn trong thư mục này, loại trừ `.env`, `.env.local`, `.env.production`, `node_modules`, `dist` và log.
5. Kiểm tra danh sách file và thống kê Git. Chỉ nhập `PUSH` khi chắc chắn không có khóa API, mật khẩu hoặc chuỗi kết nối database.
6. Git Credential Manager có thể mở trình duyệt để bạn đăng nhập GitHub. Không gửi token hoặc mật khẩu cho người khác.

Nhánh đích:
`https://github.com/lehuythevinh-byte/deepfake-scanner-render/tree/release/v5.0.1-localhost-ready-20261104`

Script chỉ cập nhật nhánh phát hành riêng, không push vào `main` và không tự kích hoạt thay đổi trên website production.

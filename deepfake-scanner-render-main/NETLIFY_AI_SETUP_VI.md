# Bật Gemini AI cho Deepfake Scanner trên Netlify

## 1. Deploy mã nguồn

- Đẩy toàn bộ thư mục dự án lên GitHub.
- Trong Netlify chọn **Add new site → Import an existing project** rồi chọn repository.
- Build command: `npm run build`
- Publish directory: `dist`
- Không chỉ tải riêng thư mục `dist`; Netlify cần cả `netlify.toml`, `server.ts` và `netlify/functions/api.ts` để chạy API.

## 2. Thêm API Key (bắt buộc)

1. Mở Google AI Studio và tạo API key.
2. Trong Netlify vào **Site configuration / Project configuration → Environment variables**.
3. Thêm:
   - Name: `GEMINI_API_KEY`
   - Value: dán API key thật của bạn
   - Scopes: để áp dụng cho Functions và Deploys nếu Netlify có lựa chọn scope.
4. Thêm biến `GEMINI_MODEL` với giá trị `gemini-3.8-flash` (tùy chọn; có thể để mặc định của mã nguồn).
5. Lưu và chạy **Trigger deploy → Clear cache and deploy site**.

**Không** đặt key trong `src/`, không dùng tiền tố `VITE_`, không commit key lên GitHub, và không gửi key trong ảnh chụp/log.

## 3. Kiểm tra sau deploy

Mở:

`https://TEN-SITE-CUA-BAN.netlify.app/api/health`

Kết quả mong đợi gồm `status: "ok"`, `aiConfigured: true` và tên model. `aiConfigured: true` chỉ xác nhận key đã được nạp vào Function; cần thử quét ảnh hoặc hỏi SafeBot để xác nhận lời gọi AI thật.

## 4. Nếu giao diện vẫn báo chế độ dự phòng

Mở **Netlify → Functions → api → Logs**, chạy lại một lần rồi xem log mới. Giao diện Scanner cũng hiện mã chẩn đoán:

- `AI_NOT_CONFIGURED`: chưa thêm `GEMINI_API_KEY`, tên biến sai, hoặc deploy chưa chạy lại sau khi thêm biến.
- `INVALID_API_KEY`: API Key không hợp lệ.
- `API_KEY_PERMISSION_DENIED`: key/API không có quyền truy cập.
- `QUOTA_EXCEEDED`: đã chạm hạn mức hoặc giới hạn tốc độ.
- `MODEL_OR_ENDPOINT_NOT_FOUND`: kiểm tra tên model hoặc endpoint.
- `GEMINI_TEMPORARILY_UNAVAILABLE`: thử lại sau và kiểm tra log nhà cung cấp.
- `NETWORK_ERROR` / `GEMINI_REQUEST_FAILED`: xem chi tiết lỗi trong Function logs.

Ảnh lớn hơn khoảng 3,2 MB sẽ được trình duyệt giảm kích thước/nén trước khi gửi vì Netlify Functions có giới hạn payload. Phần chữ, SafeBot, trang học tập và các chức năng khác vẫn được giữ lại; chỉ phần ảnh lớn có thể được tối ưu lại trước khi phân tích.

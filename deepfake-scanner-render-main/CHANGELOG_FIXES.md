# DEEPFAKE SCANNER — Bản vá và ghi chú kiểm thử

## Bổ sung ngày 22/10/2026 — User/Admin Console

- Thêm đăng ký, đăng nhập, đăng xuất và khôi phục session qua cookie `HttpOnly`, `SameSite=Lax`; cookie `Secure` trong production.
- Thêm lưu tài khoản, session hash, lịch sử phân tích tối thiểu và nhật ký quản trị trong PostgreSQL.
- Thêm khu vực tài khoản: xem hồ sơ, xem lịch sử, xuất JSON, xóa lịch sử của chính tài khoản.
- Thêm Admin Console: số liệu tổng quan, trạng thái cấu hình AI/cơ sở dữ liệu, tìm kiếm tài khoản, khóa/mở khóa, cấp/hạ quyền Admin và audit log.
- Vai trò luôn do backend quyết định; các route Admin kiểm tra quyền phía server. Không lưu ảnh hoặc toàn văn tin nhắn người dùng vào lịch sử.
- Bảo vệ Admin hoạt động cuối cùng và không cho Admin tự khóa hoặc tự hạ quyền của chính mình qua giao diện/API này.
- Bootstrap Admin chạy một lần bằng `ADMIN_EMAIL` và `ADMIN_PASSWORD`, tránh tự cấp lại quyền ở mỗi lần deploy.
- Thêm `DATABASE_URL` và các biến bootstrap vào `.env.example`/`render.yaml`; thêm `USER_ADMIN_SETUP_VI.md`.
- Xác minh cú pháp TS/TSX bằng TypeScript transpileModule. Build toàn dự án chưa chạy được trong môi trường này do npm install không hoàn tất; cần xác nhận `npm install`, `npm run build` và `npm run lint` trên CI/Render sau khi đẩy code.

## Bổ sung ngày 21/10/2026 — Xử lý Gemini 503 trên Render

- Thêm retry có giới hạn (tối đa 2 lần thử lại cho mỗi model) với exponential backoff và jitter cho lỗi dịch vụ/mạng tạm thời như HTTP 503.
- Áp dụng cùng cơ chế retry cho cả AI Scanner và SafeBot; chỉ chuyển sang model dự phòng sau khi model chính đã hết lượt thử lại.
- Không retry tự động các lỗi cấu hình/quyền hoặc quota 429, tránh tạo thêm lượt gọi không có ích.
- Khi cả hai model vẫn lỗi, giữ kết quả quy tắc dự phòng nhưng gắn rõ `isHeuristicNotice` và mã chẩn đoán; không tuyên bố đó là giám định ảnh bằng AI.
- Cập nhật thông báo giao diện và hướng dẫn triển khai để chỉ đúng **Render → Environment / Logs**.
- Nới ngưỡng tối ưu ảnh phía trình duyệt từ 3,2 MB lên 8 MB vì ngưỡng cũ dành cho payload Netlify Functions; giới hạn kiểm tra ảnh phía máy chủ vẫn là 20 MB.
- Kiểm tra cú pháp TypeScript/TSX cho các file đã sửa và kiểm thử helper retry bằng mock: thành công sau lỗi 503, dừng sau 3 lần gọi nếu dịch vụ vẫn lỗi, không retry mã quota 429. Cài dependency đầy đủ để chạy build toàn dự án không hoàn tất trong môi trường này, vì vậy cần xác nhận build cuối cùng trên Render sau khi đẩy mã nguồn.

## Các thay đổi trong bản này

### 1. Sửa lỗi cấu hình và khả năng chạy
- Đồng bộ `esbuild` lên nhánh phiên bản tương thích với Vite 8 (`^0.27.0`) để xử lý xung đột khai báo dependency đã thấy.
- Sửa cấu hình alias của Vite, không dùng `__dirname` trực tiếp trong tệp ESM.
- Bổ sung `node` vào `types` của `tsconfig.json` để các kiểu toàn cục Node.js được nhận diện khi kiểm tra server.
- Chuyển `tsx` sang `dependencies` để lệnh `npm start` có runtime TypeScript cả trong môi trường triển khai chỉ cài dependencies production.
- Thêm script dọn dẹp đa nền tảng `scripts/clean.mjs`.
- Thêm `render.yaml` cho phương án deploy Express + frontend trên dịch vụ Node.js; sửa `netlify.toml` để không chuyển API vào Netlify Functions không tồn tại.

### 2. Sửa lỗi schema và hành vi AI
- Sửa thuộc tính `sourcesAndEvidence.analyzedLinks` bị lồng trùng trong schema gửi Gemini.
- Cho phép cấu hình model bằng biến môi trường `GEMINI_MODEL`, với tên mặc định được đặt trong server.
- Tách chỉ dẫn hệ thống khỏi bằng chứng do người dùng gửi, và chỉ rõ rằng văn bản/ảnh/tên tài khoản/link người dùng cung cấp là dữ liệu cần phân tích, không phải chỉ dẫn cho AI.
- Khi Gemini không hoạt động, kết quả dự phòng không còn bịa ra quan sát mắt, ánh sáng, ranh giới mặt hoặc pixel. Phần giám định hình ảnh luôn ghi “chưa đủ thông tin/chưa thực hiện được”.
- Chế độ dự phòng chỉ sàng lọc một số dấu hiệu trong văn bản và hiển thị cảnh báo rõ ràng; không còn tự đánh dấu đáng ngờ chỉ vì đang quét bài đăng mạng xã hội.
- Từ ngữ chỉ sự gấp gáp không còn tự tạo kịch bản cảnh báo nếu không đi kèm dấu hiệu rủi ro khác.
- Cảnh báo liên kết mô tả rõ rằng ứng dụng chưa truy cập/kiểm chứng đích đến của URL.
- Giới hạn số lượng lịch sử tin nhắn và chiều dài hội thoại gửi tới chatbot.

### 3. Kiểm tra đầu vào và bảo mật
- Giới hạn ảnh ở 20 MB, đồng bộ thông báo giao diện và server.
- Server kiểm tra MIME type, sự khớp giữa MIME khai báo và data URI, định dạng base64, dung lượng ảnh, loại chế độ quét, và độ dài văn bản trước khi gọi API.
- Thêm phản hồi JSON dễ hiểu cho request JSON sai hoặc quá lớn.
- API key tiếp tục chỉ nằm trong biến môi trường phía server; nhãn giao diện được đổi từ “AI ONLINE” sang “AI KEY SET” để không tuyên bố kết nối thành công khi chỉ mới có API key.

### 4. Minh bạch dữ liệu nghiên cứu
- Gắn nhãn rõ N=320 và các tỷ lệ dựng sẵn là dữ liệu minh họa, không phải kết quả khảo sát đã xác minh.
- Không tự điền sẵn các lựa chọn trong phiếu khảo sát; yêu cầu người dùng trả lời các câu hỏi trước khi gửi.
- Sửa xuất CSV để trích dẫn dữ liệu mẫu, phân biệt dữ liệu minh họa với phiếu lưu cục bộ trên trình duyệt.
- Sửa phần báo cáo nghiên cứu để không khẳng định các tỷ lệ minh họa là sự thật, đồng thời thêm khuyến cáo về quyền riêng tư khi dùng Gemini với dữ liệu học sinh.
- Cập nhật README về cách chạy, deploy, cấu hình biến môi trường và giới hạn hiện tại.

## Kết quả kiểm tra thực hiện được
- Đã chạy kiểm tra cú pháp chuyển đổi TypeScript/TSX cho tất cả tệp `.ts` và `.tsx` bằng trình biên dịch TypeScript có sẵn trong môi trường; không có lỗi cú pháp được báo cáo.
- Đã kiểm tra lại và sửa schema JSON bị lồng trùng trong `server.ts`.
- Đã kiểm tra cấu hình package, Vite, tsconfig, Netlify và Render ở mức mã nguồn.

## Điều chưa thể xác nhận
- `npm install` không hoàn tất vì môi trường gặp lỗi DNS/kết nối `EAI_AGAIN` tới npm registry. Vì vậy chưa thể chạy `npm run build`, `npm run lint`, hoặc kiểm thử end-to-end với đầy đủ dependency trong phiên này. Kiểm tra cú pháp không thay thế được build và kiểm thử tích hợp.
- Model Gemini có thực sự khả dụng còn phụ thuộc vào model được Google hỗ trợ tại thời điểm chạy, API key, quota, khu vực và quyền truy cập của tài khoản. Có thể đổi bằng `GEMINI_MODEL`.
- Bộ heuristic dự phòng chỉ là kiểm tra từ khóa văn bản, không phải mô hình phát hiện deepfake, không phân tích pixel, không kiểm tra tính an toàn thực tế của URL và không nên dùng làm bằng chứng kết luận.
- Ứng dụng hiện không có bộ giám định âm thanh/video chuyên sâu; chỉ nên công bố các chức năng thực sự đã triển khai.

## Lệnh cần chạy trên máy có kết nối npm

```bash
npm install
npm run lint
npm run build
npm run dev
```

Sau khi cấu hình `GEMINI_API_KEY` trong `.env`, kiểm tra `/api/health`, thử quét ảnh PNG/JPEG/WEBP, thử nội dung văn bản, thử thiếu API key và thử lỗi model/quota. Không đưa `.env` thật lên GitHub.

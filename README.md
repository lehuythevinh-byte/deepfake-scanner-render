# DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ

### Đề tài Nghiên cứu Khoa học Kỹ thuật (STEM):
> **“GIẢI PHÁP GIÚP HỌC SINH TRUNG HỌC CƠ SỞ TRÁNH MỘT SỐ TÁC ĐỘNG RỦI RO TỪ DEEPFAKE KHI SỬ DỤNG MẠNG XÃ HỘI”**

---

## 1. Giới thiệu dự án

**DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ** là một nền tảng công nghệ giáo dục và an toàn thông tin ứng dụng, được phát triển phục vụ học sinh Trung học Cơ sở (THCS, độ tuổi 11 - 15 tuổi), phụ huynh, giáo viên và hội đồng đánh giá dự án STEM.

1. **Social Threat Scanner:** Công cụ giám định đa tầng với 3 chế độ:
   - **Chế độ A — Image Scanner:** Nhận diện Deepfake, hoán đổi khuôn mặt (Face Swap), tính nhất quán quang học và đọc chữ qua OCR.
   - **Chế độ B — Social Post Scanner:** Phân tích ảnh chụp bài đăng MXH, tên tài khoản/handle, caption, link bài đăng để phát hiện mạo danh, tin giả, quảng cáo lừa đảo.
   - **Chế độ C — Message & Scam Scanner:** Rà soát tin nhắn đòi tiền gấp, trộm OTP 6 số, trúng thưởng đóng phí, tống tiền ảnh nhạy cảm; trích dẫn chính xác câu chữ cụ thể làm căn cứ.
   - **10 Kịch bản kiểm tra chiêu trò tích hợp:** Bao quát từ giả giọng người thân, link phishing, hack nick đến áp lực tâm lý FOMO.
2. **Evidence Lab:** Phòng kiểm chứng độc lập với checklist tương tác giúp học sinh không phụ thuộc hoàn toàn vào AI.
3. **Safety Simulator:** Hệ thống mô phỏng 5 tình huống thực tế thường gặp trên mạng xã hội.
4. **SafeBot AI & Trung tâm Dữ liệu:** Trợ lý tư vấn an toàn số và dashboard có dữ liệu minh họa N=320; cần thay bằng số liệu khảo sát thật trước khi báo cáo khoa học.

---

## 2. Các công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend & Full-stack:** Node.js, Express, `tsx` (TypeScript Execution).
- **Trí tuệ nhân tạo (AI Engine):** Google GenAI SDK (`@google/genai`) với mô hình `gemini-3.8-flash`.
- **Đóng gói & Build:** Vite 8.
- **Triển khai hiện tại:** Render chạy ứng dụng Node.js/Express và phục vụ frontend đã build từ cùng một web service.

---

## 3. Cách chạy ở môi trường phát triển (Development)

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
2. Khởi chạy máy chủ phát triển (Full-stack tích hợp Vite middleware):
   ```bash
   npm run dev
   ```
3. Truy cập ứng dụng tại địa chỉ:
   ```
   http://localhost:3000
   ```

---

## 4. Cách build dự án (Production Build)

Để biên dịch mã nguồn sang định dạng tĩnh tối ưu:
```bash
npm run build
```
Thư mục xuất ra sẽ nằm tại `dist/`.

Để chạy máy chủ production:
```bash
npm start
```

---

## 5. Triển khai trên Render (frontend + Gemini API)

Dự án có sẵn `render.yaml` để triển khai giao diện React và backend Express trong cùng một Web Service.

1. Đẩy toàn bộ source code lên GitHub; không đưa tệp `.env` có API key thật vào repository.
2. Trong [Render Dashboard](https://dashboard.render.com/), tạo **New → Web Service** và kết nối repository.
3. Thiết lập:
   - **Build Command:** `npm install --include=dev --no-audit --no-fund && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Trong **Environment**, thêm `GEMINI_API_KEY` với API key từ Google AI Studio. Giữ `GEMINI_MODEL` là `gemini-3.8-flash` hoặc chọn model đang được Gemini API hỗ trợ.
5. Lưu thay đổi và deploy lại. Mở `https://TEN-DICH-VU.onrender.com/api/health`; `status: "ok"` xác nhận server khởi động, còn `aiConfigured: true` chỉ xác nhận key có mặt, không đảm bảo Gemini đang sẵn sàng.
6. Thử AI Scanner và SafeBot. Nếu có lỗi, mở **Render → Logs** để đọc mã HTTP và nguyên nhân của Gemini.

### Cơ chế xử lý Gemini tạm thời không khả dụng

Server thử lại tối đa 2 lần cho mỗi model khi gặp lỗi dịch vụ/mạng tạm thời (bao gồm HTTP 503), với thời gian chờ tăng dần. Nếu model chính vẫn thất bại, server thử model dự phòng `gemini-3.1-flash-lite` theo cùng cơ chế. Nếu cả hai không khả dụng, Scanner có thể hiển thị kết quả quy tắc dự phòng kèm cảnh báo rõ ràng; kết quả đó **không phải** giám định hình ảnh bằng AI và không được xem là xác nhận ảnh thật/giả.

> Dự án vẫn giữ `netlify.toml` và `netlify/functions/` để hỗ trợ cấu hình Netlify khi cần, nhưng hướng dẫn triển khai chính ở đây là Render.

---

## 6. Danh sách biến môi trường

Khai báo trong tệp `.env` hoặc cấu hình máy chủ:

| Biến môi trường | Bắt buộc | Mô tả |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Khuyến nghị | Khóa API Google AI Studio dùng cho phân tích AI Scanner và SafeBot. Chỉ đặt ở môi trường máy chủ. |
| `PORT` | Không (Mặc định 3000) | Cổng mạng của máy chủ Express. |
| `NODE_ENV` | Không | `development` hoặc `production`. |
| `GEMINI_MODEL` | Không | Model Gemini API; mặc định `gemini-3.8-flash`. |

*Ghi chú bảo mật:* API key chỉ được đọc ở máy chủ (`server.ts`), không gửi về frontend. Khi bật Gemini, ảnh và văn bản người dùng gửi sẽ được chuyển tới Gemini API để phân tích. Không tải dữ liệu nhạy cảm; trước khi dùng với học sinh thật, cần thông báo và xin sự đồng ý phù hợp, kiểm tra chính sách dữ liệu của nhà cung cấp, đồng thời xác định quy trình lưu/xóa dữ liệu.

---

## 7. Cách cấu hình dịch vụ AI

1. Truy cập [Google AI Studio](https://aistudio.google.com/) để tạo một API key.
2. Nếu chạy local, đặt khóa trong tệp `.env` (không commit tệp này vào GitHub). Khi deploy Render, đặt `GEMINI_API_KEY` tại **service → Environment** thay vì đưa key vào code.
3. Khởi động lại server local hoặc deploy lại dịch vụ Render sau khi lưu biến môi trường.
4. `/api/health` hiển thị `aiConfigured` để kiểm tra biến có tồn tại, nhưng đây không phải bài kiểm tra gọi model. Khi API thất bại, scanner hiển thị mã chẩn đoán an toàn như `INVALID_API_KEY`, `QUOTA_EXCEEDED` hoặc `MODEL_OR_ENDPOINT_NOT_FOUND`; xem Render Logs để biết chi tiết. Không coi chế độ dự phòng là giám định ảnh bằng AI.

---

## 8. Cách kiểm tra hoạt động (Kiểm thử)

1. **Trang chủ:** Kiểm tra hiển thị tiêu đề đề tài, 4 trụ cột giải pháp, quy trình 4 bước (Dừng lại → Kiểm chứng → Bảo vệ → Báo cáo).
2. **AI Scanner:** 
   - Thử tải lên một ảnh từ máy hoặc bấm vào các nút mẫu thử nghiệm: *Mẫu A (Chân dung Face Swap)*, *Mẫu B (Tin giả tạo sinh)*, *Mẫu C (Ảnh chân thực)*.
   - Nhấn "Tiến hành phân tích tệp" để xem báo cáo giám định đa tầng.
3. **Evidence Lab:** Chọn loại nội dung (ảnh, video, giọng nói, tin lan truyền, nick mạo danh) và đánh dấu checklist để nhận chỉ dẫn hành động.
4. **Safety Simulator:** Lần lượt trải nghiệm 5 tình huống thực tế và đọc phản hồi giáo dục.
5. **SafeBot AI:** Nhập câu hỏi tình huống hoặc chọn các câu hỏi gợi ý nhanh để nhận tư vấn.
6. **Research Dashboard:** Thử làm phiếu khảo sát và xuất CSV. Dataset N=320 có sẵn trong source là dữ liệu minh họa để trình diễn giao diện, không được trích dẫn như kết quả nghiên cứu thật; hãy thay bằng dữ liệu khảo sát hợp lệ trước khi sử dụng trong báo cáo.

---

## 9. Những tính năng chưa được triển khai (Giới hạn hiện tại)

Theo đúng quy tắc trung thực khoa học:
- **Phân tích âm thanh tự động thời gian thực (Real-time Audio Waveform Forensics):** Chưa có bộ phân tích tín hiệu âm thanh chuyên sâu trong source hiện tại.
- **Tự động xóa nội dung trên mạng xã hội:** Website là công cụ giáo dục và hỗ trợ kiểm chứng; không có thẩm quyền kỹ thuật để tự động gỡ bỏ video trên các nền tảng bên thứ ba (như TikTok, Facebook). Học sinh cần sử dụng chức năng Báo cáo (Report) hoặc nhờ người lớn liên hệ Tổng đài 111.

---

## 10. Các giới hạn của mô hình phát hiện Deepfake

1. **Không đảm bảo chính xác 100%:** Các mô hình trí tuệ nhân tạo hoạt động dựa trên xác suất nhận dạng mẫu pixel và đặc trưng thống kê. Kết quả "Chưa phát hiện dấu hiệu bất thường" KHÔNG đồng nghĩa chắc chắn 100% nội dung là thật.
2. **Tác động từ chất lượng tệp:** Ảnh hoặc video bị nén nhiều lần khi gửi qua mạng xã hội (như Zalo, Facebook Messenger) có thể làm mờ các chi tiết vi mô, gây khó khăn cho việc phân tích.
3. **Vai trò con người là quyết định:** Mọi kết quả phân tích kỹ thuật số chỉ đóng vai trò tham khảo. Kỹ năng xác minh qua kênh độc lập (gọi điện thoại trực tiếp, kiểm tra báo chí chính thống) vẫn là chốt chặn quan trọng nhất.


## 9. Tài khoản Người dùng và Admin Console

Source hiện có khu vực tài khoản và bảng quản trị mới. Các tính năng tài khoản yêu cầu PostgreSQL; nếu chưa cấu hình cơ sở dữ liệu, các công cụ khách cũ vẫn hoạt động nhưng đăng ký/đăng nhập sẽ báo chưa sẵn sàng.

### Thiết lập trên Render

1. Tạo một PostgreSQL database từ Render Dashboard (nên dùng cùng region với Web Service).
2. Trong Web Service → Environment, đặt `DATABASE_URL` bằng **Internal Database URL** của PostgreSQL.
3. Đặt `ADMIN_EMAIL` là email quản trị ban đầu, `ADMIN_PASSWORD` là mật khẩu duy nhất tối thiểu 12 ký tự, và tùy chọn `ADMIN_NAME`.
4. Không đưa mật khẩu quản trị hoặc `DATABASE_URL` vào GitHub. Các biến `sync: false` trong `render.yaml` được khai báo để nhập an toàn trên Render.
5. Deploy lại. Mở `/api/health` và xác nhận `authStore.ready` là `true`.
6. Đăng nhập bằng email/mật khẩu bootstrap. Chỉ dùng email quản trị chuyên dụng và thay mật khẩu mặc định ngay nếu có sử dụng tạm thời.

`ADMIN_EMAIL`/`ADMIN_PASSWORD` dùng cho bước bootstrap Admin đầu tiên. Nếu email đã tồn tại, ứng dụng cấp vai trò Admin cho tài khoản đó nhưng không ghi đè mật khẩu. Cờ bootstrap được lưu trong database nên các thay đổi vai trò về sau không tự bị đảo lại khi redeploy.

### API tài khoản

- `POST /api/auth/register` — đăng ký tài khoản User; vai trò luôn được cấp ở server và không nhận role từ client.
- `POST /api/auth/login` — đăng nhập; session opaque token được lưu dưới dạng SHA-256 hash trong PostgreSQL và gửi bằng cookie `HttpOnly`, `SameSite=Lax`.
- `POST /api/auth/logout` — thu hồi session.
- `GET /api/auth/me` — kiểm tra session hiện tại.
- `GET /api/me/scans` / `DELETE /api/me/scans` — xem/xóa lịch sử của chính tài khoản.
- `GET /api/admin/overview`, `GET /api/admin/users`, `GET /api/admin/audit` — API chỉ dành cho Admin.
- `PATCH /api/admin/users/:id/status` — tạm khóa/mở khóa tài khoản, thu hồi session khi khóa.
- `PATCH /api/admin/users/:id/role` — cấp/hạ quyền Admin, bảo vệ Admin cuối cùng.

Lịch sử quét chỉ lưu chế độ, tên tệp, trạng thái, tóm tắt và cờ kết quả dự phòng; không lưu ảnh hoặc nội dung tin nhắn gốc. Mọi thao tác phân quyền/trạng thái được ghi vào audit log. Đây là phiên bản chức năng cơ bản; trước khi mở công khai quy mô lớn nên bổ sung CAPTCHA/chống bot và quy trình khôi phục mật khẩu đã xác minh email.

### Nếu Render vẫn trả 503

- Đọc **Render → Logs** để phân biệt lỗi khởi động Node, lỗi build và lỗi gọi Gemini.
- Mở `/api/health`: endpoint này kiểm tra tiến trình backend; `aiConfigured: true` chỉ cho biết API key đã được đặt, không đảm bảo Gemini đang sẵn sàng.
- Nếu `authStore.configured` là `false`, đặt `DATABASE_URL`. Nếu `authStore.ready` là `false`, kiểm tra URL PostgreSQL, quyền kết nối và log `[AuthStore]`.
- Xác nhận Build Command là `npm install --include=dev --no-audit --no-fund && npm run build`, Start Command là `npm start`, Health Check Path là `/api/health`.

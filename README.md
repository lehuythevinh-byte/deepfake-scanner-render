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
- **Triển khai:** Netlify phục vụ frontend tĩnh và chạy API Express qua Netlify Function tại `netlify/functions/api.ts`.

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

## 5. Triển khai trực tiếp trên Netlify (frontend + Gemini API)

Dự án đã được cấu hình để Netlify phục vụ giao diện Vite và chạy API bằng Netlify Functions. Bạn không cần triển khai backend lên Render riêng.

1. Đẩy **toàn bộ source code** lên GitHub, bao gồm `server.ts`, `netlify.toml` và thư mục `netlify/functions/`.
2. Trong Netlify, chọn **Add new site → Import an existing project** và kết nối repository.
3. Build command: `npm run build`; Publish directory: `dist`. Netlify tự cài dependencies từ `package.json`; file `netlify.toml` đã chứa các cài đặt này nên Netlify thường tự nhận.
4. Trong cấu hình site, mở **Environment variables** và thêm:
   - `GEMINI_API_KEY` = API Key được tạo trong Google AI Studio.
   - `GEMINI_MODEL` = `gemini-3.8-flash` hoặc model khác đang được Gemini API hỗ trợ.
5. Lưu biến môi trường rồi chọn **Trigger deploy → Clear cache and deploy site** để Function nhận biến mới.
6. Mở `https://TEN-SITE-CUA-BAN.netlify.app/api/health`. Kết quả cần có `status: "ok"` và `aiConfigured: true`.
7. Thử AI Scanner và SafeBot. Nếu AI Scanner vẫn hiện “Chế độ dự phòng”, hãy mở **Netlify → Functions → api → Logs** để xem lỗi Gemini. `aiConfigured: true` chỉ xác nhận biến key tồn tại, không đảm bảo key còn hạn mức hoặc model gọi thành công.

**Ảnh lớn:** Netlify Functions giới hạn kích thước request. Ảnh lớn hơn khoảng 3,2 MB sẽ được trình duyệt thu nhỏ/nén trước khi gửi để giảm khả năng vượt giới hạn payload. API Key chỉ được đọc ở phía Function, không đưa vào frontend.

### Chạy trên Render/VPS (tùy chọn)

Nếu sau này muốn dùng backend Node.js riêng, dự án vẫn giữ `render.yaml`. Dùng Build Command `npm install --include=dev --no-audit --no-fund && npm run build`, Start Command `npm start`, rồi đặt `GEMINI_API_KEY` và `GEMINI_MODEL` trong Environment Variables của host. Không cần cách này nếu chỉ dùng Netlify.

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
2. Nếu chạy local, đặt khóa trong tệp `.env` (không commit tệp này vào GitHub). Nếu deploy Netlify, đặt `GEMINI_API_KEY` trong **Site/Project configuration → Environment variables** thay vì đưa key vào code.
3. Restart local server hoặc chạy lại deploy trên Netlify sau khi lưu biến môi trường.
4. `/api/health` hiển thị `aiConfigured` để kiểm tra biến có tồn tại, nhưng đây không phải bài kiểm tra gọi model. Khi API thất bại, scanner hiển thị mã chẩn đoán an toàn như `INVALID_API_KEY`, `QUOTA_EXCEEDED` hoặc `MODEL_OR_ENDPOINT_NOT_FOUND`; xem Function logs để biết chi tiết. Không coi chế độ dự phòng là giám định ảnh bằng AI.

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

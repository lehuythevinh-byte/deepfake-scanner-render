# DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ

### Đề tài Nghiên cứu Khoa học Kỹ thuật (STEM):
> **“GIẢI PHÁP GIÚP HỌC SINH TRUNG HỌC CƠ SỞ TRÁNH MỘT SỐ TÁC ĐỘNG RỦI RO TỪ DEEPFAKE KHI SỬ DỤNG MẠNG XÃ HỘI”**

---

## 1. Giới thiệu dự án

**DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ** là một nền tảng công nghệ giáo dục và an toàn thông tin ứng dụng, được phát triển phục vụ học sinh Trung học Cơ sở (THCS, độ tuổi 11 - 15 tuổi), phụ huynh, giáo viên và hội đồng đánh giá dự án STEM.

Hệ thống bao gồm 5 phân hệ tích hợp:

1. **Social Threat Scanner:** Công cụ giám định đa tầng với 3 chế độ độc lập:
   - **Chế độ A — Image Scanner:** Nhận diện Deepfake, hoán đổi khuôn mặt (Face Swap), tính nhất quán quang học và đọc chữ qua OCR.
   - **Chế độ B — Social Post Scanner:** Phân tích ảnh chụp bài đăng MXH, tên tài khoản/handle, caption, link bài đăng để phát hiện mạo danh, tin giả, quảng cáo lừa đảo.
   - **Chế độ C — Message & Scam Scanner:** Rà soát tin nhắn đòi tiền gấp, trộm OTP 6 số, trúng thưởng đóng phí, tống tiền ảnh nhạy cảm; trích dẫn chính xác câu chữ cụ thể làm căn cứ.
   - **10 Kịch bản kiểm tra chiêu trò tích hợp:** Bao quát từ giả giọng người thân, link phishing, hack nick đến áp lực tâm lý FOMO.
   - **Tối ưu hóa tốc độ cao:** Tự động nén ảnh phía client (giảm 95% dung lượng), thanh tiến trình 5 bước với đồng hồ bấm giờ thời gian thực, mô hình `gemini-3.1-flash-lite` với độ trễ tối thiểu (`thinkingBudget: 0`).
   - **Thanh công cụ xuất kết quả:** Hỗ trợ sao chép kết quả phân tích, xuất JSON có nguồn gốc, xuất CSV tương thích Excel và in/lưu PDF; các mục phân tích có thể đóng/mở dạng accordion.
   - **Bộ sàng lọc tin nhắn đáng ngờ:** Chạy trực tiếp trong trình duyệt, nhận diện các nhóm tín hiệu như gây áp lực, mạo danh, dụ chuyển tiền, lấy OTP, tống tiền và liên kết bất thường; hiển thị điểm cảnh báo theo quy tắc, giải thích từng tín hiệu, có mẫu thử, sao chép và xuất hồ sơ TXT. Nội dung nhập vào công cụ này không được gửi tới API.
2. **Evidence Lab:** Phòng kiểm chứng độc lập với checklist tương tác giúp học sinh không phụ thuộc hoàn toàn vào AI; giải thích tác động của hiện tượng nén ảnh từ mạng xã hội (TikTok, Zalo).
3. **Safety Simulator:** Hệ thống mô phỏng 7 tình huống thực tế thường gặp trên mạng xã hội (chuyển tiền gấp, xin mã OTP, trúng thưởng đóng phí, mạo danh giáo viên, tống tiền ảnh nhạy cảm,...).
4. **SafeBot AI:** Trợ lý tư vấn an toàn số chuẩn mực, ân cần, bảo vệ học sinh, tích hợp bộ hướng dẫn khẩn cấp và đường dây nóng 111.
5. **Research Dashboard:** Trung tâm phân tích dữ liệu nghiên cứu khoa học STEM, phân định rõ ràng giữa dữ liệu mẫu N=320 và dữ liệu khảo sát lưu trữ cục bộ.
6. **Hệ thống Quản trị & Tài khoản (Account & Admin Center):** Phân hệ đăng ký, đăng nhập bảo mật với scrypt và HttpOnly session cookies; Bảng điều khiển quản trị viên (Admin Dashboard) theo dõi chỉ số, quản lý người dùng (khóa/mở tài khoản, cấp quyền admin/user), và nhật ký kiểm toán lượt quét (scan audit metadata, không lưu ảnh/nội dung riêng tư).

---

## 2. Các công nghệ sử dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide React icons.
- **Backend & Full-stack:** Node.js, Express, `tsx` (TypeScript Execution).
- **Cơ sở dữ liệu (Database):** PostgreSQL (`pg`) tự động khởi tạo các bảng `app_users`, `app_sessions`, `scan_audit` khi có `DATABASE_URL`.
- **Trí tuệ nhân tạo (AI Engine):** Google GenAI SDK (`@google/genai`) với mô hình mặc định siêu tốc `gemini-3.1-flash-lite` (hỗ trợ dự phòng `gemini-2.5-flash`).
- **Bảo mật:** Giới hạn tần suất yêu cầu (In-memory IP Rate Limiting), băm mật khẩu bằng scrypt, cookie HttpOnly SameSite=Lax, kiểm tra định dạng/dung lượng nghiêm ngặt, phòng vệ SSRF.
- **Đóng gói & Build:** Vite 8.
- **Triển khai:** Express tích hợp Vite middleware trong môi trường dev; phục vụ thư mục tĩnh `dist/` cùng API trong môi trường production (Node.js).

---

## 3. Cách chạy ở môi trường phát triển (Development)

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
2. Khởi chạy máy chủ phát triển (Full-stack tích hợp Vite middleware trên cổng 3000):
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

## 5. Triển khai toàn bộ ứng dụng (frontend + API)

Dự án có API Express trong `server.ts`; cần nền tảng chạy Node.js (ví dụ Render hoặc VPS):

1. Đẩy toàn bộ repository lên GitHub.
2. Tạo một Web Service từ repository trên nền tảng Node.js.
3. Build command: `npm install --include=dev --no-audit --no-fund && npm run build`.
4. Start command: `npm start`.
5. Cấu hình biến môi trường `GEMINI_API_KEY` trong phần Environment Variables của máy chủ. Có thể đặt `GEMINI_MODEL=gemini-3.1-flash-lite` hoặc các model tương thích.
6. Sau khi deploy, mở `/api/health` trên tên miền của service để kiểm tra backend có phản hồi (`aiConfigured: true`).

---

## 6. Danh sách biến môi trường

Khai báo trong tệp `.env` hoặc cấu hình máy chủ:

| Biến môi trường | Bắt buộc | Mô tả |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Khuyến nghị | Khóa API Google AI Studio dùng cho phân tích AI Scanner và SafeBot. Chỉ đọc ở máy chủ (`server.ts`). |
| `PORT` | Không (Mặc định 3000) | Cổng mạng của máy chủ Express. |
| `NODE_ENV` | Không | `development` hoặc `production`. |
| `GEMINI_MODEL` | Không | Model Gemini API; mặc định `gemini-3.1-flash-lite`. |
| `DATABASE_URL` | Tùy chọn | Internal Database URL của Render PostgreSQL để kích hoạt hệ thống tài khoản & Admin. |
| `ADMIN_EMAIL` | Tùy chọn | Email của quản trị viên đầu tiên được tự động cấp quyền Admin khi tạo database. |
| `ADMIN_PASSWORD` | Tùy chọn | Mật khẩu quản trị viên ban đầu (ít nhất 12 ký tự). |

*Ghi chú bảo mật:* API key và mật khẩu cơ sở dữ liệu chỉ được đọc ở máy chủ (`server.ts`), tuyệt đối không gửi về frontend hay lưu vào client storage. Nếu không cấu hình PostgreSQL, AI Scanner và SafeBot vẫn chạy 100% bình thường.

---

## 7. Cách kiểm tra hoạt động (Kiểm thử)

1. **Trang chủ:** Kiểm tra hiển thị tiêu đề đề tài, 4 trụ cột giải pháp, quy trình 4 bước (Dừng lại → Kiểm chứng → Bảo vệ → Báo cáo).
2. **AI Scanner:** 
   - Thử tải lên một ảnh từ máy hoặc bấm vào các nút mẫu thử nghiệm: *Mẫu A (Chân dung Face Swap)*, *Mẫu B (Tin giả tạo sinh)*, *Mẫu C (Ảnh chân thực)*.
   - Quan sát quá trình nén ảnh tự động (hiển thị dung lượng gốc vs sau nén).
   - Nhấn "Tiến hành phân tích tệp" để theo dõi thanh tiến trình 5 bước và thời gian chạy.
   - Thử nghiệm các tính năng của thanh công cụ: Sao chép báo cáo, Xuất JSON, Xuất CSV, In báo cáo; thử đóng/mở các mục accordion.
3. **Evidence Lab:** Chọn loại nội dung (ảnh, video, giọng nói, tin lan truyền, nick mạo danh) và đánh dấu checklist để nhận chỉ dẫn hành động.
4. **Safety Simulator:** Lần lượt trải nghiệm 7 tình huống thực tế và đọc phản hồi giáo dục.
5. **SafeBot AI:** Nhập câu hỏi tình huống hoặc chọn các câu hỏi gợi ý nhanh để nhận tư vấn.
6. **Research Dashboard:** Thử làm phiếu khảo sát và xuất CSV. Dataset N=320 có sẵn trong source là dữ liệu minh họa để trình diễn giao diện, không được trích dẫn như kết quả nghiên cứu thật.
7. **Bộ sàng lọc tin nhắn đáng ngờ:** Chọn một mẫu thử hoặc dán tin nhắn, bấm phân tích, đọc các nhóm tín hiệu/khuyến nghị, rồi thử sao chép hoặc tải hồ sơ TXT. Dùng nút Xóa nội dung để làm sạch văn bản đang mở.

---

## 8. Những tính năng chưa được triển khai & Giới hạn khoa học

Theo đúng quy tắc trung thực khoa học:
1. **Phân tích âm thanh tự động thời gian thực (Real-time Audio Waveform Forensics):** Chưa có bộ phân tích phổ tần số âm thanh chuyên sâu trong source hiện tại.
2. **Không đảm bảo chính xác 100%:** Các mô hình trí tuệ nhân tạo hoạt động dựa trên nhận dạng mẫu pixel và đặc trưng văn bản. Bộ sàng lọc tin nhắn là bộ quy tắc từ khóa/ngôn ngữ, không phải mô hình xác suất hoặc kết luận AI; kết quả "Chưa phát hiện dấu hiệu bất thường" KHÔNG đồng nghĩa chắc chắn 100% nội dung là thật.
3. **Tác động từ thuật toán nén mạng xã hội:** Ảnh hoặc video bị nén nhiều lần khi gửi qua mạng xã hội (như Zalo, Facebook Messenger, TikTok) có thể làm mờ các chi tiết vi mô, gây khó khăn cho việc phân tích.
4. **Đường dẫn Báo cáo cũ:** Mục điều hướng Báo cáo riêng đã được gỡ khỏi menu; các đường dẫn cũ `/app/reports`, `/reports` và `/report` được chuyển về trang tổng quan ứng dụng.
5. **Vai trò con người là quyết định:** Mọi kết quả phân tích kỹ thuật số chỉ đóng vai trò tham khảo. Kỹ năng xác minh qua kênh độc lập (gọi điện thoại trực tiếp qua mạng di động, kiểm tra báo chí chính thống) vẫn là chốt chặn quan trọng nhất.

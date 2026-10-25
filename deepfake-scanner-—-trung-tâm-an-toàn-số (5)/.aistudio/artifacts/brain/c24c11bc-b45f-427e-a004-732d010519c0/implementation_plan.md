# Kế hoạch tối ưu hóa tốc độ xử lý AI (Deepfake & Social Threat Scanner)

Tài liệu này mô tả chi tiết phương án nâng cấp hiệu năng và giảm độ trễ phản hồi của hệ thống giám định AI theo các lựa chọn đã được người dùng xác nhận.

---

## 1. Mục tiêu & Các chỉ số cải thiện

- **Thời gian phản hồi AI (Latency):** Giảm từ 8-15 giây xuống còn **1.5 - 3.5 giây** cho các yêu cầu quét ảnh và văn bản.
- **Kích thước tải dữ liệu (Payload Size):** Tự động nén ảnh từ 5MB - 20MB xuống dưới **300KB** trước khi gửi lên API, giảm 85-95% thời gian truyền tải mạng.
- **Trải nghiệm người dùng (UX):** Thanh tiến trình 5 giai đoạn trực quan kèm nhãn mô tả giúp người dùng theo dõi chính xác từng bước giám định.
- **Tính toàn vẹn chức năng:** Giữ nguyên 100% cấu trúc phân tầng 6 nhóm rủi ro, đối chiếu 10 kịch bản lừa đảo và cơ chế phòng vệ an toàn cho học sinh THCS.

---

## 2. Chi tiết các hạng mục triển khai

### Hạng mục 1: Tối ưu hóa mô hình AI tại Backend (`server.ts`)
- **Đổi mô hình mặc định sang `gemini-3.1-flash-lite`:**
  - Mô hình Flash-Lite thế hệ mới được tối ưu hóa cho thông lượng cao và thời gian phản hồi token đầu tiên (TTFT) cực nhanh.
  - Cấu hình `thinkingConfig: { thinkingBudget: 0 }` (tắt chuỗi suy nghĩ dài không cần thiết đối với cấu trúc JSON định sẵn) để loại bỏ độ trễ do reasoning rườm rà.
  - Cập nhật cả 2 endpoint trọng yếu: `/api/scan` (giám định đa tầng) và `/api/chat` (trợ lý an toàn số).
- **Tinh gọn Prompt Hệ thống:**
  - Lược bỏ các đoạn diễn giải lặp lại, tập trung vào cấu trúc định dạng chuẩn mực và 10 kịch bản chiêu trò trọng tâm.
  - Giảm số lượng token đầu vào (prompt tokens) giúp AI bắt đầu sinh kết quả ngay lập tức.

### Hạng mục 2: Tự động nén và tối ưu hóa ảnh phía Client (`src/utils/imageCompressor.ts`)
- Xây dựng tiện ích nén ảnh phía trình duyệt bằng HTML5 Canvas:
  - Tự động điều chỉnh kích thước ảnh tối đa (Max width/height: 1280px) – vừa đủ để nhận diện mắt, tai, viền tóc, răng, ánh sáng và chi tiết deepfake mà không làm nặng tải.
  - Chuyển đổi định dạng sang `image/webp` hoặc `image/jpeg` chất lượng cao (0.82) với dung lượng chỉ từ 100KB – 250KB.
  - Hỗ trợ hiển thị kích thước trước và sau khi tối ưu để người dùng nắm rõ.

### Hạng mục 3: Thanh tiến trình phân tích trực quan 5 bước (`src/components/ScannerModule.tsx`)
- Thay thế vòng xoay tĩnh bằng Stepper trực quan 5 giai đoạn:
  1. **Bước 1:** Nén và tối ưu dung lượng ảnh (Client-side Acceleration)
  2. **Bước 2:** Trích xuất dấu vết thị giác & bối cảnh truyền thông
  3. **Bước 3:** Đối chiếu 10 kịch bản chiêu trò mạng xã hội với Gemini Flash-Lite
  4. **Bước 4:** Phân loại 6 nhóm rủi ro & tổng hợp chỉ dẫn an toàn 4 bước
  5. **Bước 5:** Xuất báo cáo giám định chi tiết
- Thanh tiến trình phần trăm (%) chuyển động mượt mà cùng hiệu ứng nhấp nháy công nghệ cao.

### Hạng mục 4: Kiểm thử và xác thực hệ thống
- Chạy `compile_applet` kiểm tra cú pháp TypeScript và Tailwind CSS.
- Kiểm tra tính ổn định của các kịch bản mẫu thử (A1, A2, B1, C1).
- Xác nhận các nhóm rủi ro (giả mạo, bẫy chuyển tiền, trộm OTP, bắt nạt trực tuyến) tiếp tục trả về đầy đủ.

---

## 3. Lộ trình thực hiện

1. Tạo file tiện ích nén ảnh `src/utils/imageCompressor.ts`.
2. Cập nhật `server.ts` sang mô hình `gemini-3.1-flash-lite` và cấu hình giảm độ trễ.
3. Nâng cấp `ScannerModule.tsx` với quy trình nén ảnh tự động và thanh tiến trình 5 bước.
4. Kiểm thử biên dịch và xác minh kết quả.

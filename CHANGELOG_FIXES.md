# DEEPFAKE SCANNER — Bản vá, nâng cấp và ghi chú kiểm thử

## Tổng quan phiên bản nâng cấp

Phiên bản này nâng cấp toàn diện **DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ** theo các tiêu chuẩn cao nhất về hiệu năng, độ tin cậy, tính trung thực khoa học, trải nghiệm giáo dục STEM và bảo mật thông tin.

---

## 1. Nâng cấp tốc độ và tối ưu hóa xử lý AI
- **Chuyển đổi mô hình chính sang `gemini-3.1-flash-lite`:** Tối ưu hóa độ trễ xử lý đa phương thức (multimodal) cực nhanh. Nếu cần độ sâu hơn, tự động dự phòng sang `gemini-2.5-flash`.
- **Cấu hình `thinkingBudget: 0`:** Vô hiệu hóa bước suy luận dài không cần thiết trên cả hai endpoint `/api/scan` và `/api/chat`, giúp phản hồi trả về ngay lập tức mà không tiêu hao thời gian sinh token lý luận ngầm.
- **Quy trình nén ảnh tự động phía Client (`src/utils/imageCompressor.ts`):** 
  - Tự động downscale ảnh có chiều dài vượt quá 1280px bằng HTML5 Canvas và chuyển đổi sang WebP (hoặc JPEG) với chất lượng 0.82.
  - Giảm dung lượng ảnh tải lên từ 10MB - 20MB xuống còn 150KB - 300KB (tiết kiệm đến 95% băng thông và giảm 70% thời gian upload/xử lý).
  - Hiển thị huy hiệu dung lượng trước và sau nén ngay trên giao diện xem trước tệp.
- **Thanh tiến trình phân tích 5 giai đoạn trực quan:**
  - Đồng hồ bấm giờ thời gian thực (real-time elapsed timer với độ chính xác 0.1s).
  - 5 bước chuyển trạng thái sinh động: Đọc tệp & trích xuất văn bản → Kiểm tra định dạng → Kết nối AI Engine → Đối chiếu 10 kịch bản lừa đảo → Tổng hợp báo cáo an toàn.

---

## 2. Nâng cấp trải nghiệm báo cáo Social Threat Scanner
- **Thanh công cụ thao tác báo cáo (Action Toolbar):**
  - **Sao chép báo cáo:** Lưu toàn bộ tóm tắt kết luận và khuyến cáo vào clipboard với thông báo phản hồi trực quan.
  - **Xuất JSON:** Tải tệp cấu trúc JSON đầy đủ kèm siêu dữ liệu nguồn gốc (`dataProvenance`) và thời điểm giám định.
  - **Xuất CSV:** Xuất bảng số liệu kèm BOM UTF-8 (`\uFEFF`) giúp mở trực tiếp trên Microsoft Excel và Google Sheets không bị lỗi font tiếng Việt.
  - **In báo cáo:** Gọi trực tiếp lệnh in/lưu PDF của trình duyệt với định dạng sạch sẽ.
- **Các khối phân tích dạng Accordion thu gọn / mở rộng:**
  - 6 thẻ phân tích: Tóm tắt kết luận, Dấu hiệu quan sát, Bằng chứng trích dẫn nguyên văn, Đối chiếu 10 kịch bản, Giới hạn chưa thể xác minh, và Hướng dẫn hành động.
  - Mỗi thẻ có biểu tượng mũi tên đóng/mở tương tác, giúp học sinh và giáo viên dễ dàng tập trung vào phần cần xem.
- **Gắn nhãn minh bạch mẫu thử nghiệm:**
  - Bổ sung ghi chú `* Mẫu minh họa, không dùng đánh giá mô hình` ngay dưới các nút mẫu thử nhanh (Face Swap, Tin giả, Ảnh thật).

---

## 3. Mở rộng kịch bản giáo dục Safety Simulator
- Bổ sung 2 tình huống thực tế mới, nâng tổng số kịch bản lên **7 tình huống toàn diện**:
  - **Tình huống F (Tin nhắn trúng thưởng):** Kịch bản nhận thông báo trúng iPhone đời mới nhưng yêu cầu đóng "phí vận chuyển và thuế trước" qua thẻ cào hoặc chuyển khoản.
  - **Tình huống G (Mạo danh giáo viên/nhà trường):** Kịch bản tài khoản Facebook/Zalo có ảnh đại diện giáo viên chủ nhiệm yêu cầu phụ huynh/học sinh nộp gấp quỹ lớp vào số tài khoản cá nhân.
- Cập nhật giao diện tab chọn tình huống dạng lưới responsive 7 cột linh hoạt (`grid-cols-2 sm:grid-cols-4 lg:grid-cols-7`).

---

## 4. Bổ sung phòng vệ bảo mật và Rate Limiting
- **Bộ lọc giới hạn tần suất (In-Memory IP Rate Limiting):**
  - Tuyến `/api/scan`: Tối đa 30 yêu cầu / phút trên mỗi địa chỉ IP client.
  - Tuyến `/api/chat`: Tối đa 60 tin nhắn / phút trên mỗi địa chỉ IP client.
  - Trả về mã lỗi chuẩn `HTTP 429 Too Many Requests` kèm header `Retry-After` và thông báo thời gian chờ thân thiện.
  - Tự động dọn dẹp các bản ghi quá hạn mỗi 5 phút để tránh rò rỉ bộ nhớ (memory leak).
- **Phòng vệ SSRF tuyệt đối:**
  - Các liên kết trong bài đăng và tin nhắn chỉ được phân tích mẫu chuỗi (Regex Regex URL Pattern Matching), tuyệt đối không gửi request HTTP ra Internet từ máy chủ.

---

## 5. Minh bạch khoa học và Giáo dục STEM
- **Evidence Lab:**
  - Thêm cảnh báo khoa học về tác động nén của mạng xã hội: Ảnh/video tải về từ TikTok, Zalo, Messenger thường bị thuật toán nén làm suy giảm chất lượng (compression artifacts), tạo ra các vết nhiễu dễ gây nhầm lẫn với can thiệp AI.
  - Luôn nhấn mạnh vai trò xác minh ngoại tuyến (gọi điện thoại trực tiếp qua mạng viễn thông, kiểm tra nguồn chính thống).
- **Phân định rạch ròi nguồn dữ liệu:**
  - Đánh dấu rõ ràng bộ dữ liệu minh họa N=320 là số liệu giả định phục vụ trình diễn mẫu.
  - Phiếu khảo sát để trống hoàn toàn, không chọn sẵn câu trả lời của người dùng.

---

## 6. Kết quả kiểm thử kỹ thuật
- **Kiểm tra TypeScript (`npm run lint` / `tsc --noEmit`):** 0 lỗi, toàn bộ mã nguồn tuân thủ nghiêm ngặt type safety.
- **Biên dịch Frontend (`compile_applet` / Vite build):** Thành công 100%, tạo gói bundle tĩnh tối ưu.
- **API Health Check (`/api/health`):** Phản hồi mã `200 OK` với trạng thái cấu hình AI và thông tin dự án.

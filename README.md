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
   - **Chế độ C — Message & Scam Scanner:** AI đọc ngữ cảnh và bằng chứng trong tin nhắn/cuộc gọi, tìm cả các tổ hợp thủ thuật và biến thể mới thay vì chỉ dò một danh sách phổ biến.
   - **Tình huống AI cập nhật theo thời gian:** Mỗi chu kỳ tạo 12–15 tình huống từ Google Search grounding, có nhãn mức độ xác thực, ngày cập nhật và liên kết nguồn; máy chủ làm mới mỗi 24 giờ và cho phép yêu cầu cập nhật thủ công có giới hạn.
   - **Tối ưu hóa xử lý:** Tự động nén ảnh phía client, thanh tiến trình 5 bước và điều phối mô hình Gemini / OpenAI / DeepSeek theo thứ tự failover trên máy chủ.
   - **Kết quả phân tích:** Hiển thị bằng chứng, giới hạn xác minh và hành động an toàn; đã gỡ phân hệ Báo cáo riêng và các nút sao chép/xuất/in báo cáo khỏi kết quả Scanner.
   - **Bộ sàng lọc tin nhắn AI:** Phân tích nội dung tùy ý theo ngữ cảnh và đối chiếu với bộ tình huống cập nhật. Người dùng phải xác nhận trước khi nội dung được gửi đến máy chủ và nhà cung cấp AI đang được chọn; khi có lỗi/quá tải, cùng yêu cầu có thể lần lượt chuyển sang nhà cung cấp dự phòng. Không gửi mật khẩu, mã OTP hay thông tin cá nhân.
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
- **Trí tuệ nhân tạo (AI Engine):** Bộ điều phối tuần tự Gemini / OpenAI / DeepSeek; tự chuyển nhà cung cấp khi quá tải, hết quota, timeout hoặc lỗi nhà cung cấp.
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
5. Trong Render → Environment, cấu hình một hoặc nhiều API key: `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`. Để bật failover đủ ba nhà cung cấp, cấu hình cả ba key một lần; có thể chỉ cấu hình hai nhà cung cấp nếu muốn dự phòng ít hơn. Mặc định hệ thống ưu tiên Gemini → OpenAI → DeepSeek.
6. Sau khi deploy, mở `/api/health` trên tên miền của service để kiểm tra backend có phản hồi (phản hồi `status: ok`; tình trạng AI chi tiết chỉ xem được trong khu vực Admin).

---

## 6. Danh sách biến môi trường

Khai báo trong tệp `.env` hoặc cấu hình máy chủ:

| Biến môi trường | Bắt buộc | Mô tả |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Tùy chọn* | Khóa Gemini; có Google Search grounding. |
| `OPENAI_API_KEY` | Tùy chọn* | Khóa OpenAI API (không phải gói ChatGPT); dùng Responses web search cho cập nhật tình huống khi được chọn. |
| `DEEPSEEK_API_KEY` | Tùy chọn* | Khóa DeepSeek; phương án dự phòng văn bản/hình ảnh, không có tìm kiếm web trong luồng hiện tại. |
| `AI_PROVIDER_ORDER` | Không | Thứ tự failover, mặc định `gemini,openai,deepseek`. |
| `AI_PROVIDER_COOLDOWN_MS` | Không | Thời gian tạm bỏ qua provider lỗi 5xx, mặc định 90000 ms. |
| `AI_QUOTA_COOLDOWN_MS` | Không | Thời gian tạm bỏ qua provider trả 429, mặc định 900000 ms. |
| `OPENAI_MODEL` | Không | Model Chat Completions của OpenAI, mặc định `gpt-6.1-terra`. |
| `OPENAI_WEB_SEARCH_MODEL` | Không | Model OpenAI Responses có web search, mặc định `gpt-6.1-terra`. |
| `DEEPSEEK_MODEL` | Không | Model DeepSeek, mặc định `deepseek-flash`. |
| `AI_REQUEST_TIMEOUT_MS` | Không | Timeout cho một lượt gọi provider, mặc định 30000 ms. |
| `PORT` | Không (Mặc định 3000) | Cổng mạng của máy chủ Express. |
| `NODE_ENV` | Không | `development` hoặc `production`. |
| `GEMINI_MODEL` | Không | Model API AI; mặc định `gemini-3.1-flash-lite`. |
| `THREAT_INTELLIGENCE_TIMEOUT_MS` | Không | Thời gian chờ tìm nguồn web/tạo tình huống, mặc định 45000 ms. |
| `DATABASE_URL` | Tùy chọn | Internal Database URL của Render PostgreSQL để kích hoạt hệ thống tài khoản & Admin. |
| `ADMIN_EMAIL` | Tùy chọn | Email của quản trị viên đầu tiên được tự động cấp quyền Admin khi tạo database. |
| `ADMIN_PASSWORD` | Tùy chọn | Mật khẩu quản trị viên ban đầu (ít nhất 12 ký tự). |

*Ghi chú:* Cần cấu hình ít nhất một trong ba API key. Muốn tự chuyển nhà cung cấp thì phải cấu hình key riêng cho từng dịch vụ muốn dùng dự phòng; không có một API key chung cho cả ba. OpenAI API có hệ thống billing riêng với gói ChatGPT. Để tự chuyển nhà cung cấp khi quá tải, hãy nhập key của các nhà cung cấp muốn dự phòng một lần trong Render Environment. Mỗi request chỉ gọi một AI; không chạy ba AI song song. API key chỉ nằm ở server, tuyệt đối không đưa vào frontend hoặc Git. Với DeepSeek là phương án cuối cho cập nhật tình huống, dữ liệu không có nguồn web sẽ được gắn nhãn AI-only/dự báo thay vì tin đã xác minh. PostgreSQL chỉ cần cho tài khoản và tính năng quản trị.

---

## 7. Cách kiểm tra hoạt động (Kiểm thử)

1. **AI Scanner:** tải tệp hoặc nhập nội dung và kiểm tra phần giải thích rủi ro, bằng chứng trích dẫn, giới hạn xác minh và hướng dẫn an toàn. Không có thanh công cụ sao chép/xuất/in báo cáo riêng.
2. **Tình huống AI cập nhật:** mở Bộ sàng lọc tin nhắn hoặc nút tình huống trong Scanner; kiểm tra nhãn nguồn, ngày cập nhật, liên kết nguồn web và nút cập nhật thủ công.
3. **Bộ sàng lọc tin nhắn:** dán nội dung sau khi loại thông tin cá nhân, đánh dấu xác nhận gửi nội dung đến máy chủ và các nhà cung cấp AI có thể được dùng dự phòng, rồi chọn Phân tích bằng AI. Đây là phân tích ngữ cảnh mở, không dò một danh sách từ khóa cố định.
4. **SafeBot AI và Safety Simulator:** thử câu hỏi về giả mạo, thủ thuật nhiều bước và cách phản ứng an toàn.
5. **Research Dashboard:** thử phiếu khảo sát và chức năng xuất dữ liệu khảo sát. Dataset N=320 trong source là dữ liệu minh họa, không được trình bày như kết quả nghiên cứu thật.
6. **Tự động làm mới:** máy chủ tạo 12–15 tình huống từ tìm kiếm web khi khởi động hoặc khi cache hết hạn; bộ đếm 24 giờ quyết định thời điểm tạo mới, còn máy chủ kiểm tra cache mỗi 15 phút để tự làm mới và thử lại nếu lần trước gặp lỗi. Nút cập nhật thủ công dùng chung hạn mức API.

## 8. Những tính năng chưa được triển khai & Giới hạn khoa học

Theo đúng quy tắc trung thực khoa học:
1. **Phân tích âm thanh tự động thời gian thực (Real-time Audio Waveform Forensics):** Chưa có bộ phân tích phổ tần số âm thanh chuyên sâu trong source hiện tại.
2. **Không đảm bảo chính xác 100%:** Các mô hình trí tuệ nhân tạo hoạt động dựa trên nhận dạng mẫu pixel và đặc trưng văn bản. Bộ sàng lọc tin nhắn sử dụng phân tích ngữ cảnh từ AI; điểm cảnh báo không phải xác suất gian lận; kết quả "Chưa phát hiện dấu hiệu bất thường" KHÔNG đồng nghĩa chắc chắn 100% nội dung là thật.
3. **Tác động từ thuật toán nén mạng xã hội:** Ảnh hoặc video bị nén nhiều lần khi gửi qua mạng xã hội (như Zalo, Facebook Messenger, TikTok) có thể làm mờ các chi tiết vi mô, gây khó khăn cho việc phân tích.
4. **Đường dẫn cũ:** Các URL thuộc phân hệ đã gỡ sẽ chuyển về trang tổng quan ứng dụng để không mở ra trang lỗi.
5. **Vai trò con người là quyết định:** Mọi kết quả phân tích kỹ thuật số chỉ đóng vai trò tham khảo. Kỹ năng xác minh qua kênh độc lập (gọi điện thoại trực tiếp qua mạng di động, kiểm tra báo chí chính thống) vẫn là chốt chặn quan trọng nhất.

## Multi-AI failover (Gemini / OpenAI / DeepSeek)

The server uses sequential failover, not parallel multi-model voting. OpenAI API billing is separate from ChatGPT subscriptions; a ChatGPT plan is not an API key. Each request is sent to one provider at a time in the order configured by `AI_PROVIDER_ORDER` (default `gemini,openai,deepseek`). On rate-limit, quota/provider outage, timeout, or provider-specific authentication/billing failure, the server cools down that provider temporarily and tries the next configured provider. Successful providers are preferred again after their cooldown expires.

Configure each provider's key once in Render → Environment:

- `GEMINI_API_KEY` for Gemini (Google Search grounding is available when this provider is selected).
- `OPENAI_API_KEY` for OpenAI (`OPENAI_MODEL`; threat-intelligence refresh uses `OPENAI_WEB_SEARCH_MODEL` and the Responses API web-search tool).
- `DEEPSEEK_API_KEY` for DeepSeek (`DEEPSEEK_MODEL`). DeepSeek is the final fallback in the default order. Its current integration does not perform web search, so scenario generation through DeepSeek is marked AI-only / proactive and is never presented as web-verified.

At least one key is required. To enable automatic fallback among all three, configure all three keys once. Never put provider keys in frontend code or commit real secrets to Git. Model IDs can be changed independently via environment variables without changing API keys.

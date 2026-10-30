# Thiết lập Multi-AI Failover cho Deepfake Scanner

## Cách hoạt động

- Hệ thống **không gọi Gemini, OpenAI và DeepSeek cùng lúc**.
- Mỗi yêu cầu bắt đầu với nhà cung cấp đầu tiên trong `AI_PROVIDER_ORDER` đang có API key hợp lệ và không ở thời gian tạm nghỉ (cooldown).
- Khi một nhà cung cấp trả lỗi API, hết quota (`429`), quá tải (`5xx`), lỗi xác thực/thanh toán, timeout hoặc trả JSON không hợp lệ, máy chủ tạm bỏ qua nhà cung cấp đó và thử nhà cung cấp tiếp theo.
- Khi hết cooldown, nhà cung cấp đứng trước được ưu tiên lại tự động.
- Nếu tất cả nhà cung cấp đang cooldown, máy chủ trả `503` và thời gian chờ dự kiến; không liên tục gọi lại các API đang lỗi.
- API key chỉ được lưu ở server/Render Environment. Không đưa key vào React, trình duyệt hoặc Git.

## Biến môi trường trên Render

Mở Render → dịch vụ `deepfake-scanner-safety-center` → Environment. Thêm các key riêng cho nhà cung cấp muốn sử dụng:

| Key | Giá trị |
|---|---|
| `GEMINI_API_KEY` | API key được tạo trong Google AI Studio |
| `OPENAI_API_KEY` | API key của OpenAI API Platform |
| `DEEPSEEK_API_KEY` | API key của DeepSeek Platform |
| `AI_PROVIDER_ORDER` | `gemini,openai,deepseek` |

Mỗi nhà cung cấp có API key riêng. Không có một key chung để dùng cả ba. Cấu hình key một lần trên Render; sau đó không cần thay key mỗi khi hệ thống chuyển AI. Nếu chỉ cấu hình hai key, hệ thống chỉ failover giữa hai nhà cung cấp đó.

**Lưu ý về OpenAI:** OpenAI API Platform có billing riêng với gói ChatGPT. Đăng ký ChatGPT Plus/Pro không tự cấp API key hoặc tự thanh toán các yêu cầu API. Xem hướng dẫn billing chính thức: https://help.openai.com/en/articles/9039756-managing-billing-for-chatgpt-and-the-api-platform

## Model mặc định và thứ tự

| Biến | Mặc định | Công dụng |
|---|---|---|
| `GEMINI_MODEL` | `gemini-3.1-flash-lite` | Gemini cho phân tích thường và Google Search grounding |
| `OPENAI_MODEL` | `gpt-6.1-terra` | OpenAI cho phân tích thường |
| `OPENAI_WEB_SEARCH_MODEL` | `gpt-6.1-terra` | OpenAI Responses API với web search khi cập nhật tình huống |
| `DEEPSEEK_MODEL` | `deepseek-flash` | DeepSeek làm phương án dự phòng văn bản/ảnh |
| `AI_PROVIDER_ORDER` | `gemini,openai,deepseek` | Thứ tự ưu tiên và dự phòng |

Nếu Gemini trả `429`, hệ thống tạm nghỉ Gemini rồi thử OpenAI; nếu OpenAI cũng lỗi, hệ thống thử DeepSeek. Các yêu cầu tiếp theo cũng áp dụng cùng cơ chế, không cần đổi `GEMINI_API_KEY` thành key khác.

## Cooldown và timeout

| Biến | Mặc định | Ý nghĩa |
|---|---:|---|
| `AI_PROVIDER_COOLDOWN_MS` | `90000` | Tạm bỏ qua provider khi gặp lỗi máy chủ/quá tải, khoảng 90 giây |
| `AI_QUOTA_COOLDOWN_MS` | `900000` | Tạm bỏ qua provider khi gặp `429`, khoảng 15 phút |
| `AI_REQUEST_TIMEOUT_MS` | `30000` | Timeout cho mỗi lần gọi provider thường, 30 giây |
| `THREAT_INTELLIGENCE_TIMEOUT_MS` | `45000` | Timeout cho cập nhật tình huống có tìm kiếm web |

Cooldown hiện được lưu trong bộ nhớ của tiến trình Node.js. Khi Render khởi động lại, lịch sử cooldown trong tiến trình được làm mới; API vẫn được thử lại và cơ chế failover tiếp tục hoạt động.

## Khác biệt của cập nhật tình huống có nguồn web

- Gemini sử dụng Google Search grounding.
- OpenAI sử dụng Responses API với công cụ `web_search`.
- DeepSeek trong tích hợp này không thực hiện tìm kiếm web. Nếu hệ thống phải chuyển đến DeepSeek, tình huống sẽ được gắn `AI-only / dự báo`, không trình bày như sự kiện đã được nguồn web xác minh.

## Áp dụng patch vào repository

Giải nén patch ZIP vào thư mục gốc của repository, cho phép ghi đè đúng các file trong ZIP. Sau đó chạy:

```bash
npm run build
```

Nếu build thành công:

```bash
git status --short
git diff --check
git add server.ts .env.example README.md src/types/index.ts src/components/AccountModule.tsx src/components/ScannerModule.tsx src/components/MessageRiskCheck.tsx src/components/SystemStatusPanel.tsx MULTI_AI_FAILOVER_SETUP_VI.md
git --no-pager diff --cached --stat
git commit -m "Add sequential multi-AI failover"
git push
```

Sau đó đưa commit vào nhánh mà Render theo dõi (hiện là `main`) thông qua Pull Request, rồi kiểm tra Render → Events/Deploys.

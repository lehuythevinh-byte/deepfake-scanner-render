# Thiết lập Multi-AI Failover cho Deepfake Scanner

## Cách hoạt động

- Máy chủ không gọi Gemini, OpenAI, DeepSeek và OpenRouter cùng lúc.
- `AI_PROVIDER_ORDER` là allowlist: chỉ provider được liệt kê và có key hợp lệ mới được phép chạy.
- Khi provider lỗi, máy chủ chuyển sang provider tiếp theo trong allowlist.
- Lỗi 429 kích hoạt cooldown quota; lỗi 401/402/403 kích hoạt cooldown xác thực/thanh toán dài hơn.
- Nếu tất cả provider trong allowlist đang cooldown, máy chủ trả 503 kèm thời gian chờ ước tính thay vì liên tục gọi API đang lỗi.
- API key chỉ được lưu trên server/Render Environment; không đưa key vào React, trình duyệt hoặc Git.

## Cấu hình Render hiện tại

| Biến | Giá trị |
|---|---|
| `AI_PROVIDER_ORDER` | `gemini` |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.1-flash-lite` |
| `GEMINI_SEARCH_GROUNDING_ENABLED` | `false` |
| `AI_QUOTA_COOLDOWN_MS` | `900000` |
| `AI_AUTH_BILLING_COOLDOWN_MS` | `86400000` |

OpenAI và DeepSeek chưa nằm trong allowlist hiện tại vì các key/tài khoản đã trả 401/402. Có thể giữ các key ở Render nhưng backend sẽ không gọi chúng cho đến khi được thêm vào `AI_PROVIDER_ORDER`. Chỉ bật provider sau khi đã kiểm tra key, quyền API và trạng thái thanh toán.

## Bật provider dự phòng sau này

Ví dụ, sau khi xác minh OpenAI hoạt động, đổi allowlist thành:

```env
AI_PROVIDER_ORDER=gemini,openai
```

Sau khi xác minh DeepSeek:

```env
AI_PROVIDER_ORDER=gemini,openai,deepseek
```

Tên provider hợp lệ: `gemini`, `openrouter`, `openai`, `deepseek`.

## Giới hạn về nguồn web

- Google Search grounding chỉ được bật khi đặt `GEMINI_SEARCH_GROUNDING_ENABLED=true`.
- Mặc định grounding tắt vì quota Search có thể tách biệt với quota sinh văn bản/ảnh.
- Khi không có tìm kiếm web hoặc không thu được nguồn, các tình huống an toàn phải được gắn `proactive_scenario` và mô tả là giả định phòng ngừa chưa xác minh; không được trình bày như tin mới đã kiểm chứng.

## Lưu ý

Cooldown được lưu trong bộ nhớ tiến trình Node.js. Khi Render khởi động lại, bộ nhớ cooldown được làm mới; API có thể được thử lại theo chính sách mới. Code có thể giảm request thừa nhưng không thể cấp quota, sửa API key hoặc nạp số dư cho nhà cung cấp.

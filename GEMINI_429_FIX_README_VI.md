# Sửa lỗi Gemini 429 – Deepfake Scanner

## Cập nhật V2

- Model chính: `gemini-3.5-flash-lite`.
- Model dự phòng: `gemini-3.1-flash-lite`.
- Chỉ thử model dự phòng đã cấu hình sau lỗi 404 (model không khả dụng) hoặc 429 (rate/quota).
- Không lặp qua danh sách model không được cấu hình.
- Log quota có cấu trúc: HTTP status, reason, quotaMetric, quotaId và retryDelayMs nếu Google trả về.
- Log không ghi API key, prompt, nội dung ảnh hoặc raw response.
- `AI_PROVIDER_ORDER` là allowlist thật. Cấu hình Render hiện chỉ cho phép Gemini để không gọi lại OpenAI 401 hoặc DeepSeek 402 chưa được khắc phục.
- Lỗi 429 kích hoạt cooldown 15 phút theo cấu hình Render; 401/402/403 kích hoạt cooldown tối đa 24 giờ. Khi chỉ còn một provider, cooldown vẫn được tôn trọng, không gửi lặp API liên tục.
- `GEMINI_SEARCH_GROUNDING_ENABLED=false` mặc định. Khi không có tìm kiếm web đang hoạt động, AI phải ghi rõ tình huống là `proactive_scenario`, giả định phòng ngừa chưa được xác minh.

## Render Environment

```env
AI_PROVIDER_ORDER=gemini
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
GEMINI_SEARCH_GROUNDING_ENABLED=false
AI_QUOTA_COOLDOWN_MS=900000
AI_AUTH_BILLING_COOLDOWN_MS=86400000
AI_REQUEST_TIMEOUT_MS=30000
```

Giữ `GEMINI_API_KEY` trong Render Environment; tuyệt đối không commit API key lên GitHub. Không cần đổi API key nếu chưa xác định đúng nguyên nhân lỗi.

## Kiểm tra sau deploy

1. Dùng một yêu cầu văn bản ngắn và một ảnh thử nghiệm.
2. Kiểm tra log `[Gemini] model attempt failed` để xem status, quotaMetric, quotaId và retryDelayMs (các trường có thể null nếu Google không trả chi tiết).
3. Khi thành công, kiểm tra log `[AI] request succeeded` để xác nhận provider và model thực tế.
4. Nếu Gemini vẫn trả 429 ở cả hai model, đối chiếu đúng Google AI Studio Project của API key, usage tier, quota, billing/spend cap và Search grounding. Mã nguồn không thể tự tăng quota.

## Giới hạn

Bản vá giảm request thừa và cải thiện chẩn đoán; không thể cấp quota, sửa billing của Google, hay bảo đảm API luôn khả dụng. Khi toàn bộ provider được cho phép đều lỗi, giao diện phải tiếp tục báo rõ heuristic fallback; heuristic không phải phân tích pixel ảnh bằng AI.

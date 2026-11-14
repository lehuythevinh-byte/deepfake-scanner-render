# Deepfake Scanner – Bản sửa điều phối AI 429/401/402 (14/11/2026)

## Nội dung V2

1. Dùng Gemini 3.5 Flash-Lite làm model chính và Gemini 3.1 Flash-Lite làm model dự phòng đã cấu hình.
2. Chỉ thử model dự phòng sau lỗi 404 hoặc 429; không gọi hàng loạt model không được cấu hình.
3. Đặt `AI_PROVIDER_ORDER` thành allowlist thực sự. Cấu hình Render hiện chỉ cho phép Gemini, tránh gọi các provider đang lỗi OpenAI 401 và DeepSeek 402.
4. Bổ sung chẩn đoán quota có allowlist: reason, quotaMetric, quotaId, retryDelayMs. Không log API key, prompt, nội dung ảnh hoặc raw provider response.
5. Tắt Google Search grounding mặc định; khi không có nguồn web đang hoạt động, threat scenarios phải được ghi rõ là giả định phòng ngừa chưa xác minh.
6. Áp dụng cooldown 15 phút cho 429 và tối đa 24 giờ cho 401/402/403; khi chỉ có một provider cũng tôn trọng cooldown.
7. Bổ sung thông tin provider cooldown, danh sách model Gemini và trạng thái Search grounding vào endpoint admin-only `/api/admin/system-status`.

## Biến Render khuyến nghị

```env
AI_PROVIDER_ORDER=gemini
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
GEMINI_SEARCH_GROUNDING_ENABLED=false
AI_QUOTA_COOLDOWN_MS=900000
AI_AUTH_BILLING_COOLDOWN_MS=86400000
AI_REQUEST_TIMEOUT_MS=30000
```

Không thay đổi `GEMINI_API_KEY` ở đây và không lưu bất kỳ secret nào trong repository.

## Kiểm tra

- GitHub Actions: TypeScript check và Production build.
- Render: deploy và endpoint `/api/health`.
- Thử nghiệm API thật phải được xác nhận riêng bằng log `[AI] request succeeded` hoặc phản hồi kết quả AI mới. Health check 200 chỉ xác nhận máy chủ sống, không chứng minh Gemini đã phân tích thành công.

## Giới hạn

Bản vá không thể tăng quota hoặc sửa project/billing ở Google, cũng không sửa key/số dư của provider khác. Nếu Gemini vẫn trả 429 ở cả model chính và dự phòng, cần kiểm tra Project ID, tier, quota, spend cap và trạng thái billing trên AI Studio. Nếu Google không cung cấp quotaMetric/RetryInfo, log sẽ ghi null; không được đoán loại quota đã vượt.

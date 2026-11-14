# Bản vá Gemini 429 – Deepfake Scanner

Bản vá cấu hình Gemini theo thứ tự:
- Model chính: \`gemini-3.5-flash-lite\`
- Model dự phòng: \`gemini-3.1-flash-lite\`

Backend chỉ chuyển sang model dự phòng khi model chính trả về lỗi model không khả dụng (404) hoặc quota/rate limit (429). Các lỗi khác sẽ chuyển sang cơ chế failover nhà cung cấp AI hiện có, thay vì thử hàng loạt model không liên quan.

## Render Environment

Đặt các biến sau trong Render:
\`\`\`env
GEMINI_MODEL=gemini-3.5-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
AI_QUOTA_COOLDOWN_MS=300000
AI_PROVIDER_COOLDOWN_MS=60000
\`\`\`

Giữ \`GEMINI_API_KEY\` trong Render Environment; tuyệt đối không commit API key vào GitHub.

## Chẩn đoán

Log \`[AI] Gemini model request failed\` chỉ ghi các trường chẩn đoán được cho phép: HTTP status, trạng thái/mã lỗi từ provider, quota metric, quota ID, service, method, consumer và retry delay. Log không ghi API key, prompt, nội dung người dùng hay dữ liệu ảnh.

Log \`[AI] request succeeded\` cho biết provider và model thực tế đã trả kết quả. Nếu tất cả provider đều lỗi, giao diện vẫn phải báo rõ chế độ dự phòng heuristic; heuristic không phải kết quả giám định ảnh bằng AI.

## Giới hạn

Bản vá không thể tăng quota của Google hoặc bảo đảm mọi request đều thành công. Nó giới hạn model fallback có chủ đích và giúp log thể hiện nguyên nhân 429 cụ thể để kiểm tra project, billing và quota.

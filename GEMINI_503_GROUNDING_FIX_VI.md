# Khắc phục Gemini grounding và lỗi 503

## Đọc đúng hai dòng log

- Cảnh báo Gemini web-search grounding unavailable chưa tự động chứng minh model không hỗ trợ Search. Phiên bản cũ của ứng dụng in cảnh báo nếu gặp từ 'tool', 'grounding', hoặc bất kỳ lỗi 429 nào.
- 503 UNAVAILABLE nghĩa là Gemini tạm thời quá tải/không khả dụng. Mã mới đưa Gemini vào cooldown và chuyển sang provider kế tiếp đã cấu hình.

## Thay đổi trong bản sửa

1. Chỉ retry bỏ Google Search khi lỗi 400/403/404/422 nêu rõ Search/grounding tool không được hỗ trợ hoặc lỗi 429 ghi rõ quota riêng của Search.
2. Không coi 429 thông thường, 503, timeout hoặc lỗi mạng là lỗi grounding.
3. Log lỗi grounding ghi model, HTTP status, error code và thông báo đã rút gọn.
4. Render Blueprint mặc định dùng gemini-3.8-flash.

## Áp dụng trên Render

Vào Render > service deepfake-scanner-safety-center > Environment, đặt:

    GEMINI_MODEL=gemini-3.8-flash

Sau đó deploy commit đã merge. Nếu Render Environment có biến thủ công, chỉ sửa render.yaml trên GitHub có thể không ghi đè biến đang có.

## Bảo đảm failover

Cấu hình ít nhất một API key dự phòng nếu muốn tiếp tục xử lý khi Gemini 503. Với yêu cầu có web search, OpenAI web search hoặc nguồn tình báo RSS đã được duyệt có thể đảm nhiệm phần thông tin web; không gắn nhãn kết quả không có nguồn là đã xác minh.

Không đưa API key hoặc DATABASE_URL vào GitHub.

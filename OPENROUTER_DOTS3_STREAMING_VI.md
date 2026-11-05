# OpenRouter Dots3 streaming cho Deepfake Scanner V5

## Cấu hình

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_TEXT_MODEL=dots-studio/dots-3-note-preview:free
OPENROUTER_IMAGE_MODEL=dots-studio/dots-3-note-preview:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Không commit `.env` hoặc bất kỳ API key thật nào.

## Định tuyến

V5 dùng API tương thích OpenAI tại `/chat/completions` và khóa nhà cung cấp bằng:

```json
{
  "only": ["atlas-cloud/fp8"],
  "allow_fallbacks": false,
  "data_collection": "deny"
}
```

Định tuyến được áp dụng cho cả chat văn bản và yêu cầu có ảnh. Không bật fallback provider ở OpenRouter vì V5 có cơ chế điều phối nhà cung cấp riêng.

## Streaming

Request gửi `stream: true` và `stream_options.include_usage: true`. Backend đọc Server-Sent Events, nối các delta thành nội dung hoàn chỉnh, lấy usage ở chunk cuối và ghi reasoning token count nếu nhà cung cấp trả về.

Để không phá giao diện/API hiện tại, endpoint nội bộ V5 tiếp tục trả cấu trúc kết quả hoàn chỉnh sau khi stream đóng. Nghĩa là OpenRouter được stream tới backend; giao diện chưa hiển thị từng token trực tiếp.

## Giới hạn

- Dots3-Note Preview (free) nhận văn bản và hình ảnh, nhưng endpoint miễn phí có giới hạn lưu lượng và khả dụng thay đổi.
- OpenRouter hiện hiển thị model này sẽ ngừng cung cấp ngày 31/12/2026. Hãy đặt `OPENROUTER_TEXT_MODEL` và `OPENROUTER_IMAGE_MODEL` thành model khác trước ngày đó.
- `allow_fallbacks: false` cố ý không đổi sang provider khác bên trong OpenRouter. Khi AtlasCloud lỗi, điều phối V5 sẽ xử lý failover ở tầng nhà cung cấp nếu còn provider khác được cấu hình.

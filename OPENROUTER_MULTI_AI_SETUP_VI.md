# OpenRouter trong Deepfake Scanner V5.0.1

## Model mặc định

- Văn bản: `google/gemma-4-31b-it:free`.
- Hình ảnh: `google/gemma-4-31b-it:free`.
- Đây là tuyến dự phòng qua OpenRouter, không phải detector deepfake chuyên dụng.

## Quyền riêng tư và định tuyến

Yêu cầu OpenRouter được gửi với `data_collection: 'deny'` và `allow_fallbacks: true`. OpenRouter chỉ được phép định tuyến tới những nhà cung cấp phù hợp với lựa chọn không thu thập dữ liệu. Không khóa cứng vào một provider riêng lẻ vì việc một endpoint/provider thay đổi có thể làm gián đoạn failover.

Việc đặt `data_collection: 'deny'` không thay thế yêu cầu xin consent, không bảo đảm mọi nhà cung cấp xử lý dữ liệu theo cùng một chính sách pháp lý, và không nên được hiểu là cho phép tải dữ liệu nhạy cảm lên bất kỳ dịch vụ bên ngoài nào. Người dùng vẫn phải được thông báo và đồng ý trước khi gửi media/tin nhắn tới AI bên thứ ba. Không gửi dữ liệu nếu consent chưa được ghi nhận.

## Lưu ý giới hạn

- Biến thể miễn phí có giới hạn tốc độ/quota và có thể tạm thời không khả dụng. Failover sẽ thử nhà cung cấp tiếp theo nếu provider lỗi hoặc hết quota.
- Model đa phương thức có thể mô tả hình ảnh nhưng không phải mô hình forensic được hiệu chuẩn. Không dùng đầu ra của model làm kết luận REAL/FAKE tuyệt đối.
- Với video, ứng dụng chỉ phân tích frame được lấy mẫu; với audio, bản hiện tại chỉ đo tín hiệu cơ bản và chưa có voice-deepfake classifier chuyên dụng.

## Biến môi trường

```dotenv
OPENROUTER_API_KEY=
OPENROUTER_TEXT_MODEL=google/gemma-4-31b-it:free
OPENROUTER_IMAGE_MODEL=google/gemma-4-31b-it:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Không đưa API key vào frontend, repository hoặc log. Thiết lập biến này trong Render Environment.

Nguồn model và modality được cập nhật theo danh mục OpenRouter tại thời điểm phát hành; cần kiểm tra lại model/quota trước khi triển khai production vì model và endpoint miễn phí có thể thay đổi.

## Tài liệu model tham chiếu

- Gemini API models: https://ai.google.dev/gemini-api/docs/models
- OpenRouter Gemma 4 31B: https://openrouter.ai/google/gemma-4-31b-it:free
- OpenRouter privacy/provider routing: https://openrouter.ai/docs/features/provider-routing

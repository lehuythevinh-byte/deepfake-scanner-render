# Deepfake Scanner — bản đầy đủ tính năng, không có mô-đun Báo cáo riêng

## Các khu vực được giữ lại
- Trang giới thiệu/landing page và Dashboard người dùng.
- AI Scanner (ảnh, bài đăng, video frame và nội dung lừa đảo).
- Link Scanner và lịch sử quét.
- Evidence Lab, Học viện, Simulator và SafeBot.
- Trung tâm dữ liệu nghiên cứu/khảo sát (dashboard, biểu đồ và dữ liệu CSV).
- Ứng phó khẩn cấp, tài khoản, đăng nhập/đăng ký và trang quản trị.
- Website Editor, khảo sát chất lượng, phản hồi và trạng thái hệ thống.
- Multi-AI: Gemini, OpenRouter (Cohere cho văn bản, Gemma cho ảnh), OpenAI, DeepSeek và Heuristic dự phòng.

## Đã bỏ
- Mô-đun báo cáo nghiên cứu khoa học độc lập và đường dẫn riêng của mô-đun đó.
- Nút in báo cáo tóm tắt trong Research Dashboard.
- Thanh sao chép/xuất/in báo cáo khỏi kết quả Scanner.

Lưu ý: nội dung hướng dẫn trẻ em tìm sự trợ giúp từ phụ huynh, thầy cô, nền tảng và tổng đài 111 vẫn được giữ lại; đây là hướng dẫn an toàn, không phải công cụ tạo báo cáo.

## Chạy local
1. Sao chép `.env.example` thành `.env` và cấu hình API key.
2. `npm install --include=dev --no-audit --no-fund`
3. `npm run lint`
4. `npm run build`
5. `npm run dev`
6. Mở `http://localhost:3000`.

Nếu cổng 3000 hoặc WebSocket HMR 24678 đang bận, chạy `PORT=3001 DISABLE_HMR=true npm run dev` rồi mở `http://localhost:3001`.

Không đưa file `.env` hoặc API key vào ZIP. Nếu dùng chung Supabase với Render, local sẽ truy cập cùng cơ sở dữ liệu.

# DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ

Bản đầy đủ tính năng website để chạy local/Node.js, đã bỏ mô-đun tạo báo cáo riêng.

## Các tính năng
- Trang giới thiệu, trang hướng dẫn và Dashboard người dùng.
- AI Scanner: phân tích ảnh, bài đăng mạng xã hội, khung hình video và nội dung tin nhắn/lừa đảo.
- Link Scanner: kiểm tra cấu trúc URL và dấu hiệu liên kết đáng ngờ.
- Lịch sử quét, lọc và quản lý các lượt quét của tài khoản.
- Evidence Lab: checklist kiểm chứng độc lập.
- Học viện an toàn số và thư viện kiến thức.
- Safety Simulator: tình huống tương tác luyện kỹ năng.
- SafeBot AI và hướng dẫn ứng phó khẩn cấp.
- Research Dashboard: khảo sát, biểu đồ và xuất dữ liệu CSV; dữ liệu minh họa được gắn nhãn rõ ràng.
- Đăng ký/đăng nhập, tài khoản người dùng, Admin Dashboard, quản lý người dùng và nhật ký kiểm toán.
- Website Editor cho quản trị viên, khảo sát chất lượng, phản hồi kết quả và trạng thái hệ thống.
- AI failover: Gemini → OpenRouter → OpenAI → DeepSeek; Heuristic chỉ là chế độ dự phòng cuối cùng.
- OpenRouter dùng Cohere cho văn bản/SafeBot và Dots3 qua AtlasCloud FP8 cho yêu cầu ảnh, cooldown được tách theo loại yêu cầu.

## Phần đã bỏ
- Mô-đun `ResearchReportModule` và đường dẫn `/app/reports`.
- Nút in báo cáo từ Research Dashboard.
- Thanh sao chép/xuất/in báo cáo độc lập khỏi kết quả Scanner.

Hướng dẫn an toàn khuyến nghị học sinh thông báo nội dung giả mạo/lừa đảo tới nền tảng và tìm người lớn/tổng đài 111 vẫn được giữ lại. Đây là quy trình bảo vệ người dùng, không phải công cụ tạo báo cáo.

## Yêu cầu
- Node.js 20.19+ hoặc 22.12+ (khuyến nghị Node 22 LTS).
- npm tương thích.
- API key của ít nhất một nhà cung cấp AI nếu cần dùng phân tích AI.
- PostgreSQL/Supabase chỉ cần khi bật đăng ký, tài khoản, lịch sử và quản trị lưu trữ.

## Chạy local trên Windows Git Bash
```bash
cp .env.example .env
# Mở .env và nhập API key cần dùng; không chia sẻ file này.
npm install --include=dev --no-audit --no-fund
npm run lint
npm run build
npm run dev
```
Mở `http://localhost:3000`. Nếu cổng 3000 hoặc cổng WebSocket HMR 24678 đang được dùng, chạy `PORT=3001 DISABLE_HMR=true npm run dev` và mở `http://localhost:3001`.

## Môi trường
- `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` là các key tùy chọn.
- `OPENROUTER_TEXT_MODEL=cohere/north-mini-code:free`.
- `OPENROUTER_IMAGE_MODEL=dots-studio/dots-3-note-preview:free`.
- `AI_PROVIDER_ORDER` kiểm soát thứ tự failover.
- `DATABASE_URL` kết nối PostgreSQL. Cẩn thận: nếu dùng lại URL Supabase đang dùng trên Render, local và production sẽ thao tác trên cùng dữ liệu.

## Kiểm tra và triển khai
```bash
npm run lint
npm run build
npm start
```
Trên Render dùng Build Command `npm install --include=dev --no-audit --no-fund && npm run build`, Start Command `npm start`. Cấu hình các biến môi trường trong Render Dashboard, không đưa `.env` lên GitHub.

## Ghi chú quyền riêng tư
Ảnh và nội dung được gửi tới nhà cung cấp AI đã cấu hình để phân tích theo yêu cầu người dùng. Không gửi mật khẩu, OTP hoặc thông tin nhạy cảm. Kiểm tra và thiết lập chính sách dữ liệu trước khi dùng với dữ liệu cá nhân thật.

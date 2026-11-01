# CHANGELOG — Full Features / No Standalone Reports

## Bản đóng gói ngày 31/10/2026
- Khôi phục đầy đủ giao diện nhiều phân hệ từ bản Website Editor v4: Landing Page, Dashboard, Scanner, Link Scanner, History, Evidence Lab, Academy, Simulator, SafeBot, Research Dashboard, Emergency, Account/Admin và Website Editor.
- Ghép backend Multi-AI hiện tại, OpenRouter text/image routing và cooldown riêng cho văn bản/hình ảnh.
- Bổ sung kiểm tra API key OpenRouter và nhãn hiển thị engine OpenRouter trong Scanner.
- Đồng bộ đường dẫn API phản hồi Admin với endpoint backend hiện tại.
- Bỏ Research Report riêng, đường dẫn báo cáo, nút in báo cáo và thanh xuất báo cáo khỏi Scanner.
- Giữ lịch sử quét, CSV dữ liệu khảo sát, phản hồi chất lượng và các chỉ dẫn an toàn tìm sự trợ giúp.
- Nâng `esbuild` lên `^0.28.2` để tương thích peer dependency với Vite 8.

## Trạng thái kiểm tra
- Đã kiểm tra các import nội bộ và ánh xạ ActiveTab/URL route.
- Chưa xác nhận `npm run lint` hoặc `npm run build` trong môi trường đóng gói vì quá trình cài dependencies không hoàn tất trong môi trường này. Chạy hai lệnh đó sau `npm install` trên máy local trước khi triển khai.

- Đổi nhãn bước 4 ở chân trang thành “TÌM SỰ TRỢ GIÚP”; vẫn giữ hướng dẫn an toàn để liên hệ người lớn/tổng đài/nền tảng khi gặp nội dung nguy hại.

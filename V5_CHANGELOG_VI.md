# Deepfake Scanner V5 — Changelog kỹ thuật

## Đã tái cấu trúc trong gói này

- Thay điều hướng ứng dụng bằng ba khu vực chính: Content Analysis, Safety Center, Scan History; tài khoản và quản trị nằm ở khu vực riêng bên phải.
- Giữ các URL bookmark V3/V4 và ánh xạ chúng sang workspace V5 tương ứng.
- Gom Image, Video, Audio và Message Risk Check vào Content Analysis; Link, QR, Digital Origin, AI Forensics, Scam Intelligence và Evidence Vault là công cụ bổ trợ trong cùng workspace.
- Bằng chứng, giới hạn, dấu hiệu và hướng dẫn xác minh được hiển thị trong kết quả Scanner; không còn trang Evidence Lab độc lập trong điều hướng V5.
- Gom SafeBot, Knowledge Base, Threat Intelligence và hướng dẫn ứng phó vào Safety Center.
- Loại khỏi ứng dụng công khai các module Research/STEM dashboard, Evidence Lab độc lập, Safety Simulator, Cyber Safety Quest và dữ liệu khảo sát phục vụ đề tài học sinh không còn dùng. Vẫn giữ cơ chế đánh giá chất lượng sản phẩm do người dùng tự nguyện gửi (trước đây dùng tên API survey) và bảng lưu feedback hiện có. Các bảng/lịch sử Quest cũ được giữ trong PostgreSQL; không xóa người dùng, phiên đăng nhập, lịch sử quét hoặc phản hồi đã lưu.
- Tổng quát hóa nội dung Knowledge Base và hướng dẫn an toàn, vẫn giữ riêng hướng dẫn bảo vệ trẻ em ở nơi có liên quan.
- Bổ sung Threat Intelligence feed snapshot vào PostgreSQL, allowlist nguồn HTTPS, giới hạn kích thước RSS theo luồng đọc, kiểm tra redirect/host/port, deduplicate URL, log lượt cập nhật và khóa scheduler 48 giờ; kiểm tra scheduler theo chu kỳ sáu giờ để giảm độ trễ quanh mốc đến hạn.
- RSS được hiển thị là bản tin nguồn chưa qua xác minh; kịch bản AI được gắn `proactive_scenario`, không phải sự kiện xác thực hoặc detector rule đã duyệt.
- Cập nhật RAG context để Scanner, Message Risk Check và SafeBot có thể tham chiếu snapshot mới nhất; prompt-injection từ nội dung bên ngoài được xem là dữ liệu không đáng tin.
- Thêm migration 006 cho Threat Intelligence, 007 để thay đúng các chuỗi mặc định thương hiệu cũ và 008 cho hàng đợi kiểm chứng, review log, kho knowledge patterns, RLS và nguồn RSS bổ sung; site settings do Admin tùy chỉnh được giữ nguyên.
- Thêm API Admin để phân loại, xác minh/từ chối RSS report; thêm kho knowledge pattern có version, nguồn, false-positive note, defensive actions và review status. Mọi lần duyệt/từ chối/rút pattern được ghi vào audit table riêng. RSS refresh giữ nguyên nội dung của report đã verified để tránh thay đổi bằng chứng sau duyệt.
- RAG chỉ truy xuất report đã `verified` và knowledge pattern `approved`; ghi chú nội bộ của người duyệt không được đưa ra công khai hoặc vào prompt. Video contact-sheet/Image Forensics cũng nhận ngữ cảnh tham khảo đã duyệt và hiển thị liên kết nguồn riêng, không coi nguồn là bằng chứng của tệp. RAG dùng PostgreSQL full-text search theo từ khóa và độ mới, chưa dùng vector embeddings. Dữ liệu nguồn được tách khỏi system prompt và được đánh dấu là dữ liệu, không phải chỉ dẫn.
- Thêm endpoint và giao diện Safety Center để người dùng xem riêng các báo cáo/knowledge đã duyệt, với link nguồn và ngày kiểm chứng.
- Thêm CI GitHub Actions với 23 kiểm tra repository tĩnh (`npm run verify:v5`) và đồng bộ Render environment với thứ tự Gemini → OpenRouter → OpenAI → DeepSeek; cập nhật mặc định Gemini 3.8 Flash và tuyến OpenRouter Gemma 4 31B đa phương thức, giới hạn định tuyến vào provider không thu thập dữ liệu theo tham số OpenRouter.
- Cập nhật metadata, giới thiệu sản phẩm và tài liệu triển khai V5.

## Đã giữ lại

- Supabase/PostgreSQL, xác thực, quyền Admin, dữ liệu lịch sử và kết quả quét.
- API và pipeline phân tích hiện có, nhiều nhà cung cấp AI, SafeBot, Knowledge Base, hướng dẫn khẩn cấp và cơ chế đánh giá trải nghiệm sản phẩm của người dùng.
- Digital Origin, QR Shield, AI Forensics, Evidence Vault, Video/Audio utilities và phần quản trị Threat Intelligence; các công cụ này được đưa vào workspace V5 thay vì làm menu trùng lặp. Cyber Safety Quest và Safety Simulator đã được loại khỏi giao diện/API công khai vì V5 không còn là sản phẩm học tập; bảng lịch sử Quest cũ vẫn được giữ nguyên trong PostgreSQL, không xóa dữ liệu.

## Tài sản công khai đã dọn dẹp

- Đã loại `public/assets/aistudio/` khỏi tài sản được host công khai: thư mục này chứa các ZIP snapshot repository cũ và bản paste kỹ thuật, không được ứng dụng tham chiếu. Giữ các tài liệu V5 cần thiết ở thư mục gốc; không phát hành source ZIP cũ trong thư mục `public/`.
- Giữ nguyên tên route/API survey cũ ở backend để tương thích, nhưng phần hiển thị đổi thành “Đánh giá trải nghiệm”.

## Cần cấu hình / kiểm thử sau khi cài vào môi trường thật

- Chạy `npm ci`, `npm run db:migrate`, `npm run lint`, `npm run build` trên máy có mạng và dependency đầy đủ.
- Cấu hình GitHub repository secrets `DEEPFAKE_SCANNER_BASE_URL` và `THREAT_INTELLIGENCE_CRON_SECRET`; cùng secret phải có ở Render.
- Chạy workflow thủ công lần đầu, sau đó kiểm tra `last_successful_at`, `next_run_at`, số nguồn RSS đọc thành công, số bản tin thu thập và trạng thái AI.
- Xác nhận mọi migration trên staging trước khi đưa cùng database vào production.
- Chạy Functional, Auth/RLS, Admin permission, responsive, upload limits, consent, scanner and scheduler tests.

## Chưa tuyên bố hoàn tất

- Không có benchmark detector deepfake chuyên dụng cho ảnh/video/âm thanh đi kèm gói này; các công cụ hiện tại là sàng lọc và phân tích hỗ trợ.
- RSS ingestion không đồng nghĩa mọi item đã được xác minh. Các item hiển thị rõ trạng thái chưa xác minh; quy tắc phát hiện chỉ thay đổi khi được kiểm thử và Admin phê duyệt.
- Scheduler phụ thuộc GitHub Actions và cấu hình secrets tại repository/Render; chưa thể xác nhận lịch production chạy thật từ môi trường đóng gói.
- Trong phiên tạo gói, `npm ci` không hoàn tất do lỗi/timeout tải dependency; `npm run lint` thiếu type definitions Node/Vite và `npm run build` không tìm thấy Vite, nên chưa thể xác nhận lint/build.

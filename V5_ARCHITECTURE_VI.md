# Deepfake Scanner V5 — Kiến trúc triển khai

## 1. Luồng điều hướng

```text
App Shell
├── Content Analysis (/app/analyze)
│   ├── Image → ScannerModule → /api/scan
│   ├── Video/Audio → DigitalTrustToolsModule → local signal / sampled-frame AI + approved RAG context for sampled frames
│   ├── Message → MessageRiskCheck → /api/threat-intelligence/analyze
│   └── Supporting tools: Link Scanner, QR, Digital Origin, AI Forensics, Scam Intelligence, Evidence Vault
├── Safety Center (/app/safety-center)
│   ├── SafeBot → /api/chat
│   ├── Knowledge Base → curated articles
│   ├── Threat Intelligence → approved advisories + unverified feed snapshots
│   └── Incident Response → emergency guidance
├── Scan History (/app/history)
└── User Account (/account) → Admin controls according to role
```

Các URL V3/V4 cũ được giữ bằng alias trong `src/lib/routes.ts` và được chuẩn hóa bởi `normalizeV5Tab()` trong `src/App.tsx`. `EvidenceLabModule`, Simulator và Quest không còn là trang public độc lập.

## 2. Server và AI boundary

- `server.ts` vẫn là Express API chính và tiếp tục dùng nhiều AI provider như cấu hình hiện có.
- `/api/scan`, `/api/threat-intelligence/analyze` và `/api/chat` yêu cầu `consentExternalAI: true` ở server boundary khi gửi nội dung người dùng tới AI ngoài. Giao diện cũng buộc người dùng bật xác nhận trước khi gửi.
- C2PA có `consentC2PA`; AI scam và AI image forensics có `consentExternalAI`; các phân tích cục bộ như SHA-256/EXIF và audio signal không cần gửi file lên AI.
- Nội dung người dùng và nội dung RSS được xem là dữ liệu không đáng tin, không phải chỉ dẫn có quyền thay đổi hành vi model.
- Schema `ThreatScanResult` dùng `personalSafetyRisks` thay cho trường tên cũ mang nghĩa học đường; khuyến nghị bảo vệ trẻ em chỉ xuất hiện có điều kiện khi ngữ cảnh liên quan.

## 3. Threat Intelligence pipeline

```text
GitHub Actions (check every 6h)
  → POST /api/internal/threat-intelligence/update
  → bearer secret validation
  → PostgreSQL advisory lock + 48h cooldown
  → allowlisted HTTPS RSS sources
  → redirect/host/port/size/time validation
  → deduplicate + classify
  → persist raw RSS reports as unverified
  → Admin evidence review queue
  → approved reports + knowledge patterns
  → RAG context for Scanner / Message Risk / SafeBot
```

- Scheduler không dùng `setInterval` ở trình duyệt.
- Lịch workflow kiểm tra mỗi 6 giờ; PostgreSQL bảo đảm khoảng cách tối thiểu 48 giờ giữa hai lần cập nhật thành công. Lịch thực tế có thể trễ do GitHub Actions.
- `records_published` không tăng theo dữ liệu RSS thô. Bản tin tự động vẫn là “chưa xác minh”; chỉ advisory được Admin duyệt mới là cảnh báo public đã xuất bản.
- Scenario do AI tạo có `proactive_scenario`, chỉ là tình huống phòng ngừa. Không tự thay đổi detector thresholds, model weights hoặc công bố accuracy.

## 4. Database migrations

| Migration | Vai trò |
|---|---|
| 001 | Users, roles, scan history nền tảng |
| 002 | Phản hồi sản phẩm và trạng thái lời mời feedback |
| 003 | Cấu hình website Admin |
| 004 | Phản hồi theo kết quả |
| 005 | Schema V4 Digital Trust (Evidence/metadata và dữ liệu lịch sử Quest) |
| 006 | Threat sources, feed snapshots, update runs, scheduler state, detector versions |
| 007 | Chỉ nâng cấp các chuỗi mặc định V3/V4 trong website config, giữ giá trị Admin tùy chỉnh |
| 008 | Hàng đợi báo cáo RSS chưa xác minh, sự kiện review, knowledge patterns, RLS và nguồn RSS bổ sung |

`runMigrations()` áp dụng migrations 001–008 theo thứ tự và dùng `pg_advisory_xact_lock` để tránh chạy đồng thời. Các migration V5 không drop bảng hoặc bản ghi cũ.

## 5. Phần chưa được chứng minh

- Chưa có bộ benchmark detector deepfake chuyên dụng trong repository; do đó không công bố accuracy/precision/recall.
- Video chỉ lấy mẫu frame; chưa có temporal model đã kiểm định.
- Audio chỉ cung cấp signal triage; chưa có audio deepfake classifier đã hiệu chuẩn.
- AI-generated region annotations là gợi ý quan sát, không phải heatmap khoa học.
- CI build/lint và deploy staging phải được chạy lại trên máy có đầy đủ npm dependencies; gói nguồn không được coi là production-accepted chỉ dựa trên kiểm tra cú pháp.

## 6. Tương thích dữ liệu cục bộ và sản phẩm feedback

- IndexedDB key hiện tại của Evidence Vault được giữ nguyên trong V5 để không làm mất kho bằng chứng mã hóa trên trình duyệt đã dùng V4. Không đổi tên database/key trong đợt tái cấu trúc này.
- Cơ chế đánh giá chất lượng sản phẩm của người dùng vẫn được giữ; đây không phải khảo sát STEM/học sinh. API và schema cũ được duy trì để tương thích dữ liệu, nhãn giao diện đã chuyển thành “Đánh giá trải nghiệm”.
- Các tệp ZIP snapshot mã nguồn cũ trong `public/assets/aistudio/` không được app tham chiếu, đã loại khỏi web assets vì `public/` được phục vụ trực tiếp cho trình duyệt.


## Hardening 5.0.1

- RSS đã xác minh được giữ nguyên nội dung khi collector gặp lại cùng URL; bản cập nhật feed không thể ghi đè nội dung đã duyệt.
- Quyết định duyệt/từ chối/rút knowledge pattern được ghi trong `v5_threat_pattern_review_events`.
- RAG hiện truy xuất lexical PostgreSQL full-text theo truy vấn và độ mới; chưa triển khai embedding/vector search.
- Bài RSS, report và pattern là dữ liệu tham khảo không đáng tin cậy về mặt chỉ dẫn; chúng được tách khỏi system prompt của SafeBot và được đánh dấu rõ là dữ liệu trong các luồng AI khác.
- Thực hiện kiểm tra tĩnh bằng `npm run verify:v5`; sau đó vẫn phải chạy lint/build và staging integration tests.

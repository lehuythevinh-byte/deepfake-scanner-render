

## Tuyến OpenRouter ảnh đã xác minh (01/11/2026)

- SafeBot/văn bản: `cohere/north-mini-code:free`, định tuyến `only: ['cohere']`, `allow_fallbacks: false`, `data_collection: 'deny'`.
- Scanner/ảnh: `dots-studio/dots-3-note-preview:free`, định tuyến `only: ['atlas-cloud/fp8']`, `allow_fallbacks: false`.
- Kiểm thử ảnh giả lập 1x1 pixel trả HTTP 200 với nội dung JSON qua AtlasCloud FP8.
- Tuyến AtlasCloud trong cấu hình kiểm thử không đặt `data_collection: 'deny'`; chỉ dùng ảnh thử nghiệm không nhạy cảm cho đến khi quản trị viên xác minh chính sách dữ liệu của nhà cung cấp.

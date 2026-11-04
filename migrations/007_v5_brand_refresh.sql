-- V5 brand refresh. Update only known V3/V4 default copy; preserve any administrator-edited values.
UPDATE site_settings
SET config = config || jsonb_build_object(
  'brandSubtitle', CASE WHEN config->>'brandSubtitle' = 'DIGITAL SAFETY CENTER' THEN 'DIGITAL TRUST & FORENSICS' ELSE COALESCE(config->>'brandSubtitle', 'DIGITAL TRUST & FORENSICS') END,
  'heroEyebrow', CASE WHEN config->>'heroEyebrow' = 'AI-ASSISTED DIGITAL SAFETY' THEN 'AI-ASSISTED DIGITAL FORENSICS' ELSE COALESCE(config->>'heroEyebrow', 'AI-ASSISTED DIGITAL FORENSICS') END,
  'heroDescription', CASE WHEN config->>'heroDescription' = 'Phát hiện dấu hiệu đáng ngờ trong nội dung số, kiểm tra liên kết và học cách bảo vệ bản thân trước các chiêu trò lừa đảo trực tuyến.' THEN 'Phân tích dấu hiệu giả mạo trong hình ảnh, video, âm thanh và tin nhắn; kiểm tra liên kết, nguồn gốc số và hướng dẫn xác minh. Mỗi kết quả đều nêu phương pháp và giới hạn kiểm tra.' ELSE COALESCE(config->>'heroDescription', '') END,
  'aboutEyebrow', CASE WHEN config->>'aboutEyebrow' = 'MỤC TIÊU' THEN 'NỀN TẢNG' ELSE COALESCE(config->>'aboutEyebrow', 'NỀN TẢNG') END,
  'featuresEyebrow', CASE WHEN config->>'featuresEyebrow' = 'Tính năng cốt lõi' THEN 'CÔNG CỤ CỐT LÕI' ELSE COALESCE(config->>'featuresEyebrow', 'CÔNG CỤ CỐT LÕI') END,
  'featuresTitle', CASE WHEN config->>'featuresTitle' = 'Bộ Công Cụ Phòng Vệ Toàn Diện Cho Học Đường' THEN 'Phân tích nội dung & bảo vệ danh tính số' ELSE COALESCE(config->>'featuresTitle', 'Phân tích nội dung & bảo vệ danh tính số') END,
  'featuresDescription', CASE WHEN config->>'featuresDescription' = 'Kết hợp trí tuệ nhân tạo Gemini đa phương thức và quy tắc an toàn thông tin chuyên sâu.' THEN 'Một workspace thống nhất cho ảnh, video, âm thanh, tin nhắn, đường dẫn và bằng chứng số; hiển thị rõ nguồn, phương pháp và giới hạn.' ELSE COALESCE(config->>'featuresDescription', '') END,
  'introCard3Title', CASE WHEN config->>'introCard3Title' = 'Học an toàn số' THEN 'Hướng dẫn xác minh' ELSE COALESCE(config->>'introCard3Title', 'Hướng dẫn xác minh') END,
  'introCard3Description', CASE WHEN config->>'introCard3Description' = 'Hướng dẫn, tình huống mô phỏng và trợ lý SafeBot.' THEN 'Tham khảo phương pháp kiểm tra, dấu hiệu rủi ro và cách xử lý an toàn.' ELSE COALESCE(config->>'introCard3Description', '') END
)
WHERE id = 1 AND config IS NOT NULL;

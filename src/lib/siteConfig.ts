/**
 * Public, database-backed site customization settings.
 * These fields intentionally contain plain text only; never accept executable HTML.
 */
export interface SiteConfig {
  siteName: string;
  brandSubtitle: string;
  announcementEnabled: boolean;
  announcementText: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccentTitle: string;
  heroDescription: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  introCard1Title: string;
  introCard1Description: string;
  introCard2Title: string;
  introCard2Description: string;
  introCard3Title: string;
  introCard3Description: string;
  featuresEyebrow: string;
  featuresTitle: string;
  featuresDescription: string;
  feature1Title: string;
  feature1Description: string;
  feature1ActionLabel: string;
  feature2Title: string;
  feature2Description: string;
  feature2ActionLabel: string;
  feature3Title: string;
  feature3Description: string;
  feature3ActionLabel: string;
  faqTitle: string;
  faqDescription: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  accentColor: string;
  backgroundColor: string;
  showHero: boolean;
  showAbout: boolean;
  showFeatures: boolean;
  showAiLimitations: boolean;
  showHowItWorks: boolean;
  showSafetyGuide: boolean;
  showPrivacy: boolean;
  showFaq: boolean;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: 'DEEPFAKE SCANNER',
  brandSubtitle: 'DIGITAL TRUST & FORENSICS',
  announcementEnabled: false,
  announcementText: 'Chào mừng bạn đến với Trung tâm An toàn số.',
  heroEyebrow: 'AI-ASSISTED DIGITAL FORENSICS',
  heroTitle: 'Tin tưởng có cơ sở.',
  heroAccentTitle: 'An toàn trong thế giới số.',
  heroDescription: 'Phân tích dấu hiệu giả mạo trong hình ảnh, video, âm thanh và tin nhắn; kiểm tra liên kết, nguồn gốc số và hướng dẫn xác minh. Mỗi kết quả đều nêu phương pháp và giới hạn kiểm tra.',
  primaryCtaLabel: 'Bắt đầu ngay',
  secondaryCtaLabel: 'Khám phá nền tảng',
  aboutEyebrow: 'NỀN TẢNG',
  aboutTitle: 'Giúp bạn dừng lại, kiểm tra và quyết định có cơ sở.',
  aboutDescription: 'DEEPFAKE SCANNER là nền tảng phân tích nội dung và hỗ trợ xác minh danh tính số. Hệ thống kết hợp phép kiểm tra cục bộ, AI có sự đồng ý của người dùng và hướng dẫn đối chiếu độc lập.',
  introCard1Title: 'Phân tích nội dung số',
  introCard1Description: 'Tìm dấu hiệu bất thường trong ảnh và khung hình video.',
  introCard2Title: 'Kiểm tra liên kết',
  introCard2Description: 'Đánh giá cấu trúc đường dẫn và các mẫu lừa đảo thường gặp.',
  introCard3Title: 'Hướng dẫn xác minh',
  introCard3Description: 'Tham khảo phương pháp kiểm tra, dấu hiệu rủi ro và cách xử lý an toàn.',
  featuresEyebrow: 'CÔNG CỤ CỐT LÕI',
  featuresTitle: 'Phân tích nội dung & bảo vệ danh tính số',
  featuresDescription: 'Một workspace thống nhất cho ảnh, video, âm thanh, tin nhắn, đường dẫn và bằng chứng số; hiển thị rõ nguồn, phương pháp và giới hạn.',
  feature1Title: 'Quét Ảnh & Khung Hình Video',
  feature1Description: 'Phân tích các dấu hiệu thị giác có thể quan sát được, thông tin kỹ thuật của tệp và những điểm cần xác minh độc lập.',
  feature1ActionLabel: 'Mở máy quét ảnh →',
  feature2Title: 'Máy Quét Liên Kết & Lừa Đảo',
  feature2Description: 'Phát hiện liên kết giả mạo ngân hàng, mạng xã hội, tên miền đồng hình Punycode, link rút gọn giấu mặt và lộ mã OTP nguy hiểm.',
  feature2ActionLabel: 'Kiểm tra đường link →',
  feature3Title: 'SafeBot — Trợ Lý An Toàn 24/7',
  feature3Description: 'Giải thích dấu hiệu rủi ro, hỗ trợ xử lý sự cố và hướng dẫn xác minh qua kênh liên hệ đáng tin cậy.',
  feature3ActionLabel: 'Trò chuyện cùng SafeBot →',
  faqTitle: 'Câu Hỏi Thường Gặp',
  faqDescription: 'Giải đáp các thắc mắc về bảo mật và cách vận hành',
  faqQ1: 'Hệ thống có lưu trữ ảnh hoặc video tải lên của tôi không?',
  faqA1: 'Tùy công cụ. Các phép kiểm tra cục bộ như SHA-256 chạy trên thiết bị. Những thao tác gửi tệp hoặc văn bản tới AI hay máy chủ bên ngoài phải có thông báo và sự đồng ý riêng. Evidence Vault giữ file gốc trong trình duyệt hiện tại; máy chủ chỉ nhận metadata cần thiết theo chức năng.',
  faqQ2: 'Hệ thống kiểm tra liên kết (Link Scanner) có bị lộ thông tin khi bấm quét không?',
  faqA2: 'Link Scanner kiểm tra cấu trúc URL và các dấu hiệu đáng ngờ mà không tự động mở trang đích. Kết quả sàng lọc không thay thế kiểm tra qua kênh chính thức và không bảo đảm một liên kết là an toàn tuyệt đối.',
  faqQ3: 'Nền tảng có miễn phí để sử dụng không?',
  faqA3: 'Chi phí và giới hạn sử dụng phụ thuộc vào cấu hình triển khai, nhà cung cấp AI và chính sách của đơn vị vận hành. Hãy xem thông tin hiện hành trên trang đăng ký hoặc liên hệ quản trị viên.',
  faqQ4: 'Nếu lỡ gửi tiền hoặc bị kẻ xấu tống tiền bằng ảnh ghép Deepfake thì phải làm gì?',
  faqA4: 'Hãy giữ bình tĩnh, chụp màn hình lưu bằng chứng, không làm theo lời đe dọa và liên hệ nền tảng hoặc cơ quan chức năng phù hợp. Nếu người bị hại là trẻ em, người giám hộ có thể gọi Tổng đài Bảo vệ Trẻ em 111; phản ánh cuộc gọi/tin nhắn rác qua đầu số 156/5656 khi phù hợp.',
  accentColor: '#55DDF2',
  backgroundColor: '#101C32',
  showHero: true,
  showAbout: true,
  showFeatures: true,
  showAiLimitations: true,
  showHowItWorks: true,
  showSafetyGuide: true,
  showPrivacy: true,
  showFaq: true,
};

export const SITE_CONFIG_TEXT_LIMITS: Partial<Record<keyof SiteConfig, number>> = {
  siteName: 60,
  brandSubtitle: 80,
  announcementText: 240,
  heroEyebrow: 80,
  heroTitle: 120,
  heroAccentTitle: 120,
  heroDescription: 600,
  primaryCtaLabel: 40,
  secondaryCtaLabel: 40,
  aboutEyebrow: 80,
  aboutTitle: 180,
  aboutDescription: 900,
  introCard1Title: 100,
  introCard1Description: 240,
  introCard2Title: 100,
  introCard2Description: 240,
  introCard3Title: 100,
  introCard3Description: 240,
  featuresEyebrow: 80,
  featuresTitle: 180,
  featuresDescription: 500,
  feature1Title: 120,
  feature1Description: 600,
  feature1ActionLabel: 50,
  feature2Title: 120,
  feature2Description: 600,
  feature2ActionLabel: 50,
  feature3Title: 120,
  feature3Description: 600,
  feature3ActionLabel: 50,
  faqTitle: 120,
  faqDescription: 300,
  faqQ1: 240,
  faqA1: 900,
  faqQ2: 240,
  faqA2: 900,
  faqQ3: 240,
  faqA3: 900,
  faqQ4: 240,
  faqA4: 900,
};

export const SITE_CONFIG_BOOLEAN_KEYS: (keyof SiteConfig)[] = [
  'announcementEnabled', 'showHero', 'showAbout', 'showFeatures', 'showAiLimitations',
  'showHowItWorks', 'showSafetyGuide', 'showPrivacy', 'showFaq',
];

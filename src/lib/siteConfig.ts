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
  brandSubtitle: 'DIGITAL SAFETY CENTER',
  announcementEnabled: false,
  announcementText: 'Chào mừng bạn đến với Trung tâm An toàn số.',
  heroEyebrow: 'AI-ASSISTED DIGITAL SAFETY',
  heroTitle: 'Tin tưởng có cơ sở.',
  heroAccentTitle: 'An toàn trong thế giới số.',
  heroDescription: 'Phát hiện dấu hiệu đáng ngờ trong nội dung số, kiểm tra liên kết và học cách bảo vệ bản thân trước các chiêu trò lừa đảo trực tuyến.',
  primaryCtaLabel: 'Bắt đầu ngay',
  secondaryCtaLabel: 'Khám phá nền tảng',
  aboutEyebrow: 'MỤC TIÊU',
  aboutTitle: 'Giúp bạn dừng lại, kiểm tra và quyết định có cơ sở.',
  aboutDescription: 'DEEPFAKE SCANNER là trung tâm an toàn số hỗ trợ nhận diện tín hiệu đáng ngờ trong ảnh, video, tin nhắn và liên kết, đồng thời cung cấp kiến thức để người dùng tự bảo vệ mình.',
  introCard1Title: 'Phân tích nội dung số',
  introCard1Description: 'Tìm dấu hiệu bất thường trong ảnh và khung hình video.',
  introCard2Title: 'Kiểm tra liên kết',
  introCard2Description: 'Đánh giá cấu trúc đường dẫn và các mẫu lừa đảo thường gặp.',
  introCard3Title: 'Học an toàn số',
  introCard3Description: 'Hướng dẫn, tình huống mô phỏng và trợ lý SafeBot.',
  featuresEyebrow: 'Tính năng cốt lõi',
  featuresTitle: 'Bộ Công Cụ Phòng Vệ Toàn Diện Cho Học Đường',
  featuresDescription: 'Kết hợp trí tuệ nhân tạo Gemini đa phương thức và quy tắc an toàn thông tin chuyên sâu.',
  feature1Title: 'Quét Ảnh & Khung Hình Video',
  feature1Description: 'Rà soát các bất thường thị giác: đồng tử không đều, biên mặt mờ nhòe, ánh sáng phi lý, văn bản cắt ghép và thủ đoạn mạo danh người thân.',
  feature1ActionLabel: 'Mở máy quét ảnh →',
  feature2Title: 'Máy Quét Liên Kết & Lừa Đảo',
  feature2Description: 'Phát hiện liên kết giả mạo ngân hàng, mạng xã hội, tên miền đồng hình Punycode, link rút gọn giấu mặt và lộ mã OTP nguy hiểm.',
  feature2ActionLabel: 'Kiểm tra đường link →',
  feature3Title: 'SafeBot — Trợ Lý An Toàn 24/7',
  feature3Description: 'Tư vấn tâm lý, hướng dẫn bình tĩnh khi gặp tin nhắn đe dọa, tống tiền bằng ảnh ghép và hướng dẫn liên hệ cha mẹ, thầy cô đúng cách.',
  feature3ActionLabel: 'Trò chuyện cùng SafeBot →',
  faqTitle: 'Câu Hỏi Thường Gặp',
  faqDescription: 'Giải đáp các thắc mắc về bảo mật và cách vận hành',
  faqQ1: 'Hệ thống có lưu trữ ảnh hoặc video tải lên của tôi không?',
  faqA1: 'Tuyệt đối không. Hệ thống tuân thủ chính sách quyền riêng tư nghiêm ngặt: hình ảnh và khung hình video chỉ được nén tạm thời trên bộ nhớ đệm trình duyệt để đối chiếu và không bao giờ được lưu vĩnh viễn trong cơ sở dữ liệu.',
  faqQ2: 'Hệ thống kiểm tra liên kết (Link Scanner) có bị lộ thông tin khi bấm quét không?',
  faqA2: 'Không. Máy quét liên kết hoạt động theo nguyên tắc Zero-SSRF (Server-Side Request Forgery Safe): phân tích cú pháp tĩnh, cấu trúc tên miền, chứng chỉ và các mẫu tấn công đã biết mà không thực thi mã JavaScript độc hại hay gửi cookie người dùng ra ngoài.',
  faqQ3: 'Học sinh THCS và phụ huynh có phải trả phí để sử dụng không?',
  faqA3: 'Không. Toàn bộ nền tảng được phát triển phục vụ đề tài nghiên cứu khoa học an toàn số học đường, hoàn toàn miễn phí, không thu phí và không có quảng cáo thương mại.',
  faqQ4: 'Nếu lỡ gửi tiền hoặc bị kẻ xấu tống tiền bằng ảnh ghép Deepfake thì phải làm gì?',
  faqA4: 'Hãy lập tức giữ bình tĩnh, chụp ảnh màn hình lưu bằng chứng, không làm theo lời đe dọa, chia sẻ ngay với cha mẹ/thầy cô và gọi đến Tổng đài Quốc gia Bảo vệ Trẻ em 111 hoặc đầu số 156/5656.',
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

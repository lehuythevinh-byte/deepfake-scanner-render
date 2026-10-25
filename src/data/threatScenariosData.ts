export interface ThreatScenarioInfo {
  code: string;
  id: string;
  title: string;
  category: 'impersonation' | 'scam' | 'phishing' | 'youth_harm' | 'misinformation';
  description: string;
  typicalSignals: string[];
  recommendedAction: string;
}

export const THREAT_SCENARIOS: ThreatScenarioInfo[] = [
  {
    code: 'SCENARIO_1_CELEB_SCAM',
    id: 'celeb-scam',
    title: '1. Giả danh người nổi tiếng / chuyên gia',
    category: 'impersonation',
    description: 'Sử dụng video ghép mặt, lồng tiếng AI của ca sĩ, streamer, bác sĩ hoặc MC nổi tiếng để quảng cáo khóa học, thuốc tăng chiều cao hoặc kêu gọi đầu tư sinh lời.',
    typicalSignals: [
      'Khẩu hình miệng hơi giật hoặc không khớp từng chữ với giọng nói.',
      'Trang fanpage mới tạo, tên có dấu tích giả hoặc không có lịch sử bài đăng cũ.',
      'Khuyến khích học sinh nạp tiền hoặc liên hệ qua Zalo kín.',
    ],
    recommendedAction: 'Mở trang cá nhân chính thức (có tích xanh thật) của người nổi tiếng để đối chiếu phát ngôn.',
  },
  {
    code: 'SCENARIO_2_VOICE_CLONE_MONEY',
    id: 'voice-clone-money',
    title: '2. Giả giọng người thân yêu cầu chuyển tiền gấp',
    category: 'scam',
    description: 'Sử dụng công nghệ Voice Clone trích xuất từ video công khai của bố mẹ để tạo cuộc gọi hoặc tin nhắn thoại ngắn báo tin tai nạn, viện phí.',
    typicalSignals: [
      'Âm thanh rè, có tạp âm kim loại ở tần số cao.',
      'Yêu cầu chuyển tiền vào số tài khoản ngân hàng của "người thứ ba".',
      'Tạo cảm giác hoảng loạn, cấm tắt máy hoặc cấm gọi cho người khác.',
    ],
    recommendedAction: 'Dừng lại 30 giây. Lập tức bấm số gọi qua SIM di động truyền thống trong danh bạ để nói chuyện trực tiếp.',
  },
  {
    code: 'SCENARIO_3_CLONE_CLASSMATE_TEACHER',
    id: 'clone-classmate',
    title: '3. Tài khoản giả mạo bạn bè hoặc giáo viên',
    category: 'impersonation',
    description: 'Sao chép ảnh đại diện, họ tên và trường lớp của học sinh hoặc thầy cô chủ nhiệm để gửi lời mời kết bạn mới và nhờ việc bất thường.',
    typicalSignals: [
      'Tài khoản mới tạo trong vài ngày, danh sách bạn bè bị ẩn.',
      'Nhắn tin hỏi mượn tiền, mượn tài khoản game hoặc xin tài liệu riêng tư.',
    ],
    recommendedAction: 'Hỏi trực tiếp người bạn đó ngoài đời thực hoặc gọi điện thoại trước khi đồng ý kết bạn hay làm theo lời nhờ.',
  },
  {
    code: 'SCENARIO_4_FAKE_PRIZE_FEE',
    id: 'fake-prize-fee',
    title: '4. Trúng thưởng giả yêu cầu đóng phí vận chuyển',
    category: 'scam',
    description: 'Thông báo em trúng iPhone, xe đạp điện hoặc thẻ quà tặng trong một mini game ngẫu nhiên, nhưng yêu cầu nộp trước 100k - 200k tiền ship/thuế.',
    typicalSignals: [
      'Chưa từng đăng ký dự thi nhưng bỗng nhiên được thông báo trúng giải.',
      'Yêu cầu mua thẻ cào điện thoại hoặc chuyển khoản phí ứng trước.',
    ],
    recommendedAction: 'Không có chương trình khuyến mãi chân chính nào yêu cầu nộp tiền trước để nhận quà. Đây là bẫy lừa đảo 100%.',
  },
  {
    code: 'SCENARIO_5_PHISHING_LOGIN_LINK',
    id: 'phishing-login',
    title: '5. Liên kết giả mạo yêu cầu đăng nhập (Phishing)',
    category: 'phishing',
    description: 'Gửi đường link rút gọn (bit.ly, tinyurl...) hoặc tên miền giả mạo (ví dụ: faceb00k-login.com, vote-stem-online.xyz) dụ nhập mật khẩu.',
    typicalSignals: [
      'Giao diện giống hệt Facebook/Google nhưng đường link ở thanh địa chỉ bị sai chính tả.',
      'Lời hối thúc "Bình chọn ngay trong 5 phút" hoặc "Xem ảnh bí mật của bạn".',
    ],
    recommendedAction: 'Không bao giờ điền mật khẩu hay thông tin tài khoản vào các đường link nhận qua tin nhắn chat.',
  },
  {
    code: 'SCENARIO_6_OTP_THEFT',
    id: 'otp-theft',
    title: '6. Tin nhắn yêu cầu cung cấp mã OTP / SMS',
    category: 'phishing',
    description: 'Kẻ gian viện lý do "gửi nhầm mã xác nhận", "mã bình chọn cuộc thi" để lừa học sinh đọc 6 chữ số gửi về điện thoại.',
    typicalSignals: [
      'Tin nhắn chứa cụm từ "Đọc cho tao 6 số", "Gửi mã vừa nhận qua đây".',
      'Nội dung SMS của hệ thống ghi rõ: "Mã OTP bí mật, không chia sẻ với bất kỳ ai".',
    ],
    recommendedAction: 'Đọc kỹ SMS hệ thống. Mã OTP là chìa khóa duy nhất bảo vệ tài khoản, tuyệt đối không gửi cho bất kỳ ai kể cả bạn thân.',
  },
  {
    code: 'SCENARIO_7_SHOCKING_VIRAL_NEWS',
    id: 'shocking-viral-news',
    title: '7. Tin tức gây sốc không có nguồn xác nhận',
    category: 'misinformation',
    description: 'Video hoặc bài đăng thông báo nghỉ học đột xuất, dịch bệnh bí ẩn, thảm họa thiên tai được cắt ghép giật gân để câu tương tác.',
    typicalSignals: [
      'Tiêu đề giật gân: "Kinh hoàng", "Chia sẻ gấp trước khi bị xóa".',
      'Không có ngày tháng cụ thể, không có văn bản đóng dấu đỏ từ cơ quan quản lý.',
    ],
    recommendedAction: 'Mở báo chí chính thống (VTV, Tuổi Trẻ, Thanh Niên) hoặc cổng thông tin Bộ GD&ĐT để đối chiếu.',
  },
  {
    code: 'SCENARIO_8_CYBERBULLYING_BLACKMAIL',
    id: 'bullying-blackmail',
    title: '8. Ảnh/video bị dùng để bắt nạt hoặc tống tiền',
    category: 'youth_harm',
    description: 'Kẻ xấu dùng ứng dụng AI lột đồ (nudify) hoặc cắt ghép khuôn mặt học sinh vào trang phục nhạy cảm để đe dọa đòi tiền hoặc xúc phạm danh dự.',
    typicalSignals: [
      'Lời đe dọa: "Nếu không gửi tiền/thẻ cào sẽ phát tán vào nhóm lớp, gửi cho bố mẹ".',
      'Đường viền cổ, ánh sáng trên mặt có vết ghép nhân tạo.',
    ],
    recommendedAction: 'Không trả tiền! Chụp màn hình lưu bằng chứng, báo ngay cho bố mẹ, thầy cô hoặc gọi Tổng đài Bảo vệ Trẻ em 111.',
  },
  {
    code: 'SCENARIO_9_DECEPTIVE_DEEPFAKE_ADS',
    id: 'deceptive-ads',
    title: '9. Quảng cáo sử dụng hình ảnh giả mạo tạo niềm tin',
    category: 'scam',
    description: 'Chèn hình ảnh logo các trường đại học, đài truyền hình hoặc cơ quan công an vào bài đăng bán hàng online, kiếm tiền online tại nhà.',
    typicalSignals: [
      'Cam kết "Kiếm 500k/ngày tại nhà cho học sinh", "Chỉ cần like bài viết".',
      'Bắt đóng phí đặt cọc nhiệm vụ ban đầu.',
    ],
    recommendedAction: 'Không tham gia các mô hình "làm nhiệm vụ kiếm tiền" trên Telegram/Zalo. Đây là chiêu trò lừa đảo chiếm đoạt tài sản.',
  },
  {
    code: 'SCENARIO_10_URGENCY_PRESSURE',
    id: 'urgency-pressure',
    title: '10. Nội dung tạo áp lực phải hành động lập tức (FOMO)',
    category: 'scam',
    description: 'Đồng hồ đếm ngược, tin nhắn cảnh báo "Tài khoản sẽ bị xóa trong 10 phút" hoặc "Cơ hội cuối cùng trong ngày" để nạn nhân không kịp suy nghĩ.',
    typicalSignals: [
      'Sử dụng các từ ngữ kích động sự sợ hãi hoặc lòng tham: "Ngay bây giờ", "Chỉ còn 3 phút".',
    ],
    recommendedAction: 'Áp dụng quy tắc "30 giây dừng lại". Không có cơ quan nhà nước hay dịch vụ uy tín nào ép người dùng phải thao tác trong vài phút qua tin nhắn chat.',
  },
];

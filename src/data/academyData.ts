import { AcademyArticle } from '../types';

export const ACADEMY_ARTICLES: AcademyArticle[] = [
  // Nhóm chủ đề 1: Kiến thức nền tảng
  {
    id: 'deepfake-co-ban',
    category: 'foundations',
    categoryLabel: 'Kiến thức nền tảng',
    title: 'Deepfake là gì và hoạt động như thế nào?',
    readTime: '4 phút',
    summary: 'Tìm hiểu nguồn gốc thuật ngữ Deepfake, cách thức các mô hình học sâu (Deep Learning) mô phỏng giọng nói và khuôn mặt người thật, cùng những khác biệt với cắt ghép truyền thống.',
    keyTakeaways: [
      'Deepfake kết hợp giữa "Deep learning" (học sâu) và "Fake" (giả mạo).',
      'AI có thể trích xuất hàng ngàn đặc điểm khuôn mặt hoặc âm vực để hoán đổi hoặc tạo chuyển động theo ý muốn.',
      'Không có công cụ AI nào có thể phát hiện chính xác 100% mọi nội dung Deepfake.',
    ],
    actionItems: [
      'Tập thói quen quan sát kỹ rìa mặt, ánh mắt và đồng bộ khẩu hình.',
      'Luôn đặt câu hỏi: "Ai là người đăng tải và với mục đích gì?".',
    ],
    sections: [
      {
        heading: '1. Khái niệm cốt lõi',
        content: 'Deepfake là công nghệ sử dụng mạng nơ-ron nhân tạo (phổ biến là mạng đối kháng tạo sinh GAN hoặc mô hình khuếch tán Diffusion) để tạo ra hoặc chỉnh sửa hình ảnh, video, âm thanh sao cho người trong nội dung nói hoặc làm những điều họ chưa từng thực hiện.',
      },
      {
        heading: '2. Khác biệt giữa chỉnh sửa thông thường và AI tạo sinh',
        content: 'Chỉnh sửa ảnh truyền thống (như Photoshop) đòi hỏi con người thao tác từng lớp, cắt ghép thủ công và để lại dấu vết rõ ràng. Trong khi đó, Deepfake do AI tự học cấu trúc khuôn mặt và biểu cảm, tự điều chỉnh ánh sáng và phối cảnh nên độ tự nhiên cao hơn rất nhiều, đánh lừa được mắt thường nếu chỉ lướt nhanh.',
      },
      {
        heading: '3. Giới hạn của các công cụ phát hiện',
        content: 'Các công cụ phân tích AI (kể cả Deepfake Scanner) là trợ lý giám định kỹ thuật số, dựa trên xác suất và phát hiện bất thường pixel/vân da. Công nghệ tạo sinh Deepfake phát triển từng ngày, vì vậy con người phải luôn phối hợp giữa công cụ kỹ thuật và kỹ năng tư duy phản biện (Critical Thinking).',
      },
    ],
    references: [
      'Cục An toàn thông tin - Bộ Thông tin và Truyền thông Việt Nam: Cẩm nang Nhận diện và Phòng chống Lừa đảo trực tuyến (2023).',
      'UNESCO Digital Literacy Curriculum for Youth (2022).',
    ],
  },
  {
    id: 'cac-loai-deepfake-pho-bien',
    category: 'foundations',
    categoryLabel: 'Kiến thức nền tảng',
    title: 'Các hình thức Deepfake phổ biến trên mạng xã hội hiện nay',
    readTime: '3 phút',
    summary: 'Điểm mặt 4 định dạng Deepfake thường xuyên xuất hiện trên TikTok, Facebook, Messenger và Zalo mà học sinh THCS cần nhận biết.',
    keyTakeaways: [
      'Face Swap (Hoán đổi khuôn mặt): Đưa mặt người này ghép vào cơ thể người khác.',
      'Voice Clone (Nhân bản giọng nói): Chỉ cần 3-5 giây mẫu âm thanh là AI có thể sao chép ngữ điệu và cao độ giọng nói.',
      'Puppetry (Điều khiển rối): Dùng một video mẫu để ép khuôn mặt người khác chuyển động theo.',
      'Lip-sync Generation: Chỉnh sửa khẩu hình để khớp với lời thoại mới.',
    ],
    actionItems: [
      'Đặc biệt cảnh giác với các cuộc gọi video mờ ảo, giật lag đột ngột.',
      'Không tin ngay các file ghi âm nhờ chuyển tiền hay gửi mã OTP.',
    ],
    sections: [
      {
        heading: '1. Giả mạo giọng nói qua điện thoại/tin nhắn thoại',
        content: 'Kẻ xấu thu thập giọng nói của cha mẹ hoặc bạn bè từ các video công khai trên TikTok, Reels hoặc YouTube, sau đó dùng công cụ Voice Clone tạo ra tin nhắn thoại giục chuyển tiền gấp do tai nạn hoặc kẹt tiền học viện.',
      },
      {
        heading: '2. Cuộc gọi video nhại hình ảnh chớp nhoáng',
        content: 'Để qua mặt nạn nhân, đối tượng bật video call nhưng chỉ để hình ảnh chuyển động 2-5 giây rồi ngắt kết nối với lý do "sóng yếu" hoặc "đang đi ngoài đường". Khuôn mặt trong video thực chất là một mô hình Deepfake được phát lại.',
      },
    ],
    references: [
      'Báo cáo Giám sát An toàn Không gian mạng Quốc gia (NCSC Vietnam, 2024).',
    ],
  },

  // Nhóm chủ đề 2: Rủi ro đối với học sinh THCS
  {
    id: 'lua-dao-mao-danh-nguoi-than',
    category: 'youth_risks',
    categoryLabel: 'Rủi ro đối với học sinh',
    title: 'Mạo danh bạn bè và người thân: Cạm bẫy tài chính và thông tin',
    readTime: '5 phút',
    summary: 'Phân tích thủ đoạn giả danh phụ huynh, giáo viên chủ nhiệm hoặc bạn cùng lớp để chiếm đoạt tiền bạc, tài khoản mạng xã hội và mã xác thực.',
    keyTakeaways: [
      'Kẻ gian thường tạo bối cảnh nguy cấp (tai nạn, nộp tiền thi gấp, tài khoản bị khóa) để kích động tâm lý sợ hãi.',
      'Học sinh THCS thường tin tưởng bạn bè và gia đình nên dễ mất cảnh giác khi nghe giọng nói quen thuộc.',
    ],
    actionItems: [
      'Nguyên tắc vàng: Khi có yêu cầu chuyển tiền hoặc gửi mật mã, luôn gọi lại bằng SIM điện thoại thường hoặc gặp mặt trực tiếp.',
      'Thiết lập "Mật khẩu gia đình" (Secret Word) giữa bố mẹ và con cái để xác minh trong tình huống khẩn cấp.',
    ],
    sections: [
      {
        heading: '1. Kịch bản "Bạn cùng lớp vay tiền gấp"',
        content: 'Kẻ xấu chiếm quyền hoặc sao chép ảnh đại diện của bạn cùng lớp, gửi tin nhắn: "Mày ơi tài khoản tao bị lỗi, gửi tao mượn 200k nộp quỹ lớp hoặc nạp thẻ game với". Kèm theo đó là đoạn voice clip ngắn do AI tạo nói đúng tên bạn.',
      },
      {
        heading: '2. Kịch bản "Bố mẹ đang cấp cứu"',
        content: 'Học sinh nhận được cuộc gọi giọng nói hốt hoảng của bố mẹ bảo phải chuyển tiền hoặc gửi ảnh CMND/CCCD của người nhà. Đây là đòn tâm lý cực kỳ nguy hiểm nhằm gây hoảng loạn.',
      },
    ],
    references: [
      'Cảnh báo tội phạm công nghệ cao - Bộ Công an Việt Nam (2024).',
      'UNICEF Vietnam - Bảo vệ trẻ em trên môi trường mạng.',
    ],
  },
  {
    id: 'bat-nat-xuc-pham-danh-du',
    category: 'youth_risks',
    categoryLabel: 'Rủi ro đối với học sinh',
    title: 'Bắt nạt trực tuyến, ghép ảnh bôi nhọ và xâm phạm đời tư',
    readTime: '4 phút',
    summary: 'Hiểu rõ hiểm họa khi ảnh đời thường của học sinh bị kẻ xấu dùng ứng dụng lột đồ (nudify) hoặc ghép vào bối cảnh nhạy cảm để uy hiếp tinh thần.',
    keyTakeaways: [
      'Ghép ảnh nhạy cảm hoặc bôi nhọ danh dự là hành vi vi phạm pháp luật nghiêm trọng (Luật Trẻ em 2016 và Luật An ninh mạng).',
      'Nạn nhân tuyệt đối không có lỗi trong hành vi sai trái của kẻ bắt nạt.',
      'Sự im lặng và tự chịu đựng chỉ khiến kẻ xấu gia tăng áp lực tống tiền hoặc uy hiếp.',
    ],
    actionItems: [
      'Không bao giờ trả tiền hay nghe theo yêu cầu của kẻ tống tiền.',
      'Chụp ảnh màn hình lưu bằng chứng (link, tin nhắn, tài khoản).',
      'Chia sẻ ngay với cha mẹ, thầy cô hoặc gọi Tổng đài 111 để được hỗ trợ tâm lý và pháp lý.',
    ],
    sections: [
      {
        heading: '1. Thủ đoạn tống tiền và làm nhục',
        content: 'Chỉ từ một bức ảnh kỷ yếu hoặc ảnh chụp trên trang cá nhân, đối tượng dùng ứng dụng AI tạo ra hình ảnh sai sự thật rồi đe dọa phát tán vào các nhóm chat của trường nếu nạn nhân không nộp tiền hoặc gửi thêm ảnh riêng tư.',
      },
      {
        heading: '2. Tác động tâm lý và cách vượt qua',
        content: 'Học sinh khi gặp tình huống này thường cảm thấy hoảng sợ, xấu hổ và sợ bị bạn bè xa lánh. Cần nhớ rằng cộng đồng và thầy cô luôn đứng về phía nạn nhân để xử lý kẻ phát tán.',
      },
    ],
    references: [
      'Luật Trẻ em số 102/2016/QH13.',
      'Bộ Lao động - Thương binh và Xã hội: Sổ tay phòng chống bạo lực và xâm hại trẻ em trên không gian mạng.',
    ],
  },

  // Nhóm chủ đề 3: Nhận biết và phòng tránh
  {
    id: 'quy-trinh-4-buoc-an-toan',
    category: 'detection_prevention',
    categoryLabel: 'Nhận biết và phòng tránh',
    title: 'Quy trình an toàn 4 bước: Dừng lại - Kiểm chứng - Bảo vệ - Báo cáo',
    readTime: '3 phút',
    summary: 'Bộ kỹ năng phản xạ số cốt lõi mà mỗi học sinh THCS cần thuộc nằm lòng để bảo vệ bản thân và bạn bè trước mọi rủi ro thông tin trên mạng xã hội.',
    keyTakeaways: [
      'Dừng lại: Ngừng mọi tương tác vội vàng, không nhấn link, không vội chia sẻ.',
      'Kiểm chứng: Đối chiếu nguồn độc lập, gọi điện thoại trực tiếp xác minh.',
      'Bảo vệ: Giữ kín thông tin cá nhân, mật khẩu, mã OTP, tài khoản cá nhân.',
      'Báo cáo: Thông báo người lớn tin cậy, báo cáo sai phạm cho nền tảng.',
    ],
    actionItems: [
      'Áp dụng quy tắc "30 giây dừng lại" trước bất kỳ tin sốc hay yêu cầu gấp nào.',
      'Cài đặt bảo mật 2 lớp (2FA) cho toàn bộ tài khoản mạng xã hội.',
    ],
    sections: [
      {
        heading: 'Bước 1: DỪNG LẠI (Stop & Breathe)',
        content: 'Kẻ lừa đảo hoặc người tung tin giật gân luôn tạo cảm giác cấp bách để bạn không kịp suy nghĩ logic. Dừng lại 30 giây giúp não bộ chuyển từ phản xạ cảm xúc sang tư duy phân tích.',
      },
      {
        heading: 'Bước 2: KIỂM CHỨNG (Cross-Check)',
        content: 'Dùng công cụ tìm kiếm hình ảnh đảo ngược (Reverse Image Search), kiểm tra kênh chính thống của báo chí hoặc gọi điện thoại trực tiếp cho người liên quan bằng số điện thoại trong danh bạ cá nhân.',
      },
      {
        heading: 'Bước 3: BẢO VỆ (Protect Privacy)',
        content: 'Không chia sẻ thông tin trường lớp, địa chỉ nhà riêng, không bật định vị công khai trên story. Luôn khóa danh sách bạn bè và thiết lập quyền riêng tư trên trang cá nhân.',
      },
      {
        heading: 'Bước 4: BÁO CÁO (Report & Seek Help)',
        content: 'Sử dụng nút Report trên Facebook/TikTok/Zalo và chia sẻ với người lớn ngay khi có dấu hiệu bất thường.',
      },
    ],
    references: [
      'Tài liệu tập huấn Kỹ năng số cho thanh thiếu niên (Viện Nghiên cứu Quản lý Phát triển Bền vững MSD).',
    ],
  },
  {
    id: 'dau-hieu-nhan-biet-deepfake',
    category: 'detection_prevention',
    categoryLabel: 'Nhận biết và phòng tránh',
    title: '10 dấu hiệu hình ảnh & âm thanh giúp phát hiện Deepfake',
    readTime: '4 phút',
    summary: 'Hướng dẫn chi tiết cách soi xét mắt thường: từ đồng tử, mí mắt, bóng đổ, răng, ngón tay đến những khoảng ngắt giọng bất thường trong âm thanh.',
    keyTakeaways: [
      'Mắt: Nhấp nháy không tự nhiên hoặc đồng tử phản chiếu ánh sáng khác nhau.',
      'Khuôn miệng & Răng: Răng thường bị mờ thành một khối, cử động môi không khớp với âm bật (p, b, m).',
      'Ánh sáng: Hướng chiếu sáng trên khuôn mặt không khớp với bóng đổ xung quanh.',
      'Ranh giới khuôn mặt: Viền cằm hoặc chân tóc có hiện tượng nhòe hạt (artifact blur).',
    ],
    actionItems: [
      'Phóng to vùng mắt và miệng khi kiểm tra một bức ảnh chân dung đáng ngờ.',
      'Yêu cầu người gọi video quay góc nghiêng hoặc vẫy tay trước mặt nếu nghi ngờ Deepfake trực tiếp.',
    ],
    sections: [
      {
        heading: '1. Dấu hiệu thị giác',
        content: 'Các mô hình AI thường gặp khó khăn khi vẽ lại các chi tiết phức tạp như kẽ răng, hoa tai, gọng kính và chân tóc. Nếu bạn phóng to ảnh thấy các đường viền bị tan chảy vào nhau, rất có thể đó là ảnh AI tạo sinh.',
      },
      {
        heading: '2. Dấu hiệu thính giác',
        content: 'Giọng nói tạo bằng AI thường thiếu hơi thở tự nhiên, âm sắc có thể đều đều như robot ở cuối câu, hoặc xuất hiện những tiếng xì xào kim loại (robotic artifacts) ở tần số cao.',
      },
    ],
    references: [
      'MIT Media Lab - Detect Fakes Research Guide.',
      'IEEE Signal Processing Society - Media Forensics Overview.',
    ],
  },

  // Nhóm chủ đề 4: Hướng dẫn xử lý sự cố
  {
    id: 'xu-ly-khi-bi-mao-danh',
    category: 'incident_response',
    categoryLabel: 'Hướng dẫn xử lý sự cố',
    title: 'Phải làm gì khi phát hiện tài khoản hoặc hình ảnh của mình bị mạo danh?',
    readTime: '4 phút',
    summary: 'Các bước xử lý khẩn cấp và hiệu quả: thu thập chứng cứ hợp pháp, cảnh báo bạn bè trong lớp, báo cáo nền tảng và nhờ nhà trường can thiệp.',
    keyTakeaways: [
      'Thông báo ngay cho bạn bè và thầy cô để mọi người cảnh giác không bị lừa.',
      'Lưu trữ link trang cá nhân mạo danh và chụp ảnh màn hình đầy đủ ngày giờ.',
      'Yêu cầu hỗ trợ từ phụ huynh để liên hệ ban giám hiệu hoặc cơ quan chức năng nếu vụ việc lan rộng.',
    ],
    actionItems: [
      'Đăng một thông báo ngắn trên trang cá nhân chính thức đính chính tài khoản giả mạo.',
      'Dùng tính năng "Báo cáo mạo danh tôi" trên mạng xã hội.',
    ],
    sections: [
      {
        heading: 'Bước 1: Chụp ảnh màn hình lưu bằng chứng',
        content: 'Chụp lại toàn bộ giao diện: link URL tài khoản giả, tin nhắn đã gửi, bài đăng xuyên tạc. Giữ nguyên định dạng gốc, không chỉnh sửa ảnh chụp.',
      },
      {
        heading: 'Bước 2: Cảnh báo diện rộng trong nhóm lớp',
        content: 'Nhờ lớp trưởng hoặc giáo viên chủ nhiệm thông báo vào nhóm phụ huynh và học sinh: "Hiện có tài khoản giả mạo em/bạn X, xin mọi người không chuyển tiền hay cung cấp thông tin".',
      },
      {
        heading: 'Bước 3: Gửi báo cáo vi phạm bản quyền và nhân phẩm',
        content: 'Các mạng xã hội đều có chính sách bảo vệ người dùng chưa thành niên rất nghiêm ngặt. Việc báo cáo kèm giấy tờ giám hộ của bố mẹ sẽ được xử lý ưu tiên gỡ bỏ.',
      },
    ],
    references: [
      'Meta Safety Center for Teens.',
      'TikTok Safety Guide for Guardians and Youth.',
    ],
  },
  {
    id: 'duong-day-nong-ho-tro',
    category: 'incident_response',
    categoryLabel: 'Hướng dẫn xử lý sự cố',
    title: 'Danh bạ khẩn cấp: Ai có thể giúp đỡ học sinh khi gặp nguy hiểm?',
    readTime: '3 phút',
    summary: 'Danh sách các kênh cứu hộ, đường dây nóng quốc gia và tổ chức bảo vệ quyền trẻ em hoàn toàn miễn phí tại Việt Nam.',
    keyTakeaways: [
      'Tổng đài 111: Tổng đài Quốc gia Bảo vệ Trẻ em (Gọi miễn phí 24/7).',
      'Đầu số 156 / 5656: Kênh tiếp nhận phản ánh cuộc gọi, tin nhắn rác và lừa đảo trực tuyến của Bộ TT&TT.',
      'Cơ quan Công an / Cảnh sát 113: Tiếp nhận tố giác tội phạm đe dọa, tống tiền.',
      'Phòng Tư vấn Tâm lý Học đường tại trường THCS.',
    ],
    actionItems: [
      'Lưu số 111 vào danh bạ điện thoại của em ngay hôm nay.',
      'Nhớ rằng tìm kiếm sự giúp đỡ từ người lớn là biểu hiện của sự dũng cảm và thông minh, không phải điểm yếu.',
    ],
    sections: [
      {
        heading: 'Tổng đài 111 hoạt động như thế nào?',
        content: 'Tổng đài 111 là dịch vụ công lập do Cục Trẻ em quản lý. Các cô chú tư vấn viên được đào tạo chuyên môn về tâm lý và pháp luật, bảo mật 100% danh tính của học sinh, sẵn sàng can thiệp khẩn cấp khi các em bị bạo lực mạng, tống tiền hoặc xâm hại danh dự.',
      },
      {
        heading: 'Khi nào cần liên hệ công an?',
        content: 'Khi đối tượng có hành vi tống tiền (đòi thẻ cào, tiền mặt), đe dọa vũ lực ngoài đời thực hoặc phát tán các tài liệu nhạy cảm nghiêm trọng, phụ huynh và gia đình cần đưa em đến cơ quan công an phường/xã nơi cư trú để làm đơn trình báo.',
      },
    ],
    references: [
      'Cổng thông tin điện tử Cục Trẻ em - Bộ LĐTBXH (tongdai111.vn).',
      'Cổng thông tin Không gian mạng Quốc gia (khonggianmang.vn).',
    ],
  },
];

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
    summary: 'Điểm mặt 4 định dạng Deepfake thường xuyên xuất hiện trên TikTok, Facebook, Messenger và Zalo mà người dùng cần nhận biết.',
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
        content: 'Kẻ xấu có thể thu thập mẫu giọng nói công khai rồi sử dụng công cụ Voice Cloning để tạo tin nhắn thoại giả, chẳng hạn viện lý do khẩn cấp nhằm yêu cầu chuyển tiền. Không có một độ dài mẫu âm thanh cố định bảo đảm việc sao chép thành công.',
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

  // Nhóm chủ đề 2: Rủi ro giả mạo danh tính và lừa đảo
  {
    id: 'lua-dao-mao-danh-nguoi-than',
    category: 'identity_risks',
    categoryLabel: 'Rủi ro giả mạo danh tính',
    title: 'Mạo danh bạn bè và người thân: Cạm bẫy tài chính và thông tin',
    readTime: '5 phút',
    summary: 'Phân tích thủ đoạn giả danh người thân, người hỗ trợ đáng tin cậy hoặc bạn bè để chiếm đoạt tiền bạc, tài khoản mạng xã hội và mã xác thực.',
    keyTakeaways: [
      'Kẻ gian thường tạo bối cảnh nguy cấp (tai nạn, thanh toán khoản tiền gấp, tài khoản bị khóa) để kích động tâm lý sợ hãi.',
      'Người dùng có thể mất cảnh giác khi nghe giọng nói hoặc nhìn thấy hình ảnh quen thuộc, đặc biệt trong tình huống khẩn cấp.',
    ],
    actionItems: [
      'Nguyên tắc vàng: Khi có yêu cầu chuyển tiền hoặc gửi mật mã, luôn gọi lại bằng SIM điện thoại thường hoặc gặp mặt trực tiếp.',
      'Thiết lập "Mật khẩu gia đình" (Secret Word) giữa các thành viên gia đình để xác minh trong tình huống khẩn cấp.',
    ],
    sections: [
      {
        heading: '1. Kịch bản "Bạn bè vay tiền gấp"',
        content: 'Kẻ xấu chiếm quyền hoặc sao chép ảnh đại diện của bạn bè, gửi tin nhắn: "Mày ơi tài khoản tao bị lỗi, gửi tao mượn 200k thanh toán khoản phí hoặc nạp thẻ game với". Kèm theo đó là đoạn voice clip ngắn do AI tạo nói đúng tên bạn.',
      },
      {
        heading: '2. Kịch bản "Người thân đang cấp cứu"',
        content: 'Người dùng có thể nhận cuộc gọi giả giọng người thân, yêu cầu chuyển tiền hoặc cung cấp giấy tờ cá nhân. Đây là thủ thuật tạo áp lực tâm lý để người nhận hành động trước khi xác minh.',
      },
    ],
    references: [
      'Cảnh báo tội phạm công nghệ cao - Bộ Công an Việt Nam (2024).',
      'UNICEF Vietnam - Bảo vệ trẻ em trên môi trường mạng.',
    ],
  },
  {
    id: 'bat-nat-xuc-pham-danh-du',
    category: 'identity_risks',
    categoryLabel: 'Rủi ro giả mạo danh tính',
    title: 'Bắt nạt trực tuyến, ghép ảnh bôi nhọ và xâm phạm đời tư',
    readTime: '4 phút',
    summary: 'Hiểu rõ hiểm họa khi ảnh đời thường của người dùng bị kẻ xấu dùng ứng dụng lột đồ (nudify) hoặc ghép vào bối cảnh nhạy cảm để uy hiếp tinh thần.',
    keyTakeaways: [
      'Ghép ảnh nhạy cảm hoặc bôi nhọ danh dự là hành vi vi phạm pháp luật nghiêm trọng (Luật Trẻ em 2016 và Luật An ninh mạng).',
      'Nạn nhân tuyệt đối không có lỗi trong hành vi sai trái của kẻ bắt nạt.',
      'Sự im lặng và tự chịu đựng chỉ khiến kẻ xấu gia tăng áp lực tống tiền hoặc uy hiếp.',
    ],
    actionItems: [
      'Không bao giờ trả tiền hay nghe theo yêu cầu của kẻ tống tiền.',
      'Chụp ảnh màn hình lưu bằng chứng (link, tin nhắn, tài khoản).',
      'Chia sẻ với người thân, người hỗ trợ đáng tin cậy hoặc cơ quan phù hợp để được hỗ trợ tâm lý và pháp lý.',
    ],
    sections: [
      {
        heading: '1. Thủ đoạn tống tiền và làm nhục',
        content: 'Chỉ từ một bức ảnh cá nhân hoặc ảnh chụp trên trang cá nhân, đối tượng dùng ứng dụng AI tạo ra hình ảnh sai sự thật rồi đe dọa phát tán vào các nhóm chat của nạn nhân nếu họ không chuyển tiền hoặc gửi thêm nội dung riêng tư.',
      },
      {
        heading: '2. Tác động tâm lý và cách vượt qua',
        content: 'Người bị hại có thể cảm thấy hoảng sợ, xấu hổ hoặc bị cô lập. Họ không có lỗi vì hành vi giả mạo, quấy rối hay tống tiền của người khác; nên lưu bằng chứng và tìm hỗ trợ an toàn.',
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
    summary: 'Bộ kỹ năng phản xạ số cốt lõi mà mọi người dùng nên ghi nhớ để bảo vệ bản thân và người thân trước rủi ro thông tin trên mạng xã hội.',
    keyTakeaways: [
      'Dừng lại: Ngừng mọi tương tác vội vàng, không nhấn link, không vội chia sẻ.',
      'Kiểm chứng: Đối chiếu nguồn độc lập, gọi điện thoại trực tiếp xác minh.',
      'Bảo vệ: Giữ kín thông tin cá nhân, mật khẩu, mã OTP, tài khoản cá nhân.',
      'Báo cáo: Thông báo người đáng tin cậy tin cậy, báo cáo sai phạm cho nền tảng.',
    ],
    actionItems: [
      'Áp dụng quy tắc "30 giây dừng lại" trước bất kỳ tin sốc hay yêu cầu gấp nào.',
      'Cài đặt bảo mật 2 lớp (2FA) cho toàn bộ tài khoản mạng xã hội.',
    ],
    sections: [
      {
        heading: 'Bước 1: DỪNG LẠI (Stop & Breathe)',
        content: 'Kẻ lừa đảo hoặc người phát tán tin giật gân có thể tạo cảm giác cấp bách để người nhận không kịp kiểm tra. Tạm dừng trước khi phản hồi giúp bạn có thời gian đối chiếu thông tin.',
      },
      {
        heading: 'Bước 2: KIỂM CHỨNG (Cross-Check)',
        content: 'Dùng công cụ tìm kiếm hình ảnh đảo ngược (Reverse Image Search), kiểm tra kênh chính thống của báo chí hoặc gọi điện thoại trực tiếp cho người liên quan bằng số điện thoại trong danh bạ cá nhân.',
      },
      {
        heading: 'Bước 3: BẢO VỆ (Protect Privacy)',
        content: 'Hạn chế chia sẻ địa chỉ nhà, nơi làm việc, lịch trình, dữ liệu định vị và thông tin định danh. Rà soát quyền riêng tư của tài khoản và chỉ công khai thông tin thật sự cần thiết.',
      },
      {
        heading: 'Bước 4: BÁO CÁO (Report & Seek Help)',
        content: 'Sử dụng chức năng báo cáo trên nền tảng và tìm hỗ trợ từ người đáng tin cậy khi có dấu hiệu bất thường.',
      },
    ],
    references: [
      'Tài liệu tập huấn Kỹ năng số cho người dùng (Viện Nghiên cứu Quản lý Phát triển Bền vững MSD).',
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
        content: 'Một số hệ thống tạo ảnh có thể tạo ra bất nhất ở chi tiết nhỏ, nhưng các dấu hiệu như răng, hoa tai, gọng kính hoặc chân tóc không đủ để kết luận ảnh do AI tạo. Cần kết hợp nhiều phương pháp và nguồn xác minh độc lập.',
      },
      {
        heading: '2. Dấu hiệu thính giác',
        content: 'Một số nội dung tổng hợp có thể có bất thường về phổ âm, nhịp điệu hoặc chuyển tiếp âm thanh; các dấu hiệu nghe có vẻ máy móc không đủ để kết luận giọng nói là giả.',
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
    summary: 'Các bước xử lý khẩn cấp và hiệu quả: thu thập chứng cứ hợp pháp, cảnh báo bạn bè và người liên quan, báo cáo nền tảng và nhờ cơ quan hoặc đơn vị có thẩm quyền hỗ trợ.',
    keyTakeaways: [
      'Thông báo ngay cho bạn bè và người phụ trách để mọi người cảnh giác không bị lừa.',
      'Lưu trữ link trang cá nhân mạo danh và chụp ảnh màn hình đầy đủ ngày giờ.',
      'Yêu cầu hỗ trợ từ người thân để liên hệ nền tảng hoặc cơ quan chức năng phù hợp nếu vụ việc lan rộng.',
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
        heading: 'Bước 2: Cảnh báo diện rộng trong nhóm trò chuyện',
        content: 'Thông báo qua kênh liên lạc đáng tin cậy cho những người có nguy cơ bị ảnh hưởng: "Có tài khoản đang mạo danh tôi/người quen. Vui lòng không chuyển tiền, cung cấp mã xác thực hoặc mở liên kết từ tài khoản đó".',
      },
      {
        heading: 'Bước 3: Gửi báo cáo vi phạm bản quyền và nhân phẩm',
        content: 'Sử dụng quy trình báo cáo mạo danh, quấy rối hoặc xâm phạm quyền riêng tư của nền tảng. Nếu người bị hại là trẻ em, người giám hộ có thể hỗ trợ thực hiện yêu cầu bảo vệ phù hợp.',
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
    title: 'Danh bạ khẩn cấp: Ai có thể giúp đỡ người cần hỗ trợ khẩn cấp?',
    readTime: '3 phút',
    summary: 'Danh sách một số kênh hỗ trợ khẩn cấp tại Việt Nam. Hãy chọn đúng đầu mối theo loại sự cố; đường dây bảo vệ trẻ em chỉ áp dụng cho trường hợp liên quan đến trẻ em.',
    keyTakeaways: [
      'Tổng đài 111: Tổng đài Quốc gia Bảo vệ Trẻ em (Gọi miễn phí 24/7).',
      'Đầu số 156 / 5656: Kênh tiếp nhận phản ánh cuộc gọi, tin nhắn rác và lừa đảo trực tuyến của Bộ TT&TT.',
      'Cơ quan Công an / Cảnh sát 113: Tiếp nhận tố giác tội phạm đe dọa, tống tiền.',
      'Dịch vụ hỗ trợ tâm lý và bảo vệ tại địa phương hoặc tổ chức chuyên môn phù hợp.',
    ],
    actionItems: [
      'Lưu số hỗ trợ phù hợp với hoàn cảnh của bạn; 111 là đường dây bảo vệ trẻ em, không phải tổng đài chung cho mọi loại sự cố.',
      'Nhớ rằng tìm kiếm sự giúp đỡ từ người đáng tin cậy là biểu hiện của sự dũng cảm và thông minh, không phải điểm yếu.',
    ],
    sections: [
      {
        heading: 'Tổng đài 111 hoạt động như thế nào?',
        content: 'Tổng đài 111 là đường dây quốc gia về bảo vệ trẻ em. Khi sự việc liên quan đến trẻ em, có thể liên hệ để được hướng dẫn và kết nối hỗ trợ; không nên hứa hẹn mức bảo mật tuyệt đối hoặc kết quả can thiệp trước khi cơ quan tiếp nhận đánh giá trường hợp.',
      },
      {
        heading: 'Khi nào cần liên hệ công an?',
        content: 'Khi có hành vi tống tiền, đe dọa trực tiếp hoặc phát tán nội dung riêng tư, hãy ưu tiên an toàn cá nhân, lưu lại bằng chứng và liên hệ cơ quan công an hoặc dịch vụ hỗ trợ phù hợp tại địa phương.',
      },
    ],
    references: [
      'Cổng thông tin điện tử Cục Trẻ em - Bộ LĐTBXH (tongdai111.vn).',
      'Cổng thông tin Không gian mạng Quốc gia (khonggianmang.vn).',
    ],
  },
];

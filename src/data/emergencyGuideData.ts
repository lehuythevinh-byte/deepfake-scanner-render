export interface EmergencyGuideItem {
  id: string;
  scenarioTitle: string;
  urgencyLevel: 'high' | 'critical' | 'medium';
  summary: string;
  doNotList: string[];
  immediateSteps: string[];
  supportChannels: {
    name: string;
    contact: string;
    note: string;
  }[];
}

export const EMERGENCY_GUIDES: EmergencyGuideItem[] = [
  {
    id: 'suspected-fake-content',
    scenarioTitle: '1. Nghi ngờ nội dung trên mạng là giả mạo (Fake / Deepfake)',
    urgencyLevel: 'medium',
    summary: 'Bạn bắt gặp một hình ảnh, video clip hoặc bài đăng có nội dung bất thường, gây sốc hoặc bôi nhọ người khác trên bảng tin hoặc nhóm chat.',
    doNotList: [
      'Không bấm "Chia sẻ" (Share), không tag bạn bè vào bình luận.',
      'Không tải về rồi đăng lại lên tài khoản của mình với mục đích "hỏi thật hay giả".',
      'Không vội vã đưa ra bình luận kết tội hay khẳng định khi chưa có thông tin chính thức.',
    ],
    immediateSteps: [
      'Áp dụng quy tắc "30 giây dừng lại" để hạ nhiệt cảm xúc tò mò hoặc tức giận.',
      'Kiểm tra tài khoản gốc đăng bài: Tài khoản tạo bao lâu? Có tích xanh hoặc thông tin xác minh không? Đã từng đăng nội dung gì?',
      'Tìm kiếm độc lập (Lateral Reading): Mở báo chí chính thống (VTV, Báo Tuổi Trẻ, Thanh Niên) xem có bài viết xác nhận không.',
      'Sử dụng công cụ AI Scanner & Evidence Lab trên website này như một nguồn tham khảo kỹ thuật số.',
      'Bấm nút "Báo cáo" (Report) trên mạng xã hội với lý do Thông tin sai lệch / Giả mạo.',
    ],
    supportChannels: [
      {
        name: 'Trung tâm Xử lý tin giả Việt Nam (VAFC)',
        contact: 'tingia.gov.vn',
        note: 'Tiếp nhận phản ánh và công bố các tin giả được xác minh',
      },
      {
        name: 'Cổng Không gian mạng Quốc gia',
        contact: 'khonggianmang.vn',
        note: 'Hướng dẫn an toàn thông tin của Cục An toàn thông tin',
      },
    ],
  },
  {
    id: 'impersonation-scam',
    scenarioTitle: '2. Nghi ngờ lừa đảo, mạo danh giọng nói / video call đòi tiền',
    urgencyLevel: 'high',
    summary: 'Nhận được tin nhắn, cuộc gọi thoại hoặc video call ngắn với giọng nói/mặt giống người thân, giáo viên hoặc bạn bè đòi chuyển tiền, nạp thẻ hoặc gửi mã OTP.',
    doNotList: [
      'Tuyệt đối KHÔNG chuyển tiền vào bất kỳ số tài khoản ngân hàng nào theo yêu cầu.',
      'Tuyệt đối KHÔNG đọc mã OTP, mã xác thực SMS, mật khẩu cho bất kỳ ai.',
      'Không bấm vào các đường link lạ kèm theo tin nhắn yêu cầu "đăng nhập bình chọn".',
    ],
    immediateSteps: [
      'Cúp máy hoặc dừng nhắn tin ngay lập tức. Giữ bình tĩnh.',
      'Lấy điện thoại gọi trực tiếp vào SỐ ĐIỆN THOẠI DI ĐỘNG (qua sóng viễn thông SIM) của người đó trong danh bạ để hỏi rõ.',
      'Nếu không gọi được, gọi cho bố/mẹ, người thân khác trong gia đình hoặc giáo viên chủ nhiệm.',
      'Đặt câu hỏi xác thực bảo mật riêng: "Chỉ người trong nhà mới biết" (như tên thú cưng, món ăn sáng nay, mật khẩu gia đình).',
      'Chụp ảnh màn hình số tài khoản đối tượng gửi và tin nhắn để làm bằng chứng.',
    ],
    supportChannels: [
      {
        name: 'Đầu số tiếp nhận phản ánh cuộc gọi rác, lừa đảo (Bộ TT&TT)',
        contact: '156 hoặc gửi SMS đến 5656',
        note: 'Miễn phí cước cuộc gọi và tin nhắn phản ánh',
      },
      {
        name: 'Đường dây nóng Cục An ninh mạng & PCTP sử dụng công nghệ cao',
        contact: '069.234.8560 (Cục A05 - Bộ Công an)',
        note: 'Tiếp nhận tố giác lừa đảo công nghệ cao',
      },
    ],
  },
  {
    id: 'unauthorized-image-abuse',
    scenarioTitle: '3. Hình ảnh cá nhân bị cắt ghép, bôi nhọ hoặc bắt nạt trực tuyến',
    urgencyLevel: 'critical',
    summary: 'Bạn phát hiện ảnh của mình bị ghép vào thân hình người khác, gắn vào bối cảnh nhạy cảm, bị chế giễu hoặc bị lan truyền trong các nhóm chat.',
    doNotList: [
      'Không tự đổ lỗi cho bản thân! Bạn là nạn nhân của hành vi phi pháp, bạn hoàn toàn không có lỗi.',
      'Không trả đũa bằng cách ghép ảnh lại hay chửi bới xúc phạm kẻ bắt nạt.',
      'Không xóa vội bằng chứng tin nhắn hoặc đường link bài đăng vì sợ hãi.',
      'Không tải thêm ảnh riêng tư khác lên mạng để chứng minh "ảnh đó không phải tôi".',
    ],
    immediateSteps: [
      'Chụp ảnh màn hình đầy đủ: Giữ nguyên ngày giờ, tên tài khoản, nội dung đe dọa, đường link URL bài viết.',
      'Lên tiếng chia sẻ NGAY LẬP TỨC với cha mẹ, thầy cô giáo chủ nhiệm hoặc chuyên viên tư vấn tâm lý trường học.',
      'Sử dụng tính năng báo cáo vi phạm quyền riêng tư và quấy rối trên nền tảng (Meta, TikTok, Zalo).',
      'Nhờ người lớn đại diện làm việc với ban giám hiệu nhà trường để có biện pháp bảo vệ học sinh.',
    ],
    supportChannels: [
      {
        name: 'Tổng đài Quốc gia Bảo vệ Trẻ em (Cục Trẻ em)',
        contact: '111 (Gọi miễn phí 24/7)',
        note: 'Hỗ trợ tâm lý khẩn cấp, bảo vệ danh tính, can thiệp pháp lý cho trẻ em dưới 16 tuổi',
      },
      {
        name: 'Phòng Tư vấn Tâm lý Học đường',
        contact: 'Thầy cô phụ trách tại trường THCS',
        note: 'Hỗ trợ trực tiếp trong môi trường sư phạm',
      },
    ],
  },
  {
    id: 'blackmail-threat',
    scenarioTitle: '4. Bị tống tiền, đe dọa vũ lực hoặc xâm phạm an toàn thân thể',
    urgencyLevel: 'critical',
    summary: 'Đối tượng có hành vi tống tiền, đe dọa tung ảnh nhạy cảm lên mạng, đòi tiền chuộc hoặc hẹn gặp mặt ở nơi vắng vẻ.',
    doNotList: [
      'Tuyệt đối KHÔNG nộp tiền, KHÔNG mua thẻ cào gửi cho kẻ tống tiền.',
      'Tuyệt đối KHÔNG một mình đi gặp đối tượng ở bất kỳ địa điểm nào.',
      'Không làm theo các yêu cầu quái đản tiếp theo của kẻ đe dọa.',
      'Không giấu giếm gia đình: Kẻ xấu chỉ mạnh khi bạn đơn độc và sợ hãi.',
    ],
    immediateSteps: [
      'Ưu tiên hàng đầu: An toàn tính mạng và sức khỏe tinh thần của bản thân.',
      'Lưu trữ toàn bộ lịch sử trò chuyện, tài khoản ngân hàng nhận tiền, đường link và file ghi âm.',
      'Đưa cha mẹ cùng đến Công an Phường/Xã nơi em cư trú để nộp đơn trình báo và đề nghị bảo vệ.',
      'Gọi ngay Tổng đài 111 để được cán bộ bảo vệ trẻ em đồng hành hỗ trợ quy trình pháp lý.',
    ],
    supportChannels: [
      {
        name: 'Cảnh sát phản ứng nhanh',
        contact: '113',
        note: 'Khi có nguy cơ đe dọa vũ lực ngoài đời thực',
      },
      {
        name: 'Tổng đài Quốc gia Bảo vệ Trẻ em',
        contact: '111 (Miễn phí 24/7)',
        note: 'Cơ quan thường trực can thiệp khẩn cấp bảo vệ học sinh',
      },
    ],
  },
];

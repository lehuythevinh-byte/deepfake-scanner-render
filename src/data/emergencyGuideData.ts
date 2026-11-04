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
      'Sử dụng Content Analysis và phần Bằng chứng trong kết quả như nguồn tham khảo kỹ thuật số.',
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
    summary: 'Nhận được tin nhắn, cuộc gọi thoại hoặc video call có hình ảnh/giọng nói giống người thân, đồng nghiệp hoặc người quen và yêu cầu chuyển tiền, cung cấp mã OTP hay thông tin nhạy cảm.',
    doNotList: [
      'Tuyệt đối KHÔNG chuyển tiền vào bất kỳ số tài khoản ngân hàng nào theo yêu cầu.',
      'Tuyệt đối KHÔNG đọc mã OTP, mã xác thực SMS, mật khẩu cho bất kỳ ai.',
      'Không bấm vào các đường link lạ kèm theo tin nhắn yêu cầu "đăng nhập bình chọn".',
    ],
    immediateSteps: [
      'Cúp máy hoặc dừng nhắn tin ngay lập tức. Giữ bình tĩnh.',
      'Lấy điện thoại gọi trực tiếp vào SỐ ĐIỆN THOẠI DI ĐỘNG (qua sóng viễn thông SIM) của người đó trong danh bạ để hỏi rõ.',
      'Nếu không gọi được, liên hệ một người thân hoặc đầu mối đáng tin cậy khác bằng số liên hệ đã lưu trước đó.',
      'Đặt câu hỏi xác minh riêng đã thống nhất trước; không tiết lộ câu trả lời hoặc mã bí mật trong cuộc trò chuyện đáng ngờ.',
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
    scenarioTitle: '3. Hình ảnh cá nhân bị cắt ghép, bôi nhọ hoặc phát tán trái phép',
    urgencyLevel: 'critical',
    summary: 'Bạn phát hiện ảnh của mình bị ghép vào bối cảnh nhạy cảm, bị chế giễu hoặc bị phát tán trái phép trên mạng.',
    doNotList: [
      'Không tự đổ lỗi cho bản thân! Bạn là nạn nhân của hành vi phi pháp, bạn hoàn toàn không có lỗi.',
      'Không trả đũa bằng cách ghép ảnh lại hay chửi bới xúc phạm kẻ bắt nạt.',
      'Không xóa vội bằng chứng tin nhắn hoặc đường link bài đăng vì sợ hãi.',
      'Không tải thêm ảnh riêng tư khác lên mạng để chứng minh "ảnh đó không phải tôi".',
    ],
    immediateSteps: [
      'Chụp ảnh màn hình đầy đủ: Giữ nguyên ngày giờ, tên tài khoản, nội dung đe dọa, đường link URL bài viết.',
      'Tìm hỗ trợ từ người đáng tin cậy, đơn vị tư vấn chuyên môn hoặc cơ quan có thẩm quyền; tránh tự đối đầu với người đe dọa.',
      'Sử dụng tính năng báo cáo vi phạm quyền riêng tư và quấy rối trên nền tảng (Meta, TikTok, Zalo).',
      'Nếu người bị hại là trẻ em, liên hệ người giám hộ và cơ quan bảo vệ trẻ em; các trường hợp khác nên báo cáo nền tảng và cơ quan chức năng phù hợp.',
    ],
    supportChannels: [
      {
        name: 'Tổng đài Quốc gia Bảo vệ Trẻ em (Cục Trẻ em)',
        contact: '111 (Gọi miễn phí 24/7)',
        note: 'Hỗ trợ tâm lý khẩn cấp, bảo vệ danh tính, can thiệp pháp lý cho trẻ em dưới 16 tuổi',
      },
      {
        name: 'Dịch vụ tư vấn tâm lý phù hợp',
        contact: 'Đơn vị tư vấn hoặc hỗ trợ tâm lý tại địa phương',
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
      'Đừng tự cô lập: tìm một người đáng tin cậy hoặc dịch vụ hỗ trợ phù hợp để được đồng hành.',
    ],
    immediateSteps: [
      'Ưu tiên hàng đầu: An toàn tính mạng và sức khỏe tinh thần của bản thân.',
      'Lưu trữ toàn bộ lịch sử trò chuyện, tài khoản ngân hàng nhận tiền, đường link và file ghi âm.',
      'Liên hệ cơ quan công an tại địa phương để trình báo và đề nghị hướng dẫn bảo vệ. Nếu người bị hại là trẻ em, người giám hộ có thể đi cùng.',
      'Nếu người bị hại là trẻ em, có thể liên hệ Tổng đài 111 để được hướng dẫn về bảo vệ trẻ em.',
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
        note: 'Đường dây bảo vệ trẻ em; chỉ dùng khi sự việc liên quan đến trẻ em',
      },
    ],
  },
];

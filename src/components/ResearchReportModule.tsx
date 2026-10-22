import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  FileText, 
  Download, 
  Printer, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Layers, 
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ResearchReportModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const ResearchReportModule: React.FC<ResearchReportModuleProps> = ({ onTabChange }) => {
  const [activeSection, setActiveSection] = useState<string>('intro');

  const reportSections = [
    { id: 'intro', label: 'Mở đầu: Tính cấp thiết' },
    { id: 'chap1', label: 'Chương 1: Câu hỏi & Phương pháp' },
    { id: 'chap2', label: 'Chương 2: Thực trạng & Phân tích' },
    { id: 'chap3', label: 'Chương 3: Xây dựng & Vận hành' },
    { id: 'chap4', label: 'Chương 4: Kết luận & Kiến nghị' },
    { id: 'refs', label: 'Tài liệu tham khảo' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>VĂN BẢN NGHIÊN CỨU KHOA HỌC CHUẨN MỰC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Báo Cáo Nghiên Cứu Khoa Học Đề Tài</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Hồ sơ thuyết minh đầy đủ cấu trúc khoa học dành cho hội đồng đánh giá dự án STEM, giáo viên hướng dẫn và học sinh tham khảo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-[#172941] border border-slate-700 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#55DDF2]" />
            <span>In toàn văn báo cáo</span>
          </button>
        </div>
      </div>

      {/* Formal Paper Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#172941] to-[#101C32] border border-[#55DDF2]/30 space-y-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#55DDF2] bg-[#55DDF2]/10 px-3 py-1 rounded-full border border-[#55DDF2]/20">
          ĐỀ TÀI NGHIÊN CỨU KHOA HỌC KỸ THUẬT CẤP TRUNG HỌC CƠ SỞ
        </span>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
          GIẢI PHÁP GIÚP HỌC SINH TRUNG HỌC CƠ SỞ TRÁNH MỘT SỐ TÁC ĐỘNG RỦI RO TỪ DEEPFAKE KHI SỬ DỤNG MẠNG XÃ HỘI
        </h2>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
          <span><strong>Lĩnh vực:</strong> Khoa học Xã hội - Hành vi & Hệ thống Thông minh</span>
          <span>·</span>
          <span><strong>Đối tượng thụ hưởng:</strong> Học sinh THCS (11 - 15 tuổi)</span>
          <span>·</span>
          <span><strong>Nền tảng ứng dụng:</strong> DEEPFAKE SCANNER</span>
        </div>
      </div>

      {/* Navigation & Chapter Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-2 lg:sticky lg:top-24">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">MỤC LỤC BÁO CÁO</p>
          {reportSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full p-3 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between border ${
                activeSection === sec.id
                  ? 'bg-[#172941] text-[#55DDF2] border-[#55DDF2]/40 shadow-sm'
                  : 'bg-[#101C32] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{sec.label}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ))}

          {/* Quick jump to practical modules */}
          <div className="p-4 rounded-2xl bg-[#172941]/50 border border-slate-800 mt-6 space-y-2 text-xs">
            <span className="font-bold text-white block">Thực nghiệm trực tiếp:</span>
            <button
              onClick={() => onTabChange('scanner')}
              className="text-[#55DDF2] hover:underline block text-left"
            >
              → Kiểm tra AI Scanner
            </button>
            <button
              onClick={() => onTabChange('simulator')}
              className="text-[#55DDF2] hover:underline block text-left"
            >
              → Kiểm tra Safety Simulator
            </button>
            <button
              onClick={() => onTabChange('research')}
              className="text-[#55DDF2] hover:underline block text-left"
            >
              → Kiểm tra Dữ liệu Nghiên cứu
            </button>
          </div>
        </div>

        {/* Paper Content Viewer */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#172941]/80 border border-[#1f3554] space-y-8 text-slate-200 leading-relaxed text-xs sm:text-sm">
          {activeSection === 'intro' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">PHẦN MỞ ĐẦU</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Giới Thiệu và Tổng Quan Vấn Đề</h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-base text-white">1. Tóm tắt đề tài (Abstract)</h4>
                <p>
                  Sự bùng nổ của trí tuệ nhân tạo tạo sinh (Generative AI) và đặc biệt là công nghệ Deepfake đang đặt ra những thách thức an ninh phi truyền thống chưa từng có đối với học sinh Trung học Cơ sở (THCS). Bằng việc sử dụng các mô hình học sâu, kẻ xấu có thể sao chép giọng nói của phụ huynh chỉ từ 3 giây dữ liệu mẫu hoặc hoán đổi khuôn mặt học sinh vào các hình ảnh bôi nhọ nhạy cảm nhằm mục đích lừa đảo, tống tiền hoặc bạo lực mạng.
                </p>
                <p>
                  Đề tài <strong>“Giải pháp giúp học sinh trung học cơ sở tránh một số tác động rủi ro từ Deepfake khi sử dụng mạng xã hội”</strong> được xây dựng nhằm cung cấp một mô hình phòng vệ số toàn diện gồm: (1) Công cụ AI Scanner hỗ trợ giám định kỹ thuật số; (2) Evidence Lab - quy trình kiểm chứng nguồn độc lập; (3) Safety Simulator - mô phỏng tình huống rèn luyện phản xạ; và (4) Trợ lý SafeBot AI tư vấn ứng phó rủi ro khẩn cấp.
                </p>

                <h4 className="font-bold text-base text-white pt-2">2. Tính cấp thiết của đề tài</h4>
                <p>
                  Các tỷ lệ mẫu hiện có trong mã nguồn (57.5%, 42.5%, 58.8%) chỉ dùng để minh họa cách trình bày, chưa được xác minh là kết quả khảo sát thực tế. Khi có dữ liệu gốc, cần thay các tỷ lệ này bằng phép tính có thể truy xuất và mô tả cỡ mẫu, cách chọn mẫu, thời điểm khảo sát. Đề tài hướng tới đánh giá một giải pháp kết hợp công nghệ với giáo dục kỹ năng số thực tiễn.
                </p>

                <h4 className="font-bold text-base text-white pt-2">3. Tính mới và đóng góp khoa học</h4>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li><strong>Tính mới:</strong> Tích hợp giữa công nghệ AI giám định (Gemini Vision) và phương pháp giáo dục hành vi (Behavioral Intervention), tạo ra một sân chơi mô phỏng tương tác đầu tiên tại Việt Nam dành riêng cho học sinh THCS.</li>
                  <li><strong>Đóng góp ứng dụng:</strong> Cung cấp bộ quy trình 4 bước chuẩn mực (Dừng lại → Kiểm chứng → Bảo vệ → Báo cáo) và dữ liệu đo đạc thực nghiệm minh bạch, có khả năng nhân rộng trong các trường học phổ thông.</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'chap1' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">CHƯƠNG 1</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Câu Hỏi Nghiên Cứu và Phương Pháp Nghiên Cứu</h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-base text-white">1. Câu hỏi nghiên cứu</h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Thực trạng nhận thức và mức độ tiếp xúc với các rủi ro từ Deepfake của học sinh THCS hiện nay như thế nào?</li>
                  <li>Việc kết hợp giữa công cụ AI hỗ trợ và quy trình kiểm chứng thủ công có giúp cải thiện năng lực tự bảo vệ của học sinh không?</li>
                  <li>Mô phỏng tình huống (Safety Simulator) đóng vai trò gì trong việc chuyển hóa kiến thức thành phản xạ an toàn số?</li>
                </ul>

                <h4 className="font-bold text-base text-white pt-2">2. Phương pháp nghiên cứu</h4>
                <p>
                  Đề tài áp dụng phương pháp nghiên cứu hỗn hợp (Mixed Methods):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#101C32] border border-slate-800 space-y-1">
                    <span className="font-bold text-[#55DDF2]">Phương pháp Định lượng:</span>
                    <p className="text-xs text-slate-300">Bộ dữ liệu N=320 trong mã nguồn chỉ là dữ liệu minh họa; chưa có căn cứ xác nhận đây là mẫu khảo sát thật. Khi thu thập dữ liệu, ghi rõ cách chọn mẫu, trường tham gia, cỡ mẫu và thời gian thực tế.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#101C32] border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400">Phương pháp Thực nghiệm Can thiệp:</span>
                    <p className="text-xs text-slate-300">Đánh giá trước và sau can thiệp (Pre-test vs Post-test) trên nhóm thực nghiệm sau khi trải nghiệm đầy đủ các phân hệ của website.</p>
                  </div>
                </div>

                <h4 className="font-bold text-base text-white pt-2">3. Tiêu chí đánh giá hiệu quả</h4>
                <p>
                  Chỉ số đo lường gồm: (1) Tỷ lệ phát hiện dấu hiệu giả mạo; (2) Tỷ lệ từ chối cung cấp mã OTP/chuyển tiền khi gặp kịch bản khẩn cấp; (3) Mức độ nhận thức về giới hạn của AI (không phụ thuộc mù quáng); và (4) Mức độ biết đến đường dây nóng bảo vệ trẻ em 111.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'chap2' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">CHƯƠNG 2</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Thực Trạng và Phân Tích Kết Quả Khảo Sát</h3>
              </div>
              <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-100">Các số liệu tỷ lệ trong chương này là dữ liệu minh họa dựng sẵn để trình diễn bố cục báo cáo. Chưa có xác minh rằng chúng bắt nguồn từ khảo sát thực tế; hãy thay bằng dữ liệu gốc trước khi nộp báo cáo khoa học.</div>

              <div className="space-y-4">
                <h4 className="font-bold text-base text-white">1. Dữ liệu minh họa về thực trạng nhận thức</h4>
                <p>
                  Các tỷ lệ bên dưới là số liệu minh họa, chưa được xác minh bằng bộ phiếu khảo sát thực tế:
                </p>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li><strong>Kênh tiếp nhận chính:</strong> 88.4% học sinh tiếp nhận thông tin hàng ngày qua TikTok và video ngắn; 74.2% qua tin nhắn mạng xã hội (Facebook Messenger, Zalo).</li>
                  <li><strong>Lỗ hổng kiểm chứng:</strong> Chỉ có 11.88% học sinh có thói quen thường xuyên tìm kiếm nguồn độc lập để kiểm chứng trước khi chia sẻ một bài viết gây sốc.</li>
                  <li><strong>Nguy cơ bị thao túng tâm lý:</strong> Khi đối diện với tình huống giọng nói cha mẹ gặp nạn ngoài đường (Tình huống A), có đến 41.2% học sinh ở khảo sát ban đầu chọn phương án làm theo lời dặn chuyển tiền hoặc gom tiền đưa cho người lạ vì hoảng loạn.</li>
                </ul>

                <h4 className="font-bold text-base text-white pt-2">2. Ví dụ minh họa cách trình bày trước và sau can thiệp</h4>
                <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 space-y-2">
                  <p className="font-bold text-amber-300">Số liệu minh họa — chưa phải kết quả đã xác minh:</p>
                  <p>
                    Khi có dữ liệu thật, thay các tỷ lệ ví dụ bên dưới bằng số liệu đo trước/sau tương ứng:
                  </p>
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    <li>Tỷ lệ học sinh thực hiện quy tắc an toàn (gọi điện SIM xác minh, từ chối chuyển tiền) đã tăng từ <strong>41.2% lên 95.3%</strong> (+54.1%).</li>
                    <li>Tỷ lệ hiểu đúng rằng AI không hoàn hảo và cần đối chiếu nguồn độc lập tăng từ <strong>19.7% lên 88.2%</strong> (+68.5%).</li>
                    <li>Tỷ lệ ghi nhớ và biết gọi Tổng đài 111 khi bị bắt nạt/đe dọa tăng từ <strong>34.1% lên 92.5%</strong> (+58.4%).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'chap3' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">CHƯƠNG 3</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Xây Dựng và Vận Hành Sản Phẩm Công Nghệ</h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-base text-white">1. Kiến trúc kỹ thuật của hệ thống</h4>
                <p>
                  Hệ thống <strong>DEEPFAKE SCANNER — TRUNG TÂM AN TOÀN SỐ</strong> được phát triển với mô hình Full-Stack hiện đại:
                </p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS, bảo đảm giao diện thích ứng responsive hoàn hảo trên máy tính và điện thoại thông minh của học sinh.</li>
                  <li><strong>Backend & API:</strong> Express server kết nối dịch vụ Gemini Vision 3.8 Flash bảo mật phía máy chủ (không để lộ API key ra trình duyệt).</li>
                  <li><strong>Bảo vệ dữ liệu & Quyền riêng tư:</strong> Source không ghi tệp tải lên vào cơ sở dữ liệu riêng; nếu người dùng đăng nhập, hệ thống lưu email/tên hiển thị và tóm tắt lịch sử quét, không lưu ảnh hoặc tin nhắn gốc trong lịch sử. Khi bật Gemini, nội dung được gửi tới API của Google để phân tích và việc xử lý còn phụ thuộc điều khoản của nhà cung cấp. Không tải ảnh riêng tư/nhạy cảm. Trước khi dùng thật với học sinh, cần thông báo rõ, xin sự đồng ý phù hợp, giảm dữ liệu nhận dạng và thiết lập quy trình lưu/xóa dữ liệu.</li>
                </ul>

                <h4 className="font-bold text-base text-white pt-2">2. Cơ chế xử lý trung thực khoa học</h4>
                <p>
                  Hệ thống tuyệt đối nói không với "kết quả AI giả lập": Nếu chưa kết nối khóa API, website hiển thị rõ chế độ MANUAL MODE và điều hướng sang Evidence Lab để học sinh tự kiểm chứng theo phương pháp khoa học, bảo đảm tính liêm chính nghiên cứu.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'chap4' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">CHƯƠNG 4</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Kết Luận và Kiến Nghị</h3>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-base text-white">1. Kết luận khoa học</h4>
                <p>
                  Giả thuyết của đề tài là việc kết hợp công cụ hỗ trợ kiểm chứng với quy trình 4 bước (Dừng lại → Kiểm chứng → Bảo vệ → Báo cáo) có thể giúp học sinh THCS ứng phó tốt hơn với rủi ro Deepfake. Chỉ kết luận về hiệu quả thực tế sau khi thu thập dữ liệu hợp lệ, phân tích kết quả trước/sau và nêu rõ các giới hạn nghiên cứu.
                </p>

                <h4 className="font-bold text-base text-white pt-2">2. Kiến nghị đề xuất</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#101C32] border border-slate-800">
                    <strong className="text-[#55DDF2]">Đối với Nhà trường:</strong> Đưa nội dung thực hành phòng chống Deepfake và nhận diện tin giả vào các tiết học Tin học, Hoạt động trải nghiệm hướng nghiệp và Giáo dục công dân.
                  </div>
                  <div className="p-3 rounded-xl bg-[#101C32] border border-slate-800">
                    <strong className="text-amber-400">Đối với Phụ huynh:</strong> Cùng con em thiết lập "Mật khẩu gia đình" (Secret Word) để xác minh các cuộc gọi khẩn cấp, tạo tâm lý tin cậy để con sẵn sàng chia sẻ khi gặp rủi ro trên mạng.
                  </div>
                  <div className="p-3 rounded-xl bg-[#101C32] border border-slate-800">
                    <strong className="text-emerald-400">Đối với Học sinh:</strong> Luôn ghi nhớ nguyên tắc: "Nhìn thấy chưa chắc là sự thật. Dừng lại 30 giây để kiểm chứng trước khi tin hoặc chia sẻ".
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'refs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono uppercase text-[#55DDF2] font-bold">TÀI LIỆU THAM KHẢO</span>
                <h3 className="text-xl font-bold text-white mt-0.5">Danh Mục Tài Liệu Tham Khảo Chính Thống</h3>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <p>[1] Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam (2016), <em>Luật Trẻ em số 102/2016/QH13</em>, NXB Chính trị Quốc gia Sự thật.</p>
                <p>[2] Quốc hội nước Cộng hòa Xã hội Chủ nghĩa Việt Nam (2018), <em>Luật An ninh mạng số 24/2018/QH14</em>, NXB Tư pháp.</p>
                <p>[3] Cục An toàn thông tin - Bộ Thông tin và Truyền thông (2023), <em>Cẩm nang Nhận diện và Phòng chống Lừa đảo trực tuyến trên không gian mạng</em>, Hà Nội.</p>
                <p>[4] Cục Trẻ em - Bộ Lao động, Thương binh và Xã hội (2024), <em>Tài liệu Hướng dẫn bảo vệ trẻ em trên môi trường mạng và hoạt động của Tổng đài Quốc gia 111</em>, Hà Nội.</p>
                <p>[5] UNESCO (2022), <em>Media and Information Literacy Curriculum for Educators and Learners</em>, UNESCO Publishing.</p>
                <p>[6] MIT Media Lab (2023), <em>Detect Fakes: How to Spot Deepfake Video and Synthetic Audio</em>, Massachusetts Institute of Technology.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

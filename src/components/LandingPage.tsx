import React, { useState } from 'react';
import { ActiveTab, AuthUser } from '../types';

interface LandingPageProps {
  onTabChange: (tab: ActiveTab) => void;
  currentUser: AuthUser | null;
  aiConfigured: boolean | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onTabChange,
  currentUser,
  aiConfigured,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStartScan = (targetTab: ActiveTab = 'scanner') => {
    if (currentUser) {
      onTabChange(targetTab);
    } else {
      try {
        sessionStorage.setItem('dfscanner_next_tab', targetTab);
      } catch {}
      onTabChange('login');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Hệ thống có lưu trữ ảnh hoặc video tải lên của tôi không?',
      a: 'Tuyệt đối không. Hệ thống tuân thủ chính sách quyền riêng tư nghiêm ngặt: hình ảnh và khung hình video chỉ được nén tạm thời trên bộ nhớ đệm trình duyệt để đối chiếu và không bao giờ được lưu vĩnh viễn trong cơ sở dữ liệu.',
    },
    {
      q: 'Hệ thống kiểm tra liên kết (Link Scanner) có bị lộ thông tin khi bấm quét không?',
      a: 'Không. Máy quét liên kết hoạt động theo nguyên tắc Zero-SSRF (Server-Side Request Forgery Safe): phân tích cú pháp tĩnh, cấu trúc tên miền, chứng chỉ và các mẫu tấn công đã biết mà không thực thi mã JavaScript độc hại hay gửi cookie người dùng ra ngoài.',
    },
    {
      q: 'Học sinh THCS và phụ huynh có phải trả phí để sử dụng không?',
      a: 'Không. Toàn bộ nền tảng được phát triển phục vụ đề tài nghiên cứu khoa học an toàn số học đường, hoàn toàn miễn phí, không thu phí và không có quảng cáo thương mại.',
    },
    {
      q: 'Nếu lỡ gửi tiền hoặc bị kẻ xấu tống tiền bằng ảnh ghép Deepfake thì phải làm gì?',
      a: 'Hãy lập tức giữ bình tĩnh, chụp ảnh màn hình lưu bằng chứng, không làm theo lời đe dọa, chia sẻ ngay với cha mẹ/thầy cô và gọi đến Tổng đài Quốc gia Bảo vệ Trẻ em 111 hoặc đầu số 156/5656.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 5.1 Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.22),rgba(255,255,255,0))]" />

        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ĐỀ TÀI NGHIÊN CỨU KHOA HỌC — BẢO VỆ HỌC SINH THCS TRƯỚC DEEPFAKE & LỪA ĐẢO SỐ
          </div>

          {/* Heading (Exact copy requirement from Section 5.1) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Nhận diện dấu hiệu giả mạo.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Bảo vệ bạn trong thế giới số.
            </span>
          </h1>

          {/* Description (Exact copy requirement from Section 5.1) */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Phân tích tín hiệu đáng ngờ trong nội dung số, kiểm tra liên kết và tìm hiểu cách phòng tránh lừa đảo trực tuyến với sự hỗ trợ của AI.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleStartScan('scanner')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-base shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Bắt đầu quét</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => scrollToSection('features')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl text-base border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Khám phá tính năng</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-white">4 Lớp</div>
              <div className="text-xs text-slate-400 mt-0.5">Phân tích đa chiều</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">Zero-SSRF</div>
              <div className="text-xs text-slate-400 mt-0.5">Kiểm tra link bảo vệ tuyệt đối</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">111 & 156</div>
              <div className="text-xs text-slate-400 mt-0.5">Đường dây nóng quốc gia</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">100% Free</div>
              <div className="text-xs text-slate-400 mt-0.5">Phi lợi nhuận vì học đường</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tool Launcher Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#142036] border border-blue-500/20 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white">Khu Vực Phân Tích Nhanh</h2>
              <p className="text-xs text-slate-400 mt-0.5">Chọn loại nội dung bạn cần kiểm tra an toàn:</p>
            </div>
            {currentUser && (
              <button
                onClick={() => onTabChange('app')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                Vào Không Gian Thành Viên →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleStartScan('scanner')}
              className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60 hover:border-blue-500/50 hover:bg-[#121f36] transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Quét Ảnh & Khung Hình Video
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Phát hiện khuôn mặt cắt ghép, ánh sáng bất thường, mạo danh.
              </div>
            </button>

            <button
              onClick={() => handleStartScan('link-scanner')}
              className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60 hover:border-indigo-500/50 hover:bg-[#121f36] transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                Quét Liên Kết & Web Độc Hại
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Kiểm tra link rút gọn, tên miền mạo danh, Zero-SSRF an toàn tuyệt đối.
              </div>
            </button>

            <button
              onClick={() => handleStartScan('safebot')}
              className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60 hover:border-purple-500/50 hover:bg-[#121f36] transition text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Trợ Lý SafeBot AI 24/7
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Hỏi đáp cách ứng xử khi bị đe dọa, tống tiền hoặc nghi ngờ lừa đảo.
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Tính năng cốt lõi</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Bộ Công Cụ Phòng Vệ Toàn Diện Cho Học Đường
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-400">
            Kết hợp trí tuệ nhân tạo Gemini đa phương thức và quy tắc an toàn thông tin chuyên sâu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Deepfake & Video Scanner */}
          <div className="bg-[#142036] border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Quét Ảnh & Khung Hình Video</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Rà soát các bất thường thị giác: đồng tử không đều, biên mặt mờ nhòe, ánh sáng phi lý, văn bản cắt ghép và thủ đoạn mạo danh người thân.
              </p>
            </div>
            <button
              onClick={() => handleStartScan('scanner')}
              className="mt-6 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              Mở máy quét ảnh →
            </button>
          </div>

          {/* Card 2: Link Scanner */}
          <div className="bg-[#142036] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Máy Quét Liên Kết & Lừa Đảo</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Phát hiện liên kết giả mạo ngân hàng, mạng xã hội, tên miền đồng hình Punycode, link rút gọn giấu mặt và lộ mã OTP nguy hiểm.
              </p>
            </div>
            <button
              onClick={() => handleStartScan('link-scanner')}
              className="mt-6 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              Kiểm tra đường link →
            </button>
          </div>

          {/* Card 3: SafeBot AI */}
          <div className="bg-[#142036] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">SafeBot — Trợ Lý An Toàn 24/7</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Tư vấn tâm lý, hướng dẫn bình tĩnh khi gặp tin nhắn đe dọa, tống tiền bằng ảnh ghép và hướng dẫn liên hệ cha mẹ, thầy cô đúng cách.
              </p>
            </div>
            <button
              onClick={() => handleStartScan('safebot')}
              className="mt-6 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              Trò chuyện cùng SafeBot →
            </button>
          </div>
        </div>
      </section>

      {/* 5.2 Section: Giới hạn của AI & Tính trung thực khoa học */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#111c30] border border-amber-500/30 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-base md:text-lg font-bold text-amber-300 uppercase tracking-wide">
              Minh Bạch Giới Hạn Của Trí Tuệ Nhân Tạo (AI Limitations)
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Hệ thống sử dụng mô hình đa phương thức để phát hiện các tín hiệu bất thường trong ảnh, video và văn bản. Tuy nhiên:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-slate-300">
            <li className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Không Phải Kết Luận Pháp Lý:</strong>
              Kết quả phân tích có giá trị cảnh báo sớm và giáo dục kỹ năng số, không thay thế cơ quan giám định tư pháp hoặc điều tra công an.
            </li>
            <li className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Không Bảo Đảm Tuyệt Đối 100%:</strong>
              Kết quả “Chưa phát hiện dấu hiệu bất thường” không đồng nghĩa với việc nội dung là thật 100%. Kẻ xấu liên tục cập nhật thủ đoạn tinh vi.
            </li>
            <li className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-white block mb-1">Luôn Xác Minh Độc Lập:</strong>
              Khi có yêu cầu liên quan đến tiền bạc hoặc thông tin cá nhân, luôn gọi điện thoại SIM truyền thống cho người thân để xác minh.
            </li>
          </ul>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-b from-[#131d33] to-[#0f172a] border border-slate-800 rounded-3xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Quy trình đơn giản</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
              3 Bước Sử Dụng Dễ Dàng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Tải lên hoặc Dán Link</h4>
              <p className="text-xs md:text-sm text-slate-400">
                Chọn ảnh chụp màn hình tin nhắn, cuộc gọi video hoặc dán địa chỉ liên kết cần kiểm tra.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Phân Tích Đa Chiều</h4>
              <p className="text-xs md:text-sm text-slate-400">
                Hệ thống rà soát dấu hiệu thị giác, kịch bản đòi tiền khẩn cấp, mã OTP và nguy cơ bắt nạt học đường.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 font-extrabold text-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/10">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Hành Động An Toàn</h4>
              <p className="text-xs md:text-sm text-slate-400">
                Thực hiện 4 bước Dừng lại - Kiểm chứng - Bảo vệ - Báo cáo để không bị lừa gạt hoặc tổn thất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guide Section */}
      <section id="safety-guide" className="max-w-6xl mx-auto px-4">
        <div className="bg-[#142036] border border-blue-500/20 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                CẨM NANG HỌC SINH & PHỤ HUYNH
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white">
                Quy Tắc 4 Bước Xử Lý Khi Nghi Ngờ Deepfake & Lừa Đảo
              </h3>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                Được đúc kết từ khảo sát thực tế và nghiên cứu khoa học an toàn số trường học.
              </p>
            </div>
            <button
              onClick={() => onTabChange('academy')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer"
            >
              Xem Cẩm Nang Chi Tiết →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60">
              <div className="text-rose-400 font-bold text-xs uppercase mb-1">Bước 1: DỪNG LẠI (STOP)</div>
              <p className="text-xs text-slate-300">Không chuyển tiền, không bấm link, không cung cấp mã OTP và không hoảng sợ.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60">
              <div className="text-amber-400 font-bold text-xs uppercase mb-1">Bước 2: KIỂM CHỨNG (CHECK)</div>
              <p className="text-xs text-slate-300">Gọi điện thoại thông thường bằng số SIM danh bạ hoặc hỏi người thân đang ở cạnh.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60">
              <div className="text-blue-400 font-bold text-xs uppercase mb-1">Bước 3: BẢO VỆ (PROTECT)</div>
              <p className="text-xs text-slate-300">Bật xác thực 2 lớp (2FA), đặt mật khẩu gia đình bí mật, không gửi ảnh riêng tư.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0e1728] border border-slate-700/60">
              <div className="text-emerald-400 font-bold text-xs uppercase mb-1">Bước 4: BÁO CÁO (REPORT)</div>
              <p className="text-xs text-slate-300">Nói ngay với cha mẹ, thầy cô, báo cáo tài khoản và gọi Tổng đài 111 (miễn phí).</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5.2 Section: Chính sách quyền riêng tư */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-[#142036] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-3">
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Chính Sách Bảo Vệ Quyền Riêng Tư & An Toàn Dữ Liệu
          </h3>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Chúng tôi cam kết tôn trọng tuyệt đối quyền riêng tư của học sinh, phụ huynh và giáo viên:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Không Lưu Ảnh Riêng Tư:</strong>
              Các tệp tải lên chỉ xử lý tạm trong phiên quét và không lưu trữ trên máy chủ database.
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Zero-SSRF An Toàn:</strong>
              Máy chủ không bao giờ gửi yêu cầu HTTP trực tiếp đến các URL nguy hiểm mà người dùng kiểm tra.
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800">
              <strong className="text-slate-200 block mb-0.5">Bảo Mật Phiên HttpOnly:</strong>
              Phiên đăng nhập được mã hóa và bảo vệ bằng cookie HttpOnly, không lưu token nhạy cảm trong localStorage.
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-white">Câu Hỏi Thường Gặp</h3>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Giải đáp các thắc mắc về bảo mật và cách vận hành</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="border border-slate-800 rounded-xl overflow-hidden bg-[#142036]">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-blue-300 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-slate-400 shrink-0">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs md:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

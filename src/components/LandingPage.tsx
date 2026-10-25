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

  const handleStartNow = () => {
    if (currentUser) {
      onTabChange('app');
    } else {
      // Store redirect intent and route to login
      try {
        sessionStorage.setItem('dfscanner_next_tab', 'app');
      } catch {}
      onTabChange('login');
    }
  };

  const handleDirectScan = (tab: ActiveTab) => {
    if (currentUser) {
      onTabChange(tab);
    } else {
      try {
        sessionStorage.setItem('dfscanner_next_tab', tab);
      } catch {}
      onTabChange('login');
    }
  };

  const faqs = [
    {
      q: 'Hệ thống có tải ảnh hoặc đường link của tôi lên các máy chủ công cộng không?',
      a: 'Tuyệt đối không. Hệ thống phân tích hình ảnh và liên kết một cách bảo mật. Chúng tôi không lưu trữ ảnh riêng tư trong cơ sở dữ liệu và không bao giờ gửi yêu cầu HTTP trực tiếp đến các đường link nghi ngờ (chính sách Zero-SSRF an toàn).',
    },
    {
      q: 'Học sinh THCS có phải trả phí để sử dụng Trung tâm An toàn Số không?',
      a: 'Không. Toàn bộ nền tảng được phát triển phục vụ đề tài nghiên cứu khoa học an toàn số học đường, hoàn toàn miễn phí và không có quảng cáo thương mại.',
    },
    {
      q: 'Nếu lỡ gửi tiền hoặc bị kẻ xấu tống tiền bằng ảnh ghép Deepfake thì phải làm gì?',
      a: 'Hãy lập tức giữ bình tĩnh, chụp ảnh màn hình lưu bằng chứng, không làm theo lời đe dọa, chia sẻ ngay với cha mẹ/thầy cô và gọi đến Tổng đài Quốc gia Bảo vệ Trẻ em 111 (miễn phí 24/7).',
    },
    {
      q: 'Hệ thống hỗ trợ những định dạng tệp và nội dung nào?',
      a: 'Hệ thống hỗ trợ ảnh PNG, JPG, WEBP, trích xuất khung hình video ngắn (video frame sampling), văn bản tin nhắn nghi ngờ lừa đảo, bài đăng mạng xã hội và đường link trang web.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.22),rgba(255,255,255,0))]" />
        
        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/25 mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ĐỀ TÀI NGHIÊN CỨU KHOA HỌC — BẢO VỆ HỌC SINH THCS TRƯỚC DEEPFAKE & LỪA ĐẢO SỐ
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Trung Tâm Nhận Diện{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Deepfake & An Toàn Số
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Nền tảng hỗ trợ học sinh, phụ huynh và nhà trường phát hiện hình ảnh AI giả mạo, bẫy lừa đảo tin nhắn, đường link độc hại và cung cấp quy trình bảo vệ bản thân 4 bước.
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartNow}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-base shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentUser ? 'Vào Không Gian Thành Viên' : 'Bắt Đầu Ngay (Miễn Phí)'}</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={() => onTabChange('how-it-works')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold rounded-xl text-base border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Cách Hoạt Động & Quy Trình</span>
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
              <div className="text-xs text-slate-400 mt-0.5">Kiểm tra link tuyệt đối an toàn</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">111 & 156</div>
              <div className="text-xs text-slate-400 mt-0.5">Đường dây nóng quốc gia</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">100% Free</div>
              <div className="text-xs text-slate-400 mt-0.5">Giáo dục vì cộng đồng</div>
            </div>
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
              onClick={() => handleDirectScan('scanner')}
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
              onClick={() => handleDirectScan('link-scanner')}
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
              onClick={() => handleDirectScan('safebot')}
              className="mt-6 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              Trò chuyện cùng SafeBot →
            </button>
          </div>
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

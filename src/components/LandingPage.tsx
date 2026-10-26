import React, { useState } from 'react';
import { ActiveTab, AuthUser } from '../types';
import { DEFAULT_SITE_CONFIG, SiteConfig } from '../lib/siteConfig';

interface LandingPageProps {
  onTabChange: (tab: ActiveTab) => void;
  currentUser: AuthUser | null;
  aiConfigured: boolean | null;
  siteConfig?: SiteConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onTabChange,
  currentUser,
  aiConfigured,
  siteConfig = DEFAULT_SITE_CONFIG,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Guarding is handled centrally by the router (App.tsx): signed-out visitors land on
  // /login?next=<tool> and return to the chosen tool after signing in.
  const handleStartScan = (targetTab: ActiveTab = 'app') => {
    onTabChange(targetTab);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  const faqs = [
    {
      q: siteConfig.faqQ1,
      a: siteConfig.faqA1,
    },
    {
      q: siteConfig.faqQ2,
      a: siteConfig.faqA2,
    },
    {
      q: siteConfig.faqQ3,
      a: siteConfig.faqA3,
    },
    {
      q: siteConfig.faqQ4,
      a: siteConfig.faqA4,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {siteConfig.announcementEnabled && siteConfig.announcementText.trim() && (
        <div role="status" className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-xl border bg-white/[0.04] px-4 py-3 text-sm" style={{ borderColor: siteConfig.accentColor, color: siteConfig.accentColor }}>{siteConfig.announcementText}</div>
        </div>
      )}
      {/* Cinematic hero: pure CSS/SVG layers (no heavy image or video, so it loads instantly) */}
      {siteConfig.showHero && (
      <section className="df-hero relative isolate overflow-hidden min-h-[calc(100dvh-4rem)] md:min-h-[calc(92dvh-4rem)] flex items-center -mt-16 pt-16 border-b border-white/5" aria-labelledby="hero-title">
        <div className="df-hero-bg absolute inset-0 -z-10" aria-hidden="true">
          <div className="df-hero-glow absolute inset-0" />
          <div className="df-hero-grid absolute inset-x-0 bottom-0 h-[55%]" />
          <svg className="df-hero-net absolute inset-0 w-full h-full" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" fill="none">
            <defs>
              <linearGradient id="dfLine" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#55DDF2" stopOpacity="0.0" />
                <stop offset="0.5" stopColor="#55DDF2" stopOpacity="0.55" />
                <stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
              <radialGradient id="dfNode"><stop offset="0" stopColor="#bff6ff" /><stop offset="1" stopColor="#55DDF2" stopOpacity="0" /></radialGradient>
            </defs>
            <g stroke="url(#dfLine)" strokeWidth="1">
              <path d="M-20 520 C 220 420, 360 560, 560 430 S 900 300, 1220 380" />
              <path d="M-20 420 C 180 330, 400 420, 600 300 S 940 180, 1220 250" />
              <path d="M120 700 C 260 560, 480 600, 700 470 S 1000 420, 1220 520" />
              <path d="M300 -10 C 380 140, 520 120, 640 220 S 880 160, 960 -10" />
            </g>
            <g fill="url(#dfNode)">
              <circle cx="560" cy="430" r="14" /><circle cx="600" cy="300" r="12" /><circle cx="700" cy="470" r="10" />
              <circle cx="360" cy="560" r="9" /><circle cx="900" cy="300" r="11" /><circle cx="640" cy="220" r="9" />
            </g>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-[#050a14]/70 via-transparent to-[#050a14]" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 text-center">
          <p className="text-[11px] sm:text-xs font-semibold tracking-[0.35em] " style={{ color: siteConfig.accentColor }}>{siteConfig.heroEyebrow}</p>
          <h1 id="hero-title" className="mt-5 text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] text-balance">
            {siteConfig.heroTitle}<br />
            <span style={{ color: siteConfig.accentColor }}>{siteConfig.heroAccentTitle}</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300/90 max-w-2xl mx-auto leading-relaxed">
            {siteConfig.heroDescription}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => handleStartScan('app')}
              style={{ backgroundColor: siteConfig.accentColor }} className="w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-xl text-[#06101d] font-bold text-base shadow-lg hover:brightness-110 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a14] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {siteConfig.primaryCtaLabel}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-slate-200 font-semibold text-base border border-white/15 hover:border-white/40 hover:bg-white/5 active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]"
            >
              {siteConfig.secondaryCtaLabel}
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500">AI chỉ hỗ trợ phân tích và có thể sai sót — kết quả cần được đối chiếu thêm.</p>
        </div>
      </section>
      )}

      {/* Intro + three illustrative blocks (informational only: no live tools on the public page) */}
      {siteConfig.showAbout && (
      <section id="about" className="max-w-6xl mx-auto px-4 scroll-mt-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.3em] " style={{ color: siteConfig.accentColor }}>{siteConfig.aboutEyebrow}</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-white">{siteConfig.aboutTitle}</h2>
          <p className="mt-3 text-slate-400 leading-relaxed">{siteConfig.aboutDescription}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: siteConfig.introCard1Title, d: siteConfig.introCard1Description, icon: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z' },
            { t: siteConfig.introCard2Title, d: siteConfig.introCard2Description, icon: 'M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1m2 6a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1' },
            { t: siteConfig.introCard3Title, d: siteConfig.introCard3Description, icon: 'M12 3l9 4-9 4-9-4 9-4zm-5 8v4c0 1.5 2.2 3 5 3s5-1.5 5-3v-4' },
          ].map((item) => (
            <div key={item.t} className="df-card group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
              <div className="w-11 h-11 rounded-xl border border-[#55DDF2]/30 bg-[#55DDF2]/10 text-[#55DDF2] flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.icon} /></svg>
              </div>
              <h3 className="font-bold text-white">{item.t}</h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>
      )}

      {siteConfig.showFeatures && (
      <section id="features" className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: siteConfig.accentColor }}>{siteConfig.featuresEyebrow}</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            {siteConfig.featuresTitle}
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-400">
            {siteConfig.featuresDescription}
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
              <h3 className="text-lg font-bold text-white mb-2">{siteConfig.feature1Title}</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {siteConfig.feature1Description}
              </p>
            </div>
            <button
              onClick={() => handleStartScan('scanner')}
              className="mt-6 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              {siteConfig.feature1ActionLabel}
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
              <h3 className="text-lg font-bold text-white mb-2">{siteConfig.feature2Title}</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {siteConfig.feature2Description}
              </p>
            </div>
            <button
              onClick={() => handleStartScan('link-scanner')}
              className="mt-6 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              {siteConfig.feature2ActionLabel}
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
              <h3 className="text-lg font-bold text-white mb-2">{siteConfig.feature3Title}</h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {siteConfig.feature3Description}
              </p>
            </div>
            <button
              onClick={() => handleStartScan('safebot')}
              className="mt-6 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              {siteConfig.feature3ActionLabel}
            </button>
          </div>
        </div>
      </section>
      )}

      {/* 5.2 Section: Giới hạn của AI & Tính trung thực khoa học */}
      {siteConfig.showAiLimitations && (
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
      )}

      {/* How it Works Section */}
      {siteConfig.showHowItWorks && (
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
      )}

      {/* Safety Guide Section */}
      {siteConfig.showSafetyGuide && (
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
      )}

      {/* 5.2 Section: Chính sách quyền riêng tư */}
      {siteConfig.showPrivacy && (
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
      )}

      {/* FAQ Section */}
      {siteConfig.showFaq && (
      <section className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-white">{siteConfig.faqTitle}</h3>
          <p className="text-xs md:text-sm text-slate-400 mt-1">{siteConfig.faqDescription}</p>
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
      )}
    </div>
  );
};

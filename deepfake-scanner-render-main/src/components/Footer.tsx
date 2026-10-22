import React from 'react';
import { Shield, PhoneCall, ExternalLink, HeartHandshake, Lock } from 'lucide-react';
import { ActiveTab } from '../types';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  return (
    <footer className="bg-[#0b1322] border-t border-[#172941] text-slate-400 text-xs mt-16">
      {/* 4-Step Quick Action Banner */}
      <div className="bg-[#172941]/70 border-b border-[#1f3554] py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#55DDF2]/10 border border-[#55DDF2]/30 flex items-center justify-center text-[#55DDF2]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">QUY TRÌNH AN TOÀN SỐ 4 BƯỚC CHO HỌC SINH THCS</p>
              <p className="text-[#A9D8F0] text-xs">Hãy biến 4 bước này thành phản xạ tự nhiên khi gặp bất kỳ thông tin bất thường nào</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center text-xs">
            <span className="px-3 py-1.5 rounded bg-[#101C32] border border-slate-700 text-slate-200 font-semibold">1. DỪNG LẠI</span>
            <span className="text-[#55DDF2]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#101C32] border border-slate-700 text-slate-200 font-semibold">2. KIỂM CHỨNG</span>
            <span className="text-[#55DDF2]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#101C32] border border-slate-700 text-slate-200 font-semibold">3. BẢO VỆ</span>
            <span className="text-[#55DDF2]">→</span>
            <span className="px-3 py-1.5 rounded bg-[#CF5B65]/20 border border-[#CF5B65]/40 text-[#CF5B65] font-semibold">4. BÁO CÁO</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About Project */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#55DDF2]/20 flex items-center justify-center text-[#55DDF2]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-sm tracking-wide">DEEPFAKE SCANNER</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Sản phẩm đề tài nghiên cứu khoa học: <strong>"Giải pháp giúp học sinh trung học cơ sở tránh một số tác động rủi ro từ Deepfake khi sử dụng mạng xã hội"</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              Định hướng: Nghiên cứu ứng dụng, bảo vệ quyền trẻ em trên không gian mạng và phát triển năng lực tư duy phản biện số.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#55DDF2]">Hệ thống phân hệ</p>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => onTabChange('scanner')} className="hover:text-white transition-colors">
                  AI Scanner (Phân tích tệp hình ảnh/video)
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('evidence-lab')} className="hover:text-white transition-colors">
                  Phòng kiểm chứng thông tin (Evidence Lab)
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('simulator')} className="hover:text-white transition-colors">
                  Mô phỏng tình huống (Safety Simulator)
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('safebot')} className="hover:text-white transition-colors">
                  Trợ lý an toàn số SafeBot AI
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('research')} className="hover:text-white transition-colors">
                  Trung tâm dữ liệu & Khảo sát học sinh
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('report')} className="hover:text-white transition-colors">
                  Báo cáo nghiên cứu khoa học đề tài
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hotlines */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#55DDF2]">Kênh hỗ trợ khẩn cấp</p>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#172941]/50 border border-[#1f3554]">
                <div className="flex items-center gap-2 font-bold text-white">
                  <PhoneCall className="w-3.5 h-3.5 text-[#55DDF2]" />
                  <span>Tổng đài 111 (Miễn phí 24/7)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Tổng đài Quốc gia Bảo vệ Trẻ em tại Việt Nam</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#172941]/50 border border-[#1f3554]">
                <div className="flex items-center gap-2 font-bold text-white">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tổng đài 156 (Bộ TT&TT)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Tiếp nhận phản ánh cuộc gọi rác, tin nhắn lừa đảo</p>
              </div>
            </div>
          </div>

          {/* Col 4: Privacy & AI Disclaimer */}
          <div className="space-y-2">
            <p className="font-semibold text-white uppercase tracking-wider text-[11px] text-[#55DDF2]">Nguyên tắc & Cam kết</p>
            <div className="p-3 rounded-lg bg-[#172941]/40 border border-[#1f3554] space-y-1.5 text-[10px] leading-relaxed text-slate-300">
              <div className="flex items-center gap-1.5 text-[#41866C] font-semibold">
                <Lock className="w-3 h-3" />
                <span>Bảo vệ quyền riêng tư</span>
              </div>
              <p>
                Nếu tạo tài khoản, hệ thống lưu email, tên hiển thị và tóm tắt lịch sử quét để cung cấp hồ sơ. Ảnh/tin nhắn gốc không được lưu trong lịch sử tài khoản; người dùng có thể xóa lịch sử đã lưu.
              </p>
              <div className="pt-1 border-t border-slate-700/50 text-[10px] text-amber-300/90">
                <strong>Giới hạn của AI:</strong> Kết quả AI chỉ mang tính tham khảo kỹ thuật, không thay thế việc kiểm chứng nguồn độc lập.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="mt-8 pt-6 border-t border-[#172941] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 DEEPFAKE SCANNER — Nền tảng Nghiên cứu Khoa học Ứng dụng & Giáo dục An toàn Số.</p>
          <div className="flex items-center gap-4 text-[10px]">
            <span>Phiên bản v2.6.4-Production</span>
            <span>·</span>
            <span>Hỗ trợ giáo dục THCS</span>
            <span>·</span>
            <button onClick={() => onTabChange('emergency')} className="text-[#CF5B65] hover:underline font-medium">
              Hướng dẫn ứng phó khẩn
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

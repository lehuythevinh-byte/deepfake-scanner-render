import React from 'react';
import { Shield, PhoneCall, Lock, ScanSearch, Bot, Clock, UserRound, ShieldAlert } from 'lucide-react';
import { ActiveTab } from '../types';
import { DEFAULT_SITE_CONFIG, SiteConfig } from '../lib/siteConfig';

interface FooterProps {
  onTabChange: (tab: ActiveTab) => void;
  signedIn?: boolean;
  siteConfig?: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, signedIn = false, siteConfig = DEFAULT_SITE_CONFIG }) => (
  <footer className="mt-16 border-t border-[#172941] bg-[#081321] text-xs text-slate-400">
    <div className="border-b border-[#1f3554] bg-gradient-to-r from-[#10243b] via-[#10283a] to-[#14213a] px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200"><Shield size={20}/></span>
          <div><p className="text-sm font-bold text-white">Đừng vội tin. Hãy kiểm tra.</p><p className="mt-1 text-[11px] text-slate-400">Phân tích dấu hiệu · Đối chiếu nguồn · Bảo vệ dữ liệu</p></div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold">
          <span className="rounded-lg border border-slate-700 bg-[#0b192a] px-3 py-2 text-slate-200">1. Dừng lại</span><span className="text-cyan-300">→</span>
          <span className="rounded-lg border border-slate-700 bg-[#0b192a] px-3 py-2 text-slate-200">2. Kiểm tra</span><span className="text-cyan-300">→</span>
          <span className="rounded-lg border border-slate-700 bg-[#0b192a] px-3 py-2 text-slate-200">3. Xác minh</span><span className="text-cyan-300">→</span>
          <span className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-rose-200">4. Ứng phó</span>
        </div>
      </div>
    </div>
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-9 sm:px-6 md:grid-cols-4 lg:px-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200"><ShieldAlert size={16}/></span><span className="text-sm font-bold tracking-wide text-white">{siteConfig.siteName}</span></div>
        <p className="text-[11px] leading-5 text-slate-400">Nền tảng hỗ trợ phân tích nội dung số, sàng lọc dấu hiệu giả mạo và hướng dẫn xác minh rủi ro trực tuyến.</p>
      </div>
      <div className="space-y-2">
        <p className="font-semibold uppercase tracking-wider text-[11px] text-cyan-200">Không gian làm việc</p>
        {signedIn ? <div className="flex flex-col items-start gap-2 text-[11px]">
          <button onClick={() => onTabChange('scanner')} className="inline-flex items-center gap-2 hover:text-white"><ScanSearch size={13}/> Content Analysis</button>
          <button onClick={() => onTabChange('safety-center')} className="inline-flex items-center gap-2 hover:text-white"><Bot size={13}/> Safety Center</button>
          <button onClick={() => onTabChange('history')} className="inline-flex items-center gap-2 hover:text-white"><Clock size={13}/> Scan History</button>
          <button onClick={() => onTabChange('account')} className="inline-flex items-center gap-2 hover:text-white"><UserRound size={13}/> User Account</button>
        </div> : <div className="space-y-2"><p className="text-[11px]">Đăng nhập để sử dụng workspace và lưu lịch sử kiểm tra theo tài khoản.</p><button onClick={() => onTabChange('register')} className="text-[11px] font-semibold text-cyan-200 hover:underline">Tạo tài khoản →</button></div>}
      </div>
      <div className="space-y-2">
        <p className="font-semibold uppercase tracking-wider text-[11px] text-cyan-200">Hỗ trợ khẩn cấp</p>
        <div className="rounded-xl border border-slate-700 bg-[#0d1a2b] p-3"><div className="flex items-center gap-2 font-bold text-white"><PhoneCall className="h-3.5 w-3.5 text-cyan-300"/>Tổng đài 111</div><p className="mt-1 text-[10px] text-slate-400">Tổng đài Quốc gia Bảo vệ Trẻ em tại Việt Nam.</p><button onClick={() => onTabChange('safety-center')} className="mt-2 text-[10px] font-semibold text-cyan-200 hover:underline">Mở hướng dẫn an toàn →</button></div>
      </div>
      <div className="space-y-2">
        <p className="font-semibold uppercase tracking-wider text-[11px] text-cyan-200">Quyền riêng tư & giới hạn</p>
        <div className="rounded-xl border border-slate-700 bg-[#0d1a2b] p-3 text-[10px] leading-5 text-slate-300"><div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-200"><Lock size={12}/> Kiểm soát dữ liệu</div><p>Không gửi nội dung tới nhà cung cấp AI nếu chưa có thông báo và sự đồng ý phù hợp ở chức năng đó. Hãy xóa hoặc che thông tin cá nhân không cần thiết trước khi phân tích.</p><p className="mt-2 border-t border-slate-700 pt-2 text-amber-200">Kết quả là sàng lọc hỗ trợ xác minh, không phải chứng nhận thật/giả hoặc kết luận pháp lý.</p></div>
      </div>
    </div>
    <div className="border-t border-[#172941] px-4 py-4 text-center text-[10px] text-slate-500">© 2026 {siteConfig.siteName} · Advanced Digital Trust & Safety Platform · V5 workspace</div>
  </footer>
);

import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { EMERGENCY_GUIDES } from '../data/emergencyGuideData';
import { 
  AlertTriangle, 
  PhoneCall, 
  ShieldAlert, 
  XCircle, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Camera, 
  HeartHandshake,
  ArrowRight
} from 'lucide-react';

interface EmergencyModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const EmergencyModule: React.FC<EmergencyModuleProps> = ({ onTabChange }) => {
  const [activeGuideId, setActiveGuideId] = useState<string>(EMERGENCY_GUIDES[0].id);

  const selectedGuide = EMERGENCY_GUIDES.find((g) => g.id === activeGuideId) || EMERGENCY_GUIDES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Critical Alert Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#CF5B65]/20 via-[#172941] to-[#101C32] border border-[#CF5B65]/40 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#CF5B65] uppercase tracking-wider font-mono">
          <AlertTriangle className="w-4 h-4 animate-pulse" />
          <span>HƯỚNG DẪN ỨNG PHÓ KHẨN CẤP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Nếu Điều Đó Xảy Ra Với Bạn, Hãy Làm Gì?</h1>
        <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
          Hãy giữ bình tĩnh! Em không hề đơn độc. Khi gặp phải các tình huống bị mạo danh, đe dọa hay tống tiền bằng hình ảnh cắt ghép Deepfake, hãy tuân theo các chỉ dẫn dưới đây để bảo vệ an toàn tối đa cho bản thân.
        </p>

        {/* Hotlines summary buttons */}
        <div className="pt-2 flex flex-wrap gap-3">
          <a
            href="tel:111"
            className="px-4 py-2 rounded-xl bg-[#CF5B65] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#CF5B65]/30 hover:brightness-110 transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Gọi 111 (Tổng đài Bảo vệ Trẻ em - Miễn phí)</span>
          </a>
          <a
            href="tel:156"
            className="px-4 py-2 rounded-xl bg-[#172941] text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-2 hover:bg-[#1f3554] transition-all"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Gọi 156 (Phản ánh Cuộc gọi lừa đảo)</span>
          </a>
        </div>
      </div>

      {/* Scenario Selector Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {EMERGENCY_GUIDES.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setActiveGuideId(guide.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeGuideId === guide.id
                ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-lg text-white'
                : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
              guide.urgencyLevel === 'critical'
                ? 'bg-[#CF5B65]/20 text-[#CF5B65]'
                : guide.urgencyLevel === 'high'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-blue-500/20 text-blue-300'
            }`}>
              Mức độ: {guide.urgencyLevel === 'critical' ? 'Khẩn cấp' : guide.urgencyLevel === 'high' ? 'Rất cao' : 'Cần chú ý'}
            </span>
            <p className="text-xs sm:text-sm font-bold text-white mt-2 leading-snug">{guide.scenarioTitle}</p>
          </button>
        ))}
      </div>

      {/* Selected Crisis Guide Deep-Dive */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#172941]/90 border border-[#1f3554] space-y-8 text-xs sm:text-sm">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-[#55DDF2] tracking-wider">
            HƯỚNG DẪN CHI TIẾT
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{selectedGuide.scenarioTitle}</h2>
          <p className="text-xs text-slate-300 mt-2 bg-[#101C32] p-3 rounded-xl border border-slate-800 italic">
            "{selectedGuide.summary}"
          </p>
        </div>

        {/* 2-Column: What NOT to do VS Immediate Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* What NOT to do */}
          <div className="p-5 rounded-2xl bg-[#CF5B65]/10 border border-[#CF5B65]/30 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#CF5B65] flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Tuyệt đối KHÔNG nên làm:</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-200">
              {selectedGuide.doNotList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#CF5B65] font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Immediate Steps */}
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Các bước hành động ngay lập tức:</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-200">
              {selectedGuide.immediateSteps.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Support Channels for this scenario */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#55DDF2]" />
            <span>Kênh liên hệ hỗ trợ chính thức khuyến nghị:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedGuide.supportChannels.map((channel, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 space-y-1">
                <p className="font-bold text-white text-xs">{channel.name}</p>
                <p className="text-sm font-mono font-extrabold text-[#55DDF2]">{channel.contact}</p>
                <p className="text-[11px] text-slate-400">{channel.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Preservation Checklist Box */}
        <div className="p-5 rounded-2xl bg-[#101C32] border border-slate-700 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#55DDF2]" />
            <span>Hướng dẫn lưu giữ bằng chứng pháp lý an toàn:</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-[#172941] border border-slate-800">
              <span className="font-bold text-white block mb-1">1. Chụp ảnh màn hình đầy đủ</span>
              <p className="text-[11px] text-slate-400">Giữ nguyên ngày giờ, pin điện thoại, tên tài khoản người gửi và toàn bộ đoạn chat.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#172941] border border-slate-800">
              <span className="font-bold text-white block mb-1">2. Sao chép đường link URL</span>
              <p className="text-[11px] text-slate-400">Sao chép liên kết trang cá nhân (profile link) của đối tượng để tránh việc họ đổi tên hoặc chặn.</p>
            </div>
            <div className="p-3 rounded-lg bg-[#172941] border border-slate-800">
              <span className="font-bold text-white block mb-1">3. Lưu số tài khoản ngân hàng</span>
              <p className="text-[11px] text-slate-400">Nếu đối tượng gửi số tài khoản đòi tiền, hãy ghi lại tên ngân hàng, số tài khoản và tên chủ thẻ.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

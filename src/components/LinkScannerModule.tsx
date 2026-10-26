import React, { useState } from 'react';
import { ActiveTab, LinkScanResult } from '../types';

interface LinkScannerModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

const PRESET_URLS = [
  {
    label: 'Mạo danh ngân hàng (vcb-digibank-login.xyz)',
    url: 'https://vcb-digibank-login.xyz/verify-account',
    desc: 'Tên miền giả mạo Vietcombank kết hợp từ khóa nhạy cảm và TLD bất thường',
  },
  {
    label: 'Dụ bình chọn nhận quà (vote-idol-nhan-qua.tk)',
    url: 'https://vote-idol-nhan-qua.tk/nhan-thuong?otp=123456',
    desc: 'Chiêu trò câu bình chọn, để lộ tham số OTP và đuôi miền rủi ro cao',
  },
  {
    label: 'Rút gọn link giấu đích (bit.ly/qua-tang)',
    url: 'https://bit.ly/qua-tang-mien-phi-2026',
    desc: 'Ẩn tên miền thật, thường dẫn tới trang đánh cắp mật khẩu',
  },
  {
    label: 'Máy chủ IP thô (http://103.20.144.15/login)',
    url: 'http://103.20.144.15/login.html',
    desc: 'Dùng IP thô không có SSL/TLS để né danh sách đen DNS',
  },
  {
    label: 'Trang chuẩn an toàn (https://vietcombank.com.vn)',
    url: 'https://www.vietcombank.com.vn',
    desc: 'Tên miền tổ chức chính thống với chứng chỉ HTTPS hợp lệ',
  },
];

export const LinkScannerModule: React.FC<LinkScannerModuleProps> = ({ onTabChange }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LinkScanResult | null>(null);

  const handleScan = async (targetUrl?: string) => {
    const urlToScan = (targetUrl ?? inputUrl).trim();
    if (!urlToScan) {
      setError('Vui lòng nhập địa chỉ liên kết (URL) cần kiểm tra.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/link-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Không thể kiểm tra liên kết');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối khi quét liên kết.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: LinkScanResult['riskLevel']) => {
    switch (level) {
      case 'dangerous':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            CẢNH BÁO NGUY HIỂM
          </span>
        );
      case 'suspicious':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            ĐÁNG NGỜ — CẦN CẢNH GIÁC
          </span>
        );
      case 'safe':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            CHƯA THẤY DẤU HIỆU BẤT THƯỜNG
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            CHUYÊN MỤC KIỂM TRA ĐƯỜNG LINK & LIÊN KẾT ĐỘC HẠI
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Máy Quét Liên Kết & Cảnh Báo Lừa Đảo Trực Tuyến
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
            Phân tích tĩnh an toàn tuyệt đối (Zero-SSRF) các dấu hiệu mạo danh thương hiệu, tấn công ký tự đồng hình (Punycode), rút gọn link giấu mặt, địa chỉ IP thô và tham số nhạy cảm.
          </p>
        </div>
      </div>

      {/* Input Box & Presets */}
      <div className="bg-[#162238] border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="url-input" className="block text-sm font-medium text-slate-200">
            Nhập liên kết (URL) nhận được từ tin nhắn, bài đăng hoặc bình chọn:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                id="url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Ví dụ: https://bit.ly/nhan-thuong hoặc https://vcb-digibank-login.xyz"
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="w-full pl-11 pr-4 py-3 bg-[#0d1626] border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quét Liên Kết
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        {/* Presets for STEM educational practice */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Mẫu liên kết thực tế để học tập & thử nghiệm:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_URLS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(preset.url);
                  handleScan(preset.url);
                }}
                className="text-left p-3 rounded-xl bg-[#0e1728] border border-slate-700/50 hover:border-blue-500/50 hover:bg-[#131f36] transition-all group cursor-pointer"
              >
                <div className="text-xs font-semibold text-blue-300 group-hover:text-blue-200 line-clamp-1">
                  {preset.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {preset.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="bg-[#162238] border border-slate-700/60 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/60">
            <div>
              <div className="flex items-center gap-3">
                {getRiskBadge(result.riskLevel)}
                <span className="text-xs text-slate-400">
                  Điểm rủi ro: <strong className="text-white text-sm">{result.score}/100</strong>
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mt-2 break-all">
                {result.normalizedUrl}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `[Báo cáo quét liên kết Trung tâm An toàn Số]\nURL: ${result.normalizedUrl}\nTrạng thái: ${result.riskLevel}\nĐiểm rủi ro: ${result.score}/100\n${result.summary}`
                  );
                  alert('Đã sao chép kết quả quét vào bộ nhớ tạm.');
                }}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép báo cáo
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className={`p-4 rounded-xl border ${
            result.riskLevel === 'dangerous'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : result.riskLevel === 'suspicious'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="font-semibold text-sm mb-1">Đánh giá tổng quát:</div>
            <p className="text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Detailed Findings */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
              Các chỉ dấu phân tích chi tiết ({result.findings.length}):
            </h3>
            <div className="space-y-2.5">
              {result.findings.map((f, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    f.type === 'danger'
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                      : f.type === 'warning'
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                      : 'bg-slate-900/50 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {f.type === 'danger' ? (
                      <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : f.type === 'warning' ? (
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </span>
                  <div className="text-xs md:text-sm leading-relaxed">
                    <span className="font-semibold mr-1.5 uppercase tracking-wide opacity-80">[{f.code}]</span>
                    {f.message}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Metadata breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Giao thức</div>
              <div className="text-xs font-semibold text-white mt-1 uppercase">{result.protocol}</div>
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Đuôi miền (TLD)</div>
              <div className="text-xs font-semibold text-white mt-1">{result.domainChecks.tld || '—'}</div>
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">IP thô</div>
              <div className={`text-xs font-semibold mt-1 ${result.domainChecks.isIpHost ? 'text-rose-400' : 'text-slate-300'}`}>
                {result.domainChecks.isIpHost ? 'Có (Nguy hiểm)' : 'Không'}
              </div>
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Rút gọn link</div>
              <div className={`text-xs font-semibold mt-1 ${result.domainChecks.isShortener ? 'text-amber-400' : 'text-slate-300'}`}>
                {result.domainChecks.isShortener ? 'Có' : 'Không'}
              </div>
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Punycode</div>
              <div className={`text-xs font-semibold mt-1 ${result.domainChecks.isPunycode ? 'text-rose-400' : 'text-slate-300'}`}>
                {result.domainChecks.isPunycode ? 'Phát hiện' : 'Không'}
              </div>
            </div>
            <div className="p-3 bg-[#0d1626] rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Từ khóa nhạy cảm</div>
              <div className={`text-xs font-semibold mt-1 ${result.domainChecks.hasSuspiciousKeywords ? 'text-amber-400' : 'text-slate-300'}`}>
                {result.domainChecks.hasSuspiciousKeywords ? 'Có' : 'Không'}
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="bg-[#0f1a2e] border border-slate-700/70 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Quy tắc ứng phó khuyến nghị:
            </h4>
            <ul className="space-y-2 text-xs md:text-sm text-slate-300">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scientific Disclaimer */}
          <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-800 pt-4">
            * {result.disclaimer}
          </div>
        </div>
      )}

      {/* Emergency Hotline Quick Bar */}
      <div className="bg-[#121c2e] border border-blue-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Nếu lỡ bấm vào liên kết và bị tống tiền hoặc mất tài khoản, hãy nhận hỗ trợ khẩn cấp:</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('emergency')}
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
          >
            Quy trình khẩn cấp & Hotline 111 / 156 →
          </button>
        </div>
      </div>
    </div>
  );
};

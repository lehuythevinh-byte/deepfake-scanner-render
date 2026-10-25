import React, { useEffect, useState } from 'react';
import { ActiveTab, AuthUser } from '../types';

interface UserDashboardProps {
  user: AuthUser | null;
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
  databaseConfigured: boolean | null;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onTabChange,
  aiConfigured,
  databaseConfigured,
}) => {
  // Recent activity comes from the user's own server-side history; nothing is invented.
  const [recent, setRecent] = useState<{ id: string; scanMode: string; riskLevel: string; createdAt: string; status: string }[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/auth/scans', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { if (!cancelled) setRecent((d.scans || []).slice(0, 5)); })
      .catch(() => { if (!cancelled) setRecent([]); });
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              KHÔNG GIAN THÀNH VIÊN ĐÃ ĐĂNG NHẬP
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Xin chào, {user?.displayName || user?.email || 'Thành viên Trung tâm An toàn Số'}!
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              Bạn có toàn quyền truy cập các công cụ phân tích Deepfake, máy quét liên kết độc hại, phòng thí nghiệm bằng chứng và trợ lý SafeBot AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => onTabChange('account')}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-purple-500/20 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Trang Quản Trị Admin
              </button>
            )}
            <button
              onClick={() => onTabChange('account')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition cursor-pointer"
            >
              Hồ sơ & Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#142036] border border-slate-800 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${aiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <div>
            <div className="text-xs text-slate-400 font-medium">Trí tuệ nhân tạo (AI Engine)</div>
            <div className="text-sm font-semibold text-white">
              {aiConfigured ? 'Gemini AI Sẵn Sàng' : 'Chế độ Quy tắc Dự phòng'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#142036] border border-slate-800 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${databaseConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <div>
            <div className="text-xs text-slate-400 font-medium">Cơ sở dữ liệu người dùng</div>
            <div className="text-sm font-semibold text-white">
              {databaseConfigured ? 'PostgreSQL Hoạt Động' : 'Chưa kết nối DB'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#142036] border border-slate-800 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <div>
            <div className="text-xs text-slate-400 font-medium">Vai trò người dùng</div>
            <div className="text-sm font-semibold text-white uppercase">
              {user?.role === 'admin' ? 'Quản Trị Viên (Admin)' : 'Thành Viên'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tool Launcher Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Các Công Cụ Phân Tích & Bảo Vệ:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Tile 1: Scanner */}
          <div
            onClick={() => onTabChange('scanner')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-blue-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors">
              Máy Quét Deepfake & Ảnh Lừa Đảo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Nhận diện ảnh giả mạo, trích xuất khung hình video mẫu, rà soát chiêu trò đòi tiền khẩn cấp hoặc trộm OTP.
            </p>
            <div className="text-xs font-semibold text-blue-400 flex items-center gap-1">
              Khởi động máy quét →
            </div>
          </div>

          {/* Tile 2: Link Scanner */}
          <div
            onClick={() => onTabChange('link-scanner')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-indigo-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
              Máy Quét Liên Kết & Web Độc Hại
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Kiểm tra liên kết rút gọn, phát hiện trang mạo danh ngân hàng, tên miền lạ và bảo vệ an toàn (Zero-SSRF).
            </p>
            <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              Kiểm tra đường link →
            </div>
          </div>

          {/* Tile 3: SafeBot */}
          <div
            onClick={() => onTabChange('safebot')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-purple-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-purple-300 transition-colors">
              Trợ Lý An Toàn SafeBot AI
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Hỏi đáp 24/7 về cách ứng xử khi bị đe dọa, tống tiền hoặc cách kiểm chứng thông tin khả nghi trên mạng.
            </p>
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              Mở cuộc trò chuyện →
            </div>
          </div>

          {/* Tile 4: Forensic Lab */}
          <div
            onClick={() => onTabChange('evidence-lab')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-cyan-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
              Phòng Thí Nghiệm Bằng Chứng Số
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Công cụ giám định chi tiết: phân tích mức lỗi nén (ELA), bóc tách siêu dữ liệu EXIF và soi kính lúp.
            </p>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              Vào Evidence Lab →
            </div>
          </div>

          {/* Tile 5: Simulator */}
          <div
            onClick={() => onTabChange('simulator')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-emerald-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-emerald-300 transition-colors">
              Trình Mô Phỏng Tình Huống THCS
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Thực hành ứng phó với 6 kịch bản thực tế: giả giọng mượn tiền, bẫy trộm OTP, tống tiền ảnh ghép.
            </p>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              Luyện tập thực chiến →
            </div>
          </div>

          {/* Tile 6: Emergency */}
          <div
            onClick={() => onTabChange('emergency')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-rose-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-rose-300 transition-colors">
              Quy Trình Ứng Phó Khẩn Cấp
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Các đầu số hỗ trợ khẩn cấp chính thức (Tổng đài 111, 156), hướng dẫn lập tức khóa tài khoản và lưu bằng chứng.
            </p>
            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
              Xem quy trình khẩn cấp →
            </div>
          </div>

          {/* Tile 7: Scan History */}
          <div
            onClick={() => onTabChange('history')}
            className="p-6 rounded-2xl bg-[#162238] border border-slate-700/60 hover:border-amber-500/60 hover:bg-[#1a2942] transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-amber-300 transition-colors">
              Nhật Ký Quét & Quản Lý Báo Cáo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Xem lại các mã báo cáo đã thực hiện, lọc theo phân loại, xuất file CSV và quản lý nhật ký cá nhân an toàn.
            </p>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              Xem lịch sử quét →
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <section aria-labelledby="recent-activity">
        <div className="flex items-center justify-between mb-3">
          <h2 id="recent-activity" className="text-lg font-bold text-white">Hoạt động gần đây</h2>
          <button onClick={() => onTabChange('history')} className="text-xs font-semibold text-[#55DDF2] hover:underline">Xem tất cả</button>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#142036] divide-y divide-slate-800">
          {recent === null ? (
            <div className="p-5 text-sm text-slate-400">Đang tải…</div>
          ) : recent.length === 0 ? (
            <div className="p-5 text-sm text-slate-400">Chưa có hoạt động nào. Hãy thử AI Scanner hoặc Link Scanner để bắt đầu.</div>
          ) : (
            recent.map((scan) => (
              <div key={scan.id} className="p-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-slate-200">{scan.scanMode}</span>
                <span className="text-xs text-slate-400">{scan.status} · mức rủi ro: {scan.riskLevel}</span>
                <span className="text-xs text-slate-500">{new Date(scan.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

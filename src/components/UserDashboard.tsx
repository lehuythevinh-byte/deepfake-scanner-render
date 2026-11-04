import React, { useEffect, useState } from 'react';
import {
  Activity, ArrowRight, Bot, Clock3, Database, FileSearch, Fingerprint,
  History, LockKeyhole, ScanSearch, ShieldAlert, UserRound,
} from 'lucide-react';
import type { ActiveTab, AuthUser } from '../types';

interface UserDashboardProps {
  user: AuthUser | null;
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
  databaseConfigured: boolean | null;
}

type RecentScan = {
  id: string;
  scanMode: string;
  riskLevel: string;
  createdAt: string;
  status: string;
};

const workspaceCards: Array<{
  tab: ActiveTab;
  title: string;
  description: string;
  icon: React.ElementType;
  tag: string;
}> = [
  {
    tab: 'scanner', title: 'Content Analysis', icon: ScanSearch, tag: 'IMAGE · VIDEO · AUDIO · MESSAGE',
    description: 'Kiểm tra nội dung đa phương tiện, tin nhắn và các dấu hiệu giả mạo trong một workspace thống nhất.',
  },
  {
    tab: 'safety-center', title: 'Safety Center', icon: ShieldAlert, tag: 'ASSISTANT · KNOWLEDGE · THREATS',
    description: 'Tra cứu hướng dẫn xác minh, hỏi SafeBot và xem cập nhật an toàn số có nguồn tham chiếu.',
  },
  {
    tab: 'history', title: 'Scan History', icon: History, tag: 'PERSONAL ACTIVITY',
    description: 'Xem lại các lần kiểm tra đã được lưu cho tài khoản và mở chi tiết kết quả.',
  },
  {
    tab: 'account', title: 'User Account', icon: UserRound, tag: 'PROFILE · PRIVACY · SECURITY',
    description: 'Quản lý hồ sơ, mật khẩu, phiên đăng nhập và các tùy chọn dữ liệu cá nhân.',
  },
];

const scanModeLabel = (mode: string) => ({
  image: 'Phân tích hình ảnh', social_post: 'Bài đăng / ảnh chụp', message_scam: 'Kiểm tra tin nhắn',
  video_frame: 'Phân tích video', link: 'Kiểm tra đường dẫn', audio: 'Phân tích âm thanh',
}[mode] || mode || 'Lượt kiểm tra');

const statusLabel = (status: string) => ({
  completed: 'Hoàn tất', processing: 'Đang xử lý', queued: 'Đang chờ',
  failed: 'Thất bại', temporarily_unavailable: 'Tạm thời không khả dụng',
  insufficient_data: 'Chưa đủ dữ liệu',
}[status] || status || 'Không rõ');

const riskLabel = (risk: string) => ({
  high: 'Cao', critical: 'Nghiêm trọng', medium: 'Trung bình', low: 'Thấp',
  suspicious: 'Đáng ngờ', dangerous: 'Nguy hiểm', inconclusive: 'Chưa đủ dữ liệu',
}[String(risk || '').toLowerCase()] || risk || 'Chưa phân loại');

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user, onTabChange, aiConfigured, databaseConfigured,
}) => {
  // Recent activity is loaded from the signed-in user's server-side history.
  const [recent, setRecent] = useState<RecentScan[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch('/api/auth/scans', { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('HISTORY_UNAVAILABLE')))
      .then((data) => { if (!cancelled) setRecent(Array.isArray(data.scans) ? data.scans.slice(0, 5) : []); })
      .catch(() => { if (!cancelled) setRecent([]); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const statusPill = (configured: boolean | null, configuredText: string, missingText: string) => (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] ${configured === true ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : configured === false ? 'border-amber-400/25 bg-amber-400/10 text-amber-200' : 'border-slate-600 bg-slate-800/70 text-slate-300'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${configured === true ? 'bg-emerald-300' : configured === false ? 'bg-amber-300' : 'bg-slate-400'}`} />
      {configured === true ? configuredText : configured === false ? missingText : 'Đang kiểm tra'}
    </span>
  );

  return (
    <main className="mx-auto w-full max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#10283d] via-[#0d1c30] to-[#0a1423] p-6 shadow-2xl sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 right-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-cyan-100">
              <Fingerprint size={14} /> ADVANCED DIGITAL TRUST PLATFORM · V5
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Đừng vội tin. Hãy kiểm tra.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {user?.displayName ? `Xin chào ${user.displayName}. ` : ''}Phân tích nội dung, rà soát dấu hiệu giả mạo và xác minh rủi ro trực tuyến trong một không gian thống nhất.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {statusPill(aiConfigured, 'AI đã cấu hình', 'AI chưa sẵn sàng')}
            {statusPill(databaseConfigured, 'Database đã cấu hình', 'Database chưa kết nối')}
            {user?.role === 'admin' && <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-[11px] text-violet-200"><LockKeyhole size={12}/> Quản trị viên</span>}
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1.5"><ShieldAlert size={13} className="text-cyan-200"/> Local-first khi công cụ hỗ trợ</span>
          <span className="inline-flex items-center gap-1.5"><LockKeyhole size={13} className="text-cyan-200"/> AI bên ngoài cần sự đồng ý</span>
          <span className="inline-flex items-center gap-1.5"><Database size={13} className="text-cyan-200"/> Lịch sử theo tài khoản</span>
        </div>
      </section>

      <section aria-labelledby="workspace-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300">V5 WORKSPACE</p>
            <h2 id="workspace-heading" className="mt-1 text-xl font-bold text-white">Không gian làm việc</h2>
          </div>
          <p className="text-xs text-slate-500">Bốn khu vực chính · không tạo trang báo cáo thống kê riêng</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workspaceCards.map(({ tab, title, description, icon: Icon, tag }) => (
            <button key={tab} type="button" onClick={() => onTabChange(tab)} className="group min-h-[210px] rounded-2xl border border-slate-700/80 bg-[#0d1a2b] p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-[#11243a] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
              <div className="mb-5 flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Icon size={21}/></span>
                <ArrowRight size={16} className="mt-1 text-slate-600 transition group-hover:translate-x-1 group-hover:text-cyan-200"/>
              </div>
              <p className="text-[9px] font-semibold tracking-[0.13em] text-cyan-300/80">{tag}</p>
              <h3 className="mt-1 text-base font-bold text-white">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-activity" className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0d1a2b]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 px-5 py-4">
          <div className="flex items-center gap-2"><Activity size={16} className="text-cyan-300"/><h2 id="recent-activity" className="text-sm font-bold text-white">Hoạt động gần đây</h2></div>
          <button onClick={() => onTabChange('history')} className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200 hover:underline">Mở lịch sử <ArrowRight size={13}/></button>
        </div>
        <div className="divide-y divide-slate-800/80">
          {recent === null ? <div className="p-5 text-xs text-slate-400">Đang tải lịch sử của tài khoản…</div> : recent.length === 0 ? (
            <div className="p-6 text-center">
              <FileSearch size={24} className="mx-auto text-slate-600"/>
              <p className="mt-2 text-sm font-medium text-slate-300">Chưa có lượt kiểm tra được lưu</p>
              <p className="mt-1 text-xs text-slate-500">Bắt đầu ở Content Analysis. Lưu lịch sử tùy thuộc vào cấu hình và thao tác lưu của chức năng.</p>
              <button onClick={() => onTabChange('scanner')} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15">Mở Content Analysis <ArrowRight size={13}/></button>
            </div>
          ) : recent.map((scan) => (
            <div key={scan.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0"><p className="text-xs font-semibold text-slate-200">{scanModeLabel(scan.scanMode)}</p><p className="mt-1 text-[10px] text-slate-500">{new Date(scan.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}</p></div>
              <div className="flex items-center gap-2 text-[10px]"><span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-slate-300">{statusLabel(scan.status)}</span><span className="text-slate-400">Rủi ro: {riskLabel(scan.riskLevel)}</span></div>
            </div>
          ))}
        </div>
      </section>
      <p className="flex items-start gap-2 text-[10px] leading-5 text-slate-500"><Clock3 size={13} className="mt-0.5 shrink-0"/> Kết quả tự động chỉ hỗ trợ sàng lọc. Không có một phép kiểm tra đơn lẻ nào chứng minh chắc chắn nội dung là thật hoặc giả.</p>
    </main>
  );
};

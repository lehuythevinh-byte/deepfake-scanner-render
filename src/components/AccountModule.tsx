import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, ArrowRight, Download, Eye, EyeOff, History, KeyRound, LogIn, LogOut, Mail, ShieldCheck, Trash2, UserPlus, UserRound, ScanSearch } from 'lucide-react';
import type { ActiveTab, AppUser } from '../types';

interface ScanHistoryItem {
  id: string;
  scanMode: string;
  fileName: string;
  overallStatus: string;
  summary: string;
  isHeuristic: boolean;
  createdAt: string;
}

interface AccountModuleProps {
  user: AppUser | null;
  authAvailable: boolean;
  onAuthChange: (user: AppUser | null, authAvailable?: boolean) => void;
  onTabChange: (tab: ActiveTab) => void;
}

const panelClass = 'rounded-2xl border border-[#243958] bg-[#14243B]/80';
const inputClass = 'w-full rounded-xl border border-[#2B4364] bg-[#0D192B] px-4 py-3 text-sm text-white outline-none transition focus:border-[#55DDF2] focus:ring-2 focus:ring-[#55DDF2]/15 placeholder:text-slate-500';

async function readApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return typeof body?.message === 'string' ? body.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
  } catch {
    return 'Máy chủ phản hồi không hợp lệ. Vui lòng thử lại.';
  }
}

function statusLabel(status: string) {
  if (status === 'suspicious') return 'Đáng ngờ';
  if (status === 'no_obvious_anomalies') return 'Chưa thấy dấu hiệu rõ';
  return 'Chưa đủ dữ liệu';
}

export const AccountModule: React.FC<AccountModuleProps> = ({ user, authAvailable, onAuthChange, onTabChange }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const loadHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const response = await fetch('/api/me/scans', { credentials: 'same-origin' });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = await response.json();
      setScans(Array.isArray(body.scans) ? body.scans : []);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Không thể tải lịch sử.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user) void loadHistory();
    else setScans([]);
    // loadHistory intentionally runs only when the authenticated identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, ...(mode === 'register' ? { displayName: displayName.trim() } : {}) }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = await response.json();
      onAuthChange(body.user as AppUser, true);
      setPassword('');
      setNotice({ type: 'success', text: mode === 'login' ? 'Đăng nhập thành công.' : 'Tài khoản đã được tạo thành công.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof TypeError ? 'Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng và thử tải lại trang.' : error instanceof Error ? error.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setNotice(null);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      if (!response.ok) throw new Error(await readApiError(response));
      onAuthChange(null, authAvailable);
      setPassword('');
      setNotice({ type: 'success', text: 'Bạn đã đăng xuất.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof TypeError ? 'Không thể xác nhận đăng xuất với máy chủ. Hãy kiểm tra mạng rồi thử lại.' : error instanceof Error ? error.message : 'Không thể đăng xuất. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), scans }, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deepfake-scanner-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const clearHistory = async () => {
    if (!window.confirm('Xóa toàn bộ lịch sử phân tích đã lưu trong tài khoản này? Thao tác không thể hoàn tác.')) return;
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/me/scans', { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error(await readApiError(response));
      setScans([]);
      setNotice({ type: 'success', text: 'Đã xóa lịch sử phân tích của tài khoản.' });
    } catch (error) {
      setNotice({ type: 'error', text: error instanceof Error ? error.message : 'Không thể xóa lịch sử.' });
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#55DDF2]/25 bg-[#55DDF2]/10 px-3 py-1.5 text-xs font-semibold text-[#8DEBFA]"><UserRound className="h-4 w-4" /> TÀI KHOẢN & QUYỀN RIÊNG TƯ</div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Khu vực người dùng</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Quản lý tài khoản, xem lịch sử phân tích và xuất dữ liệu của riêng bạn.</p>
        </div>
        {user && <div className="flex flex-wrap gap-2"><button onClick={() => onTabChange('scanner')} className="inline-flex items-center gap-2 rounded-xl bg-[#55DDF2] px-4 py-2.5 text-sm font-bold text-[#0A1B2B] hover:bg-[#85ECF8]"><ScanSearch className="h-4 w-4" /> Phân tích nội dung</button>{user.role === 'admin' && <button onClick={() => onTabChange('admin')} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/40 bg-violet-400/10 px-4 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-400/20"><ShieldCheck className="h-4 w-4" /> Admin Console</button>}</div>}
      </div>

      {notice && <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.type === 'error' ? 'border-rose-400/30 bg-rose-400/10 text-rose-100' : notice.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' : 'border-sky-400/30 bg-sky-400/10 text-sky-100'}`}><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{notice.text}</p></div>}

      {!user ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className={`${panelClass} p-6 sm:p-8`}>
            <div className="mb-6 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#55DDF2]/25 bg-[#55DDF2]/10 text-[#55DDF2]">{mode === 'login' ? <LogIn className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}</div><div><h2 className="text-xl font-bold text-white">{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2><p className="mt-1 text-sm text-slate-400">{mode === 'login' ? 'Tiếp tục sử dụng hồ sơ cá nhân.' : 'Dùng mật khẩu từ 10 đến 128 ký tự.'}</p></div></div>
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#0D192B] p-1"><button onClick={() => { setMode('login'); setNotice(null); setPassword(''); setShowPassword(false); }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'login' ? 'bg-[#203651] text-white' : 'text-slate-400 hover:text-white'}`}>Đăng nhập</button><button onClick={() => { setMode('register'); setNotice(null); setPassword(''); setShowPassword(false); }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-[#203651] text-white' : 'text-slate-400 hover:text-white'}`}>Đăng ký</button></div>
            {!authAvailable && <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm leading-6 text-amber-100"><strong>Hệ thống tài khoản hiện chưa sẵn sàng.</strong><br />Có thể cơ sở dữ liệu chưa được cấu hình hoặc máy chủ chưa khởi tạo xong. Nếu quản trị viên vừa cập nhật cấu hình Render, hãy tải lại trang sau khi dịch vụ triển khai hoàn tất. Các công cụ khách hiện có vẫn có thể sử dụng.</div>}
            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Tên hiển thị</span><input className={inputClass} autoComplete="name" maxLength={80} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tên của bạn" required minLength={2} /></label>}
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input className={`${inputClass} pl-10`} autoComplete="email" autoCapitalize="none" spellCheck={false} type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="ban@example.com" required /></span></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Mật khẩu</span><span className="relative block"><KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input className={`${inputClass} pl-10 pr-12`} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} minLength={mode === 'register' ? 10 : 1} maxLength={128} placeholder={mode === 'register' ? 'Ít nhất 10 ký tự' : 'Nhập mật khẩu'} required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#55DDF2]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#55DDF2] px-4 py-3 font-bold text-[#0A1B2B] transition hover:bg-[#85ECF8] disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập an toàn' : 'Tạo tài khoản'} {!loading && <ArrowRight className="h-4 w-4" />}</button>
            </form>
            <p className="mt-5 text-xs leading-5 text-slate-500">Phiên đăng nhập dùng cookie HttpOnly. Không nhập OTP, mật khẩu ngân hàng hoặc thông tin bí mật của dịch vụ khác vào đây.</p>
          </div>
          <div className={`${panelClass} relative overflow-hidden p-6 sm:p-8`}><div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#55DDF2]/10 blur-3xl" /><div className="relative"><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200"><ShieldCheck className="h-7 w-7" /></div><h2 className="text-2xl font-black text-white">Hồ sơ của bạn, dữ liệu của bạn</h2><p className="mt-3 text-sm leading-7 text-slate-400">Tài khoản dùng để lưu lịch sử quét và tạo trải nghiệm cá nhân hóa. Hệ thống chỉ ghi lại tóm tắt phân tích cần thiết, không lưu ảnh hoặc nội dung tin nhắn gốc trong lịch sử tài khoản.</p><div className="mt-7 space-y-4">{[{title:'Lịch sử riêng tư',text:'Mỗi người dùng chỉ xem hoặc xóa lịch sử thuộc tài khoản của mình.',icon:History},{title:'Báo cáo có thể tải xuống',text:'Xuất dữ liệu lịch sử dưới dạng JSON để lưu bản sao cá nhân.',icon:Download},{title:'Phân quyền phía máy chủ',text:'Vai trò Admin không thể tự cấp bằng cách sửa giao diện hoặc dữ liệu trình duyệt.',icon:ShieldCheck}].map(item => { const Icon = item.icon; return <div key={item.title} className="flex gap-3"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D192B] text-[#55DDF2]"><Icon className="h-4 w-4" /></div><div><h3 className="text-sm font-bold text-slate-200">{item.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{item.text}</p></div></div>; })}</div></div></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`${panelClass} flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between`}><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#55DDF2]/10 text-[#55DDF2]"><UserRound className="h-7 w-7" /></div><div><h2 className="text-xl font-bold text-white">Xin chào, {user.displayName}</h2><p className="mt-1 text-sm text-slate-400">{user.email}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">Tài khoản hoạt động</span><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'border-violet-400/30 bg-violet-400/10 text-violet-200' : 'border-sky-400/25 bg-sky-400/10 text-sky-200'}`}>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span></div></div></div><button onClick={logout} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-rose-400/25 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10 disabled:opacity-60 sm:self-center"><LogOut className="h-4 w-4" /> Đăng xuất</button></div>
          <div className={`${panelClass} overflow-hidden`}><div className="flex flex-col gap-3 border-b border-[#243958] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-lg font-bold text-white"><History className="h-5 w-5 text-[#55DDF2]" /> Lịch sử phân tích</h2><p className="mt-1 text-sm text-slate-400">Chỉ lưu metadata và tóm tắt, không lưu tệp gốc.</p></div><div className="flex flex-wrap gap-2"><button onClick={loadHistory} disabled={historyLoading} className="rounded-lg border border-[#2B4364] px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-[#203651]">Làm mới</button><button onClick={exportHistory} disabled={!scans.length} className="inline-flex items-center gap-2 rounded-lg border border-[#55DDF2]/30 px-3 py-2 text-xs font-semibold text-[#8DEBFA] disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Xuất JSON</button><button onClick={clearHistory} disabled={historyLoading || !scans.length} className="inline-flex items-center gap-2 rounded-lg border border-rose-400/25 px-3 py-2 text-xs font-semibold text-rose-200 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Xóa lịch sử</button></div></div>
            {historyError && <p className="m-5 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{historyError}</p>}
            {historyLoading ? <div className="p-10 text-center text-sm text-slate-400">Đang tải lịch sử...</div> : scans.length === 0 ? <div className="p-10 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D192B] text-slate-400"><Activity className="h-6 w-6" /></div><p className="font-semibold text-slate-200">Chưa có lịch sử phân tích</p><p className="mt-1 text-sm text-slate-500">Đăng nhập khi quét nội dung để lưu tóm tắt vào hồ sơ.</p><button onClick={() => onTabChange('scanner')} className="mt-4 text-sm font-semibold text-[#55DDF2] hover:underline">Mở Threat Scanner →</button></div> : <div className="divide-y divide-[#243958]">{scans.map(scan => <div key={scan.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-[#203651] px-2 py-1 text-[11px] font-semibold text-[#A9D8F0]">{scan.scanMode}</span><span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${scan.overallStatus === 'suspicious' ? 'bg-rose-400/10 text-rose-200' : 'bg-slate-400/10 text-slate-300'}`}>{statusLabel(scan.overallStatus)}</span>{scan.isHeuristic && <span className="rounded-md bg-amber-400/10 px-2 py-1 text-[11px] font-semibold text-amber-200">Quy tắc dự phòng</span>}</div><h3 className="mt-2 truncate font-semibold text-white">{scan.fileName}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{scan.summary || 'Không có phần tóm tắt.'}</p></div><time className="shrink-0 text-xs text-slate-500">{new Date(scan.createdAt).toLocaleString('vi-VN')}</time></div>)}</div>}
          </div>
        </div>
      )}
    </section>
  );
};

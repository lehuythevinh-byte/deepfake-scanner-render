import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { ActiveTab, AuthUser } from '../types';
import { getSafeNextTab } from '../lib/routes';
import { FeedbackAdminPanel } from './FeedbackAdminPanel';
import {
  AlertCircle, BarChart3, Check, Clock3, Database, LogIn, LogOut, RefreshCw,
  ShieldCheck, UserPlus, Users, UserRound, Activity, LockKeyhole, ShieldAlert, Eye, EyeOff, Star,
} from 'lucide-react';

interface ScanAuditRow {
  id: string;
  scanMode: string;
  engine: 'gemini' | 'heuristic' | string;
  model?: string | null;
  durationMs: number;
  createdAt: string;
  email: string;
}

interface AdminStats {
  users: number;
  activeUsers: number;
  admins: number;
  scans: number;
  scansLast7Days: number;
  heuristicScans: number;
}

interface AccountModuleProps {
  user: AuthUser | null;
  databaseConfigured: boolean | null;
  onAuthChanged: () => Promise<void>;
  onTabChange?: (tab: ActiveTab) => void;
  initialMode?: 'login' | 'register';
  onOpenSurvey?: () => void;
}

const EMPTY_STATS: AdminStats = { users: 0, activeUsers: 0, admins: 0, scans: 0, scansLast7Days: 0, heuristicScans: 0 };

function formatDate(value?: string | null): string {
  if (!value) return 'Chưa đăng nhập';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

async function readApiResponse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('Máy chủ chưa có API này (404 Not Found). Hãy kiểm tra file server.ts trên Render đã được cập nhật phiên bản mới nhất chưa.');
    }
    throw new Error(`Máy chủ phản hồi định dạng HTML thay vì JSON (Mã ${response.status}). Vui lòng kiểm tra lại server.ts trên Render.`);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Yêu cầu thất bại (${response.status})`);
  return data;
}

export const AccountModule: React.FC<AccountModuleProps> = ({ user, databaseConfigured, onAuthChanged, onTabChange, initialMode = 'login', onOpenSurvey }) => {
  const [showRegister, setShowRegister] = useState(initialMode === 'register');
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => { setShowRegister(initialMode === 'register'); }, [initialMode]);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats>(EMPTY_STATS);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [recentScans, setRecentScans] = useState<ScanAuditRow[]>([]);
  const [ownScans, setOwnScans] = useState<ScanAuditRow[]>([]);
  const [ownScansLoading, setOwnScansLoading] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { role: 'user' | 'admin'; status: 'active' | 'disabled' }>>({});
  const [adminLoading, setAdminLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [diagOpen, setDiagOpen] = useState(false);
  const [diagLoading, setDiagLoading] = useState(false);
  const [diagReport, setDiagReport] = useState<any>(null);

  const runDiagnostic = async () => {
    setDiagLoading(true);
    try {
      const res = await fetch('/api/auth/diagnostic', { cache: 'no-store' });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Endpoint /api/auth/diagnostic chưa được cập nhật trên backend Render (Trả về HTML thay vì JSON). Hãy đẩy file server.ts mới nhất lên GitHub.');
      }
      const data = await res.json();
      setDiagReport(data);
      setDiagOpen(true);
    } catch (err: any) {
      setDiagReport({ diagnoses: [err?.message || 'Không thể gọi API chẩn đoán'] });
      setDiagOpen(true);
    } finally {
      setDiagLoading(false);
    }
  };

  const loadAdmin = useCallback(async () => {
    if (user?.role !== 'admin') return;
    setAdminLoading(true);
    setError(null);
    try {
      const [overviewResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/overview', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/admin/users', { credentials: 'same-origin', cache: 'no-store' }),
      ]);
      const [overview, usersData] = await Promise.all([readApiResponse(overviewResponse), readApiResponse(usersResponse)]);
      setStats({ ...EMPTY_STATS, ...(overview.stats || {}) });
      setRecentScans(Array.isArray(overview.recentScans) ? overview.recentScans : []);
      const loadedUsers: AuthUser[] = Array.isArray(usersData.users) ? usersData.users : [];
      setUsers(loadedUsers);
      const nextDrafts: Record<string, { role: 'user' | 'admin'; status: 'active' | 'disabled' }> = {};
      loadedUsers.forEach((item) => { nextDrafts[item.id] = { role: item.role, status: item.status }; });
      setDrafts(nextDrafts);
    } catch (loadError: any) {
      setError(loadError?.message || 'Không tải được dữ liệu quản trị. Hãy kiểm tra PostgreSQL và quyền admin.');
    } finally {
      setAdminLoading(false);
    }
  }, [user?.id, user?.role]);

  const loadOwnScans = useCallback(async () => {
    if (!user || user.role === 'admin') return;
    setOwnScansLoading(true);
    try {
      const response = await fetch('/api/auth/scans', { credentials: 'same-origin', cache: 'no-store' });
      const data = await readApiResponse(response);
      setOwnScans(Array.isArray(data.scans) ? data.scans : []);
    } catch {
      setOwnScans([]);
    } finally {
      setOwnScansLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (user?.role === 'admin') void loadAdmin();
    else {
      setUsers([]);
      setRecentScans([]);
      setStats(EMPTY_STATS);
      if (user) void loadOwnScans();
      else setOwnScans([]);
    }
  }, [user?.id, user?.role, loadAdmin, loadOwnScans]);


  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(showRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
      const data = await readApiResponse(response);
      setPassword('');
      setNotice(showRegister ? 'Tạo tài khoản thành công.' : 'Đăng nhập thành công.');
      await onAuthChanged();
      if (data.user?.role === 'admin') await loadAdmin();
      // Destination comes from a validated internal ?next= value (see lib/routes.ts); default is the dashboard.
      if (onTabChange) onTabChange(getSafeNextTab());
    } catch (authError: any) {
      setError(authError?.message || 'Không thể xác thực tài khoản.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    setError(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
      await onAuthChanged();
      setNotice('Bạn đã đăng xuất.');
      if (onTabChange) {
        onTabChange('home');
      }
    } catch (logoutError: any) {
      setError(logoutError?.message || 'Không thể đăng xuất lúc này.');
    } finally {
      setBusy(false);
    }
  };

  const updateDraft = (id: string, field: 'role' | 'status', value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    } as Record<string, { role: 'user' | 'admin'; status: 'active' | 'disabled' }>));
  };

  const saveUser = async (userRow: AuthUser) => {
    const draft = drafts[userRow.id];
    if (!draft) return;
    setSavingUserId(userRow.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userRow.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      await readApiResponse(response);
      setNotice(`Đã cập nhật tài khoản ${userRow.email}.`);
      await loadAdmin();
      await onAuthChanged();
    } catch (saveError: any) {
      setError(saveError?.message || 'Không cập nhật được tài khoản.');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-[#243956] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#55DDF2] text-xs font-bold uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" /> Tài khoản & quyền truy cập
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Tài khoản Deepfake Scanner</h1>
          <p className="text-sm text-slate-400 mt-2">Phiên đăng nhập bảo mật, phân quyền người dùng và bảng điều khiển quản trị.</p>
        </div>
        {user && <button onClick={handleLogout} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#35506d] px-4 py-2.5 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><LogOut className="w-4 h-4" /> Đăng xuất</button>}
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200"><AlertCircle className="w-5 h-5 shrink-0" /> <span>{error}</span></div>}
      {notice && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200"><Check className="w-5 h-5 shrink-0" /> <span>{notice}</span></div>}

      {!user && (
        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-[#243956] bg-[#13233b] p-5 sm:p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-[#55DDF2]/10 flex items-center justify-center text-[#55DDF2]"><LockKeyhole className="w-6 h-6" /></div>
              <div><h2 className="font-bold text-xl text-white">{showRegister ? 'Tạo tài khoản người dùng' : 'Đăng nhập'}</h2><p className="text-sm text-slate-400">Tài khoản công khai mặc định không có quyền admin.</p></div>
            </div>
            {databaseConfigured === false && <div className="mb-5 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100"><div className="font-semibold mb-1 flex items-center gap-2"><Database className="w-4 h-4" /> PostgreSQL chưa được cấu hình</div>Trên Render, thêm biến <code>DATABASE_URL</code> trỏ tới PostgreSQL. Để tạo quản trị viên đầu tiên, thêm <code>ADMIN_EMAIL</code> và <code>ADMIN_PASSWORD</code> (tối thiểu 12 ký tự). Máy quét AI vẫn hoạt động độc lập với tính năng tài khoản.</div>}
            <form onSubmit={handleAuth} className="space-y-4">
              {showRegister && <label className="block text-sm text-slate-300">Tên hiển thị <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} className="mt-1.5 w-full rounded-lg border border-[#35506d] bg-[#0e1a2d] px-3 py-2.5 text-white outline-none focus:border-[#55DDF2]" placeholder="Tên của bạn" /></label>}
              <label className="block text-sm text-slate-300">Email <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} className="mt-1.5 w-full rounded-lg border border-[#35506d] bg-[#0e1a2d] px-3 py-2.5 text-white outline-none focus:border-[#55DDF2]" placeholder="ten@example.com" /></label>
              <label className="block text-sm text-slate-300">Mật khẩu
                <span className="mt-1.5 relative block">
                  <input required type={showPassword ? 'text' : 'password'} autoComplete={showRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={showRegister ? 10 : 1} maxLength={128} className="w-full rounded-lg border border-[#35506d] bg-[#0e1a2d] px-3 py-2.5 pr-11 text-white outline-none focus:border-[#55DDF2]" placeholder={showRegister ? 'Tối thiểu 10 ký tự' : 'Nhập mật khẩu'} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-md text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </span>
              </label>
              <button disabled={busy || databaseConfigured === false} type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#55DDF2] px-4 py-3 font-bold text-[#101C32] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : showRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}{busy ? 'Đang xử lý…' : showRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
            </form>
            <p className="text-sm text-slate-400 mt-5">{showRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <button disabled={databaseConfigured === false} className="font-semibold text-[#55DDF2] hover:underline disabled:opacity-50" onClick={() => { setShowRegister((value) => !value); setError(null); setNotice(null); }}>{showRegister ? 'Đăng nhập' : 'Đăng ký'}</button></p>

            {/* Diagnostic helper for admin/database connection */}
            <div className="mt-5 pt-4 border-t border-[#243956]">
              <button
                type="button"
                onClick={runDiagnostic}
                disabled={diagLoading}
                className="inline-flex items-center gap-1.5 text-xs text-[#55DDF2] hover:underline font-medium"
              >
                <Activity className="w-3.5 h-3.5" />
                {diagLoading ? 'Đang kiểm tra kết nối...' : 'Kiểm tra chẩn đoán Admin & Database'}
              </button>

              {diagOpen && diagReport && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#0e1a2d] border border-[#243956] text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-200 border-b border-[#243956] pb-1.5">
                    <span>Kết quả chẩn đoán hệ thống:</span>
                    <button onClick={() => setDiagOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>PostgreSQL: <strong className={diagReport.database?.connected ? 'text-emerald-400' : 'text-rose-400'}>{diagReport.database?.connected ? 'Đã kết nối' : 'Chưa kết nối'}</strong></div>
                    <div>ADMIN_EMAIL: <strong className={diagReport.environmentAdmin?.isEmailSet ? 'text-emerald-400' : 'text-amber-400'}>{diagReport.environmentAdmin?.emailMasked || 'Chưa đặt'}</strong></div>
                    <div>ADMIN_PASSWORD: <strong className={diagReport.environmentAdmin?.isPasswordSet ? 'text-emerald-400' : 'text-amber-400'}>{diagReport.environmentAdmin?.isPasswordSet ? `Đã đặt (${diagReport.environmentAdmin.passwordLength} ký tự)` : 'Chưa đặt'}</strong></div>
                    <div>Admin trong DB: <strong className={diagReport.databaseState?.totalAdmins > 0 ? 'text-emerald-400' : 'text-amber-400'}>{diagReport.databaseState?.totalAdmins ?? 0}</strong></div>
                  </div>
                  {Array.isArray(diagReport.diagnoses) && diagReport.diagnoses.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#243956]/60">
                      <div className="text-slate-400 font-medium mb-1">Gợi ý xử lý:</div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
                        {diagReport.diagnoses.map((d: string, idx: number) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-[#243956] bg-[#13233b] p-5 sm:p-7 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-[#55DDF2]" /> Quyền truy cập được bảo vệ</h2>
            <div className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4"><div className="font-semibold text-slate-100 mb-1">Người dùng</div><p className="text-sm text-slate-400">Đăng nhập và sử dụng các công cụ an toàn số. Không được tự cấp quyền quản trị.</p></div>
            <div className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4"><div className="font-semibold text-slate-100 mb-1 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Quản trị viên</div><p className="text-sm text-slate-400">Xem thống kê, quản lý vai trò tài khoản, khóa hoặc mở khóa người dùng và xem metadata thời gian quét.</p></div>
            <p className="text-xs text-slate-500">Mật khẩu được băm bằng scrypt; cookie phiên là HttpOnly và SameSite=Lax. Hệ thống không lưu nội dung ảnh/tin nhắn vào bảng lịch sử quản trị.</p>
          </section>
        </div>
      )}

      {user && user.role !== 'admin' && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#243956] bg-[#13233b] p-5 sm:p-7">
            <div className="flex items-start gap-4"><div className="w-14 h-14 rounded-xl bg-[#55DDF2]/10 flex items-center justify-center text-[#55DDF2]"><UserRound className="w-7 h-7" /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold text-white">Xin chào, {user.displayName || user.email}</h2><span className="rounded-full bg-slate-500/15 px-2.5 py-1 text-xs text-slate-300 border border-slate-400/20">Người dùng</span></div><p className="text-sm text-slate-400 mt-1">{user.email}</p><p className="text-sm text-slate-400 mt-3">Tài khoản của bạn đang ở trạng thái <strong className="text-emerald-300">hoạt động</strong>. Quyền quản trị chỉ có thể được cấp bởi một quản trị viên hiện có.</p></div></div>
          </section>
          {onOpenSurvey && <section className="rounded-2xl border border-[#243956] bg-[#13233b] p-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-300" /> Đánh giá chất lượng</h2><p className="text-xs text-slate-400 mt-1">Chia sẻ mức độ hài lòng của bạn để giúp chúng tôi cải thiện sản phẩm.</p></div><button onClick={onOpenSurvey} className="rounded-lg border border-[#35506d] px-4 py-2 text-sm text-slate-100 hover:bg-[#172941]">Đánh giá ngay</button></section>}
          <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#243956] flex items-center justify-between"><div><h2 className="font-bold text-white text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-[#55DDF2]" /> Lịch sử quét của tôi</h2><p className="text-xs text-slate-400 mt-1">Tối đa 50 lượt gần nhất · nội dung ảnh/tin nhắn không được lưu.</p></div><button onClick={() => void loadOwnScans()} disabled={ownScansLoading} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${ownScansLoading ? 'animate-spin' : ''}`} /> Làm mới</button></div>
            {ownScansLoading && ownScans.length === 0 ? <div className="p-6 text-sm text-slate-400">Đang tải lịch sử…</div> : ownScans.length === 0 ? <div className="p-6 text-sm text-slate-400">Chưa có lịch sử quét gắn với tài khoản này. Các lượt quét khi chưa đăng nhập sẽ không được ghi lại.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-slate-400 bg-[#0e1a2d]"><tr><th className="text-left font-medium p-3">Thời gian</th><th className="text-left font-medium p-3">Chế độ</th><th className="text-left font-medium p-3">AI</th><th className="text-right font-medium p-3">Thời gian xử lý</th></tr></thead><tbody className="divide-y divide-[#243956]">{ownScans.map((scan) => <tr key={scan.id}><td className="p-3 text-slate-300 whitespace-nowrap">{formatDate(scan.createdAt)}</td><td className="p-3 text-slate-300">{scan.scanMode}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${scan.engine === 'gemini' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-200'}`}>{scan.engine === 'gemini' ? scan.model || 'Gemini' : 'Heuristic'}</span></td><td className="p-3 text-right text-slate-300 whitespace-nowrap">{(scan.durationMs / 1000).toFixed(1)} giây</td></tr>)}</tbody></table></div>}
          </section>
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-4 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-300"><ShieldCheck className="w-6 h-6" /></div><div><h2 className="font-bold text-white">Bảng điều khiển quản trị</h2><p className="text-xs text-slate-400">Đăng nhập với quyền admin · {user.email}</p></div></div><button onClick={() => void loadAdmin()} disabled={adminLoading} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${adminLoading ? 'animate-spin' : ''}`} /> Làm mới</button></div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[
              { label: 'Tổng tài khoản', value: stats.users, icon: Users },
              { label: 'Tài khoản hoạt động', value: stats.activeUsers, icon: UserRound },
              { label: 'Quản trị viên hoạt động', value: stats.admins, icon: ShieldCheck },
              { label: 'Lượt quét đã ghi nhận', value: stats.scans, icon: Activity },
              { label: 'Lượt quét trong 7 ngày', value: stats.scansLast7Days, icon: BarChart3 },
              { label: 'Lượt quét dùng heuristic', value: stats.heuristicScans, icon: Clock3 },
            ].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-xl border border-[#243956] bg-[#13233b] p-4"><div className="flex items-center justify-between text-slate-400 text-sm"><span>{item.label}</span><Icon className="w-4 h-4 text-[#55DDF2]" /></div><div className="text-2xl font-extrabold text-white mt-2">{item.value.toLocaleString('vi-VN')}</div></div>; })}
          </div>

          <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#243956] flex items-center justify-between"><div><h2 className="font-bold text-white text-lg flex items-center gap-2"><Users className="w-5 h-5 text-[#55DDF2]" /> Quản lý tài khoản</h2><p className="text-xs text-slate-400 mt-1">Hiển thị tối đa 200 tài khoản gần nhất · đang hoạt động: {stats.activeUsers}</p></div><span className="text-xs text-slate-400">{users.length} tài khoản</span></div>
            {adminLoading && users.length === 0 ? <div className="p-8 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Đang tải dữ liệu…</div> : users.length === 0 ? <div className="p-8 text-center text-slate-400">Chưa có tài khoản hoặc chưa kết nối được cơ sở dữ liệu.</div> : <div className="divide-y divide-[#243956]">{users.map((item) => { const draft = drafts[item.id] || { role: item.role, status: item.status }; const changed = draft.role !== item.role || draft.status !== item.status; return <div key={item.id} className="p-4 grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-3 md:items-center"><div className="min-w-0"><div className="font-semibold text-slate-100 break-all">{item.email}</div><div className="text-xs text-slate-400 mt-1">{item.displayName || 'Chưa đặt tên'} · tạo {formatDate(item.createdAt)} · đăng nhập {formatDate(item.lastLoginAt)}</div></div><div className="grid grid-cols-2 gap-2"><label className="text-xs text-slate-400">Vai trò<select aria-label={`Vai trò ${item.email}`} value={draft.role} onChange={(e) => updateDraft(item.id, 'role', e.target.value)} className="mt-1 block w-full rounded-md border border-[#35506d] bg-[#0e1a2d] p-2 text-sm text-white"><option value="user">Người dùng</option><option value="admin">Admin</option></select></label><label className="text-xs text-slate-400">Trạng thái<select aria-label={`Trạng thái ${item.email}`} value={draft.status} onChange={(e) => updateDraft(item.id, 'status', e.target.value)} className="mt-1 block w-full rounded-md border border-[#35506d] bg-[#0e1a2d] p-2 text-sm text-white"><option value="active">Hoạt động</option><option value="disabled">Đã khóa</option></select></label></div><div className="flex md:justify-end"><button disabled={!changed || savingUserId === item.id || item.id === user.id} onClick={() => void saveUser(item)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-100 hover:border-[#55DDF2]/60 hover:bg-[#172941] disabled:cursor-not-allowed disabled:opacity-40">{savingUserId === item.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Lưu</button></div></div>; })}</div>}
            <p className="px-4 py-3 border-t border-[#243956] text-xs text-slate-500">Không thể tự khóa hoặc tự hạ quyền tài khoản admin đang đăng nhập; hệ thống cũng ngăn hạ quyền quản trị viên hoạt động cuối cùng.</p>
          </section>

          <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#243956]"><h2 className="font-bold text-white text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-[#55DDF2]" /> Lượt quét gần đây</h2><p className="text-xs text-slate-400 mt-1">Chỉ ghi metadata khi người dùng đã đăng nhập; không lưu nội dung ảnh hoặc tin nhắn.</p></div>
            {recentScans.length === 0 ? <div className="p-5 text-sm text-slate-400">Chưa có lượt quét của người dùng đã đăng nhập.</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-xs text-slate-400 bg-[#0e1a2d]"><tr><th className="text-left font-medium p-3">Thời gian</th><th className="text-left font-medium p-3">Tài khoản</th><th className="text-left font-medium p-3">Chế độ</th><th className="text-left font-medium p-3">AI</th><th className="text-right font-medium p-3">Thời gian</th></tr></thead><tbody className="divide-y divide-[#243956]">{recentScans.map((scan) => <tr key={scan.id}><td className="p-3 text-slate-300 whitespace-nowrap">{formatDate(scan.createdAt)}</td><td className="p-3 text-slate-300">{scan.email}</td><td className="p-3 text-slate-300">{scan.scanMode}</td><td className="p-3"><span className={`rounded-full px-2 py-1 text-xs ${scan.engine === 'gemini' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-300/10 text-amber-200'}`}>{scan.engine === 'gemini' ? scan.model || 'Gemini' : 'Heuristic'}</span></td><td className="p-3 text-right text-slate-300 whitespace-nowrap">{(scan.durationMs / 1000).toFixed(1)} giây</td></tr>)}</tbody></table></div>}
          </section>
          <FeedbackAdminPanel />
        </div>
      )}
    </div>
  );
};

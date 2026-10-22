import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Clock3, RefreshCw, Search, ShieldCheck, ShieldOff, Users, UserCog, UserRoundCheck, UserRoundX, AlertCircle, Bot, ClipboardList } from 'lucide-react';
import type { AppUser } from '../types';

interface AdminModuleProps { user: AppUser | null; }
interface Overview {
  users: { total: number; active: number; suspended: number; admins: number };
  scans: { total: number; last24Hours: number };
  newUsersLast7Days: number;
  authStore: { configured: boolean; ready: boolean; errorCode: string | null };
  ai: { configured: boolean; model: string };
}
interface AdminUser extends AppUser {}
interface AuditLog { id: string; action: string; details: Record<string, unknown>; ipAddress: string | null; createdAt: string; adminEmail: string | null; targetEmail: string | null; }

const cardClass = 'rounded-2xl border border-[#243958] bg-[#14243B]/80';

async function apiCall(url: string, init?: RequestInit) {
  const response = await fetch(url, { credentials: 'same-origin', ...init, headers: { ...(init?.headers || {}), ...(init?.body ? { 'Content-Type': 'application/json' } : {}) } });
  let body: any = {};
  try { body = await response.json(); } catch { /* handled below */ }
  if (!response.ok) throw new Error(typeof body.message === 'string' ? body.message : 'Yêu cầu thất bại.');
  return body;
}

function fmtDate(value: string | undefined | null) { return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa đăng nhập'; }

export const AdminModule: React.FC<AdminModuleProps> = ({ user }) => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async (query = search) => {
    setLoading(true);
    setError('');
    try {
      const [nextOverview, nextUsers, nextLogs] = await Promise.all([
        apiCall('/api/admin/overview'),
        apiCall(`/api/admin/users?search=${encodeURIComponent(query)}`),
        apiCall('/api/admin/audit'),
      ]);
      setOverview(nextOverview as Overview);
      setUsers(Array.isArray(nextUsers.users) ? nextUsers.users : []);
      setLogs(Array.isArray(nextLogs.logs) ? nextLogs.logs : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị.');
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { if (user?.role === 'admin') void refresh(''); }, [user?.id, user?.role]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeStatus = async (target: AdminUser) => {
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';
    const question = nextStatus === 'suspended' ? `Tạm khóa tài khoản ${target.email}? Các phiên đăng nhập sẽ bị thu hồi.` : `Mở khóa tài khoản ${target.email}?`;
    if (!window.confirm(question)) return;
    setActionId(target.id); setError(''); setSuccess('');
    try {
      await apiCall(`/api/admin/users/${target.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
      setSuccess(nextStatus === 'suspended' ? 'Đã tạm khóa tài khoản và thu hồi phiên đăng nhập.' : 'Đã mở khóa tài khoản.');
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật tài khoản.'); }
    finally { setActionId(null); }
  };

  const changeRole = async (target: AdminUser) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    const question = nextRole === 'admin'
      ? `Cấp quyền Admin cho ${target.email}? Người này sẽ có quyền quản trị tài khoản.`
      : `Hạ quyền Admin của ${target.email} xuống Người dùng?`;
    if (!window.confirm(question)) return;
    setActionId(target.id); setError(''); setSuccess('');
    try {
      await apiCall(`/api/admin/users/${target.id}/role`, { method: 'PATCH', body: JSON.stringify({ role: nextRole }) });
      setSuccess(nextRole === 'admin' ? 'Đã cấp quyền Admin.' : 'Đã hạ quyền Admin.');
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật vai trò.'); }
    finally { setActionId(null); }
  };

  if (!user || user.role !== 'admin') {
    return <section className="mx-auto max-w-3xl px-4 py-16"><div className={`${cardClass} p-8 text-center`}><ShieldOff className="mx-auto h-12 w-12 text-rose-300" /><h1 className="mt-4 text-2xl font-black text-white">Không có quyền truy cập</h1><p className="mt-2 text-sm leading-6 text-slate-400">Trang quản trị yêu cầu tài khoản Admin đã được xác thực. Chỉ ẩn giao diện không đủ để cấp quyền; backend cũng kiểm tra quyền cho mọi thao tác.</p></div></section>;
  }

  const stats = overview ? [
    { label: 'Tổng tài khoản', value: overview.users.total, detail: `${overview.users.admins} quản trị viên`, icon: Users, color: 'text-sky-200', bg: 'bg-sky-300/10' },
    { label: 'Đang hoạt động', value: overview.users.active, detail: `${overview.users.suspended} đang tạm khóa`, icon: UserRoundCheck, color: 'text-emerald-200', bg: 'bg-emerald-300/10' },
    { label: 'Lượt phân tích đã lưu', value: overview.scans.total, detail: `${overview.scans.last24Hours} trong 24 giờ`, icon: Activity, color: 'text-violet-200', bg: 'bg-violet-300/10' },
    { label: 'Người dùng mới', value: overview.newUsersLast7Days, detail: 'Trong 7 ngày gần đây', icon: UserCog, color: 'text-amber-200', bg: 'bg-amber-300/10' },
  ] : [];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold text-violet-200"><ShieldCheck className="h-4 w-4" /> ADMINISTRATOR CONSOLE</div><h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Trung tâm quản trị</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Quản lý tài khoản, theo dõi sức khỏe dịch vụ và kiểm tra nhật ký thao tác quản trị.</p></div><button onClick={() => void refresh()} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#2B4364] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-[#203651] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới dữ liệu</button></div>

      {error && <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(stat => { const Icon = stat.icon; return <div key={stat.label} className={`${cardClass} p-5`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-400">{stat.label}</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{stat.value.toLocaleString('vi-VN')}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}><Icon className="h-5 w-5" /></div></div><p className="mt-3 text-xs text-slate-500">{stat.detail}</p></div>; })}</div>

      <div className={`${cardClass} mb-6 p-5 sm:p-6`}><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-white">Tình trạng hệ thống</h2><p className="mt-1 text-sm text-slate-400">Trạng thái cấu hình, không thay thế việc gọi thử dịch vụ.</p></div><div className="flex items-center gap-2 rounded-lg border border-[#2B4364] bg-[#0D192B] px-3 py-2 text-xs text-slate-300"><Bot className="h-4 w-4 text-[#55DDF2]" /> Model: <span className="font-mono text-slate-100">{overview?.ai.model || 'Chưa rõ'}</span></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-xl bg-[#0D192B] p-4"><span className={`h-2.5 w-2.5 rounded-full ${overview?.authStore.ready ? 'bg-emerald-400' : 'bg-rose-400'}`} /><div><p className="text-sm font-semibold text-white">Cơ sở dữ liệu tài khoản</p><p className="mt-1 text-xs text-slate-400">{overview?.authStore.ready ? 'Đã khởi tạo schema' : overview?.authStore.configured ? `Chưa sẵn sàng (${overview.authStore.errorCode || 'kiểm tra kết nối'})` : 'Chưa đặt DATABASE_URL'}</p></div></div><div className="flex items-center gap-3 rounded-xl bg-[#0D192B] p-4"><span className={`h-2.5 w-2.5 rounded-full ${overview?.ai.configured ? 'bg-emerald-400' : 'bg-amber-400'}`} /><div><p className="text-sm font-semibold text-white">Gemini API key</p><p className="mt-1 text-xs text-slate-400">{overview?.ai.configured ? 'Đã cấu hình trong backend' : 'Chưa được cấu hình'}</p></div></div><div className="flex items-center gap-3 rounded-xl bg-[#0D192B] p-4"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /><div><p className="text-sm font-semibold text-white">API xác thực</p><p className="mt-1 text-xs text-slate-400">Session lưu dạng hash; vai trò được kiểm tra phía server</p></div></div></div></div>

      <div className={`${cardClass} mb-6 overflow-hidden`}><div className="flex flex-col gap-4 border-b border-[#243958] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-white">Quản lý tài khoản</h2><p className="mt-1 text-sm text-slate-400">Tìm kiếm, tạm khóa/mở khóa và quản lý vai trò.</p></div><form className="flex w-full gap-2 sm:max-w-sm" onSubmit={event => { event.preventDefault(); void refresh(search); }}><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo email hoặc tên..." className="w-full rounded-lg border border-[#2B4364] bg-[#0D192B] py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-[#55DDF2]" /></div><button className="rounded-lg bg-[#203651] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2B486A]">Tìm</button></form></div>
        {loading && !users.length ? <div className="p-10 text-center text-sm text-slate-400">Đang tải dữ liệu...</div> : users.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Không tìm thấy tài khoản.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#0D192B] text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3 font-semibold">Tài khoản</th><th className="px-5 py-3 font-semibold">Vai trò</th><th className="px-5 py-3 font-semibold">Trạng thái</th><th className="px-5 py-3 font-semibold">Tạo lúc</th><th className="px-5 py-3 font-semibold">Đăng nhập gần nhất</th><th className="px-5 py-3 text-right font-semibold">Thao tác</th></tr></thead><tbody className="divide-y divide-[#243958]">{users.map(target => <tr key={target.id} className="align-top hover:bg-[#172941]/40"><td className="px-5 py-4"><p className="font-semibold text-white">{target.displayName}</p><p className="mt-1 text-xs text-slate-400">{target.email}</p>{target.id === user.id && <span className="mt-2 inline-block rounded bg-[#55DDF2]/10 px-2 py-0.5 text-[10px] font-bold text-[#8DEBFA]">TÀI KHOẢN CỦA BẠN</span>}</td><td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${target.role === 'admin' ? 'bg-violet-400/10 text-violet-200' : 'bg-sky-400/10 text-sky-200'}`}>{target.role === 'admin' ? 'Admin' : 'Người dùng'}</span></td><td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${target.status === 'active' ? 'bg-emerald-400/10 text-emerald-200' : 'bg-rose-400/10 text-rose-200'}`}>{target.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}</span></td><td className="px-5 py-4 text-xs text-slate-400">{fmtDate(target.createdAt)}</td><td className="px-5 py-4 text-xs text-slate-400">{fmtDate(target.lastLoginAt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button disabled={actionId === target.id || target.id === user.id} title={target.status === 'active' ? 'Tạm khóa' : 'Mở khóa'} onClick={() => void changeStatus(target)} className="rounded-lg border border-[#2B4364] p-2 text-slate-200 hover:bg-[#203651] disabled:cursor-not-allowed disabled:opacity-30">{target.status === 'active' ? <UserRoundX className="h-4 w-4" /> : <UserRoundCheck className="h-4 w-4" />}</button><button disabled={actionId === target.id || target.id === user.id} title={target.role === 'admin' ? 'Hạ xuống Người dùng' : 'Cấp quyền Admin'} onClick={() => void changeRole(target)} className="rounded-lg border border-violet-400/20 p-2 text-violet-200 hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-30">{target.role === 'admin' ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}</button></div></td></tr>)}</tbody></table></div>}
        <div className="border-t border-[#243958] px-5 py-3 text-xs text-slate-500">Hiển thị tối đa 200 tài khoản mới nhất phù hợp với từ khóa. Không hiển thị mật khẩu hoặc nội dung tệp của người dùng.</div>
      </div>

      <div className={`${cardClass} overflow-hidden`}><div className="border-b border-[#243958] p-5"><h2 className="flex items-center gap-2 text-lg font-bold text-white"><ClipboardList className="h-5 w-5 text-[#55DDF2]" /> Nhật ký kiểm toán Admin</h2><p className="mt-1 text-sm text-slate-400">Ghi lại các thay đổi vai trò và trạng thái tài khoản.</p></div>{logs.length === 0 ? <div className="p-8 text-center text-sm text-slate-400"><Clock3 className="mx-auto mb-2 h-6 w-6" />Chưa có thao tác quản trị được ghi nhận.</div> : <div className="divide-y divide-[#243958]">{logs.map(log => <div key={log.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-[#203651] px-2 py-1 text-xs font-semibold text-[#A9D8F0]">{log.action}</span><span className="text-xs text-slate-400">Quản trị: {log.adminEmail || 'Tài khoản đã xóa'}</span></div><p className="mt-2 text-sm text-slate-300">Đối tượng: {log.targetEmail || 'Không còn tài khoản đích'}{log.ipAddress ? ` · IP: ${log.ipAddress}` : ''}</p></div><time className="shrink-0 text-xs text-slate-500">{fmtDate(log.createdAt)}</time></div>)}</div>}</div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />Các thao tác quản trị ảnh hưởng trực tiếp đến tài khoản. Không chia sẻ thông tin đăng nhập Admin; chỉ cấp vai trò tối thiểu cần thiết.</p>
    </section>
  );
};

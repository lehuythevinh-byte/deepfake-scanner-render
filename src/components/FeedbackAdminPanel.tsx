import React, { useCallback, useEffect, useState } from 'react';
import { Star, RefreshCw, Search, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { SURVEY_AREA_LABELS } from './SurveyModal';

type FeedbackStatus = 'new' | 'reviewing' | 'acknowledged' | 'resolved' | 'no_action';
const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'Mới', reviewing: 'Đang xem xét', acknowledged: 'Đã ghi nhận', resolved: 'Đã xử lý', no_action: 'Không cần hành động',
};
const POSITIVE_LABELS: Record<string, string> = {
  ui: 'Giao diện', speed: 'Tốc độ', analysis_quality: 'Chất lượng phân tích', clear_reports: 'Báo cáo dễ hiểu', safety_guides: 'Hướng dẫn an toàn', other: 'Khác',
};

interface FeedbackItem {
  id: string; rating: number; positiveAspects: string[]; improvementAreas: string[]; comment: string;
  contactConsent: boolean; status: FeedbackStatus; adminNote: string; createdAt: string;
  userDisplayName: string | null; userEmail: string | null;
}
interface FeedbackResponse {
  summary: { total: number; average: number | null; unhandled: number; since: string | null; distribution: Record<string, number>; topIssues: { area: string; count: number }[] };
  items: FeedbackItem[]; page: number; pageSize: number; totalItems: number;
}

const fmt = (v: string) => new Date(v).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const FeedbackAdminPanel: React.FC = () => {
  const [data, setData] = useState<FeedbackResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ rating: '', status: '', area: '', from: '', to: '', search: '' });
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      (Object.entries(filters) as [string, string][]).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/admin/feedback?${params}`, { credentials: 'same-origin', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Không tải được phản hồi.');
      setData(json as FeedbackResponse);
    } catch (e: any) { setError(e?.message || 'Không tải được phản hồi.'); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { void load(); }, [load]);

  const patch = async (id: string, body: { status?: FeedbackStatus; adminNote?: string }) => {
    setSaving(id); setError(null);
    try {
      const res = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Không cập nhật được.');
      await load();
    } catch (e: any) { setError(e?.message || 'Không cập nhật được.'); }
    finally { setSaving(null); }
  };

  const setFilter = (k: keyof typeof filters, v: string) => { setPage(1); setFilters((f) => ({ ...f, [k]: v })); };
  const summary = data?.summary;
  const totalPages = data ? Math.max(1, Math.ceil(data.totalItems / data.pageSize)) : 1;
  const field = 'rounded-md border border-[#35506d] bg-[#0e1a2d] p-2 text-sm text-white';

  return (
    <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden" aria-labelledby="feedback-heading">
      <div className="p-4 sm:p-5 border-b border-[#243956] flex items-center justify-between gap-3">
        <div>
          <h2 id="feedback-heading" className="font-bold text-white text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#55DDF2]" /> Khảo sát chất lượng</h2>
          <p className="text-xs text-slate-400 mt-1">Số liệu tính trực tiếp từ phản hồi thật trong cơ sở dữ liệu{summary?.since ? ` (từ ${fmt(summary.since)})` : ''}.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới</button>
      </div>

      {error && <div role="alert" className="m-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}

      {summary && summary.total === 0 && !loading ? (
        <div className="p-8 text-center text-slate-400">Chưa có dữ liệu khảo sát.</div>
      ) : summary && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 p-4">
            <div className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4"><div className="text-xs text-slate-400">Tổng phản hồi</div><div className="text-2xl font-bold text-white">{summary.total}</div></div>
            <div className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4"><div className="text-xs text-slate-400">Điểm trung bình</div><div className="text-2xl font-bold text-white flex items-center gap-1.5">{summary.average ?? '—'}<Star className="w-5 h-5 fill-amber-300 text-amber-300" /></div></div>
            <div className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4"><div className="text-xs text-slate-400">Chưa xử lý (Mới)</div><div className="text-2xl font-bold text-white">{summary.unhandled}</div></div>
          </div>
          <div className="px-4 pb-4 grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5" aria-label="Phân bố số sao">
              {[5, 4, 3, 2, 1].map((n) => {
                const count = summary.distribution[String(n)] || 0;
                const pct = summary.total ? Math.round((count / summary.total) * 100) : 0;
                return <div key={n} className="flex items-center gap-2 text-xs text-slate-300"><span className="w-12">{n} sao</span><div className="flex-1 h-2 rounded bg-[#0e1a2d]"><div className="h-2 rounded bg-[#55DDF2]" style={{ width: `${pct}%` }} /></div><span className="w-16 text-right">{count} ({pct}%)</span></div>;
              })}
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1.5">Vấn đề được chọn nhiều nhất</div>
              {summary.topIssues.length === 0 ? <div className="text-xs text-slate-500">Chưa có người chọn nhóm vấn đề.</div> :
                <ul className="space-y-1 text-sm text-slate-200">{summary.topIssues.map((i) => <li key={i.area} className="flex justify-between"><span>{SURVEY_AREA_LABELS[i.area] || i.area}</span><span className="text-slate-400">{i.count}</span></li>)}</ul>}
            </div>
          </div>

          <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            <select aria-label="Lọc theo số sao" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)} className={field}><option value="">Mọi số sao</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} sao</option>)}</select>
            <select aria-label="Lọc theo trạng thái" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} className={field}><option value="">Mọi trạng thái</option>{Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <select aria-label="Lọc theo nhóm vấn đề" value={filters.area} onChange={(e) => setFilter('area', e.target.value)} className={field}><option value="">Mọi vấn đề</option>{Object.entries(SURVEY_AREA_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input aria-label="Từ ngày" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} className={field} />
            <input aria-label="Đến ngày" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} className={field} />
            <div className="relative"><Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" /><input aria-label="Tìm trong góp ý" placeholder="Tìm góp ý…" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} className={`${field} w-full pl-8`} /></div>
          </div>

          <div className="divide-y divide-[#243956] border-t border-[#243956]">
            {data!.items.length === 0 && <div className="p-6 text-sm text-slate-400">Không có phản hồi khớp bộ lọc.</div>}
            {data!.items.map((item) => (
              <div key={item.id} className="p-4">
                <button className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-1" aria-expanded={openId === item.id} onClick={() => setOpenId(openId === item.id ? null : item.id)}>
                  <span className="flex items-center gap-0.5" aria-label={`${item.rating} sao`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-4 h-4 ${n <= item.rating ? 'fill-amber-300 text-amber-300' : 'text-slate-600'}`} />)}<span className="ml-1.5 text-xs text-slate-300">{item.rating}/5</span></span>
                  <span className="text-xs text-slate-400">{fmt(item.createdAt)}</span>
                  <span className="rounded-full border border-[#35506d] px-2 py-0.5 text-xs text-slate-200">{STATUS_LABELS[item.status]}</span>
                  <span className="text-xs text-slate-500 truncate max-w-full">{item.comment ? item.comment.slice(0, 90) : 'Không có góp ý bằng văn bản'}</span>
                </button>
                {openId === item.id && (
                  <div className="mt-3 space-y-3 rounded-xl bg-[#0e1a2d] border border-[#243956] p-4 text-sm">
                    <div className="text-xs text-slate-400">Người gửi: {item.userDisplayName || 'Tài khoản đã xóa'} · {item.contactConsent ? <>đồng ý liên hệ{item.userEmail ? <> · {item.userEmail}</> : null}</> : 'không yêu cầu liên hệ'}</div>
                    {item.positiveAspects.length > 0 && <div><span className="text-slate-400">Hài lòng về: </span><span className="text-slate-200">{item.positiveAspects.map((k) => POSITIVE_LABELS[k] || k).join(', ')}</span></div>}
                    {item.improvementAreas.length > 0 && <div><span className="text-slate-400">Cần cải thiện: </span><span className="text-slate-200">{item.improvementAreas.map((k) => SURVEY_AREA_LABELS[k] || k).join(', ')}</span></div>}
                    {item.comment && <p className="whitespace-pre-wrap text-slate-100 break-words">{item.comment}</p>}
                    <div className="grid sm:grid-cols-[auto_1fr_auto] gap-2 items-end">
                      <label className="text-xs text-slate-400">Trạng thái<select value={item.status} disabled={saving === item.id} onChange={(e) => void patch(item.id, { status: e.target.value as FeedbackStatus })} className={`${field} mt-1 block`}>{Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
                      <label className="text-xs text-slate-400">Ghi chú quản trị<input maxLength={1000} value={notes[item.id] ?? item.adminNote} onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))} className={`${field} mt-1 block w-full`} /></label>
                      <button disabled={saving === item.id || (notes[item.id] ?? item.adminNote) === item.adminNote} onClick={() => void patch(item.id, { adminNote: notes[item.id] ?? '' })} className="rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-100 hover:bg-[#172941] disabled:opacity-40">Lưu ghi chú</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[#243956] flex items-center justify-between text-xs text-slate-400">
            <span>{data!.totalItems} phản hồi · trang {data!.page}/{totalPages}</span>
            <div className="flex gap-2">
              <button aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-[#35506d] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button aria-label="Trang sau" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-[#35506d] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
      {!summary && loading && <div className="p-8 text-center text-slate-400"><RefreshCw className="w-5 h-5 animate-spin inline mr-2" />Đang tải…</div>}
    </section>
  );
};

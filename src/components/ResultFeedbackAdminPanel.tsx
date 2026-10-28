import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';

type Module = 'scanner' | 'link_scanner';
type Sentiment = 'helpful' | 'okay' | 'not_helpful';
const MODULE_LABEL: Record<Module, string> = { scanner: 'AI Scanner', link_scanner: 'Link Scanner' };
const SENTIMENT_LABEL: Record<Sentiment, string> = { helpful: '👍 Hữu ích', okay: '😐 Tạm ổn', not_helpful: '👎 Chưa hữu ích' };

interface Item { id: string; module: Module; resultId: string; sentiment: Sentiment; comment: string; createdAt: string; userDisplayName: string | null; userEmail: string | null }
interface Resp { stats: Record<'all' | Module, Record<Sentiment, number>>; items: Item[]; page: number; pageSize: number; totalItems: number }

const fmt = (v: string) => new Date(v).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
const total = (s: Record<Sentiment, number>) => s.helpful + s.okay + s.not_helpful;

export const ResultFeedbackAdminPanel: React.FC = () => {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ module: '', sentiment: '', withComment: '' });
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(page) });
      (Object.entries(filters) as [string, string][]).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await fetch(`/api/admin/result-feedback?${params}`, { credentials: 'same-origin', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Không tải được phản hồi.');
      setData(json as Resp);
    } catch (e: any) { setError(e?.message || 'Không tải được phản hồi.'); }
    finally { setLoading(false); }
  }, [filters, page]);
  useEffect(() => { void load(); }, [load]);

  const setFilter = (k: keyof typeof filters, v: string) => { setPage(1); setFilters((f) => ({ ...f, [k]: v })); };
  const totalPages = data ? Math.max(1, Math.ceil(data.totalItems / data.pageSize)) : 1;
  const field = 'rounded-md border border-[#35506d] bg-[#0e1a2d] p-2 text-sm text-white';
  const cards: { key: 'all' | Module; label: string }[] = [
    { key: 'all', label: 'Tất cả' }, { key: 'scanner', label: 'AI Scanner' }, { key: 'link_scanner', label: 'Link Scanner' },
  ];

  return (
    <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden" aria-labelledby="result-feedback-heading">
      <div className="p-4 sm:p-5 border-b border-[#243956] flex items-center justify-between gap-3">
        <div>
          <h2 id="result-feedback-heading" className="font-bold text-white text-lg flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-[#55DDF2]" /> Đánh giá kết quả quét</h2>
          <p className="text-xs text-slate-400 mt-1">Phản hồi ngay dưới kết quả của AI Scanner và Link Scanner. Không lưu ảnh, video hay đường link.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới</button>
      </div>
      {error && <div role="alert" className="m-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}

      {data && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 p-4">
            {cards.map(({ key, label }) => {
              const s = data.stats[key]; const t = total(s);
              const pct = (n: number) => (t ? Math.round((n / t) * 100) : 0);
              return (
                <div key={key} className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4">
                  <div className="text-xs text-slate-400">{label} · {t} đánh giá</div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    {(['helpful', 'okay', 'not_helpful'] as Sentiment[]).map((k) => (
                      <li key={k} className="flex justify-between"><span>{SENTIMENT_LABEL[k]}</span><span className="text-slate-400">{s[k]} ({pct(s[k])}%)</span></li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-3 flex flex-wrap gap-2 items-center">
            <select aria-label="Lọc theo module" value={filters.module} onChange={(e) => setFilter('module', e.target.value)} className={field}>
              <option value="">Mọi module</option><option value="scanner">AI Scanner</option><option value="link_scanner">Link Scanner</option>
            </select>
            <select aria-label="Lọc theo mức đánh giá" value={filters.sentiment} onChange={(e) => setFilter('sentiment', e.target.value)} className={field}>
              <option value="">Mọi mức đánh giá</option><option value="helpful">Hữu ích</option><option value="okay">Tạm ổn</option><option value="not_helpful">Chưa hữu ích</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={filters.withComment === '1'} onChange={(e) => setFilter('withComment', e.target.checked ? '1' : '')} /> Chỉ xem có góp ý</label>
          </div>

          {data.items.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Chưa có đánh giá phù hợp.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-400 bg-[#0e1a2d]"><tr>
                  <th className="text-left font-medium p-3">Thời gian</th><th className="text-left font-medium p-3">Module</th><th className="text-left font-medium p-3">Mã kết quả</th><th className="text-left font-medium p-3">Đánh giá</th><th className="text-left font-medium p-3">Góp ý</th><th className="text-left font-medium p-3">Tài khoản</th>
                </tr></thead>
                <tbody className="divide-y divide-[#243956]">
                  {data.items.map((i) => (
                    <tr key={i.id} className="align-top">
                      <td className="p-3 text-slate-300 whitespace-nowrap">{fmt(i.createdAt)}</td>
                      <td className="p-3 text-slate-300 whitespace-nowrap">{MODULE_LABEL[i.module]}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs whitespace-nowrap">{i.resultId}</td>
                      <td className="p-3 text-slate-200 whitespace-nowrap">{SENTIMENT_LABEL[i.sentiment]}</td>
                      <td className="p-3 text-slate-300 min-w-[200px] whitespace-pre-wrap break-words">{i.comment || <span className="text-slate-500">—</span>}</td>
                      <td className="p-3 text-slate-400 break-all">{i.userDisplayName || i.userEmail || 'Tài khoản đã xóa'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3 border-t border-[#243956] flex items-center justify-between text-xs text-slate-400">
            <span>{data.totalItems} đánh giá</span>
            <div className="flex items-center gap-2">
              <button aria-label="Trang trước" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="p-1.5 rounded border border-[#35506d] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <span>Trang {page}/{totalPages}</span>
              <button aria-label="Trang sau" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)} className="p-1.5 rounded border border-[#35506d] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

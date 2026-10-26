import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw } from 'lucide-react';

type Level = 'active' | 'not_configured' | 'unavailable' | 'unknown';
interface StatusData {
  ai: Level; aiModel: string | null; aiLastSuccessAt: string | null; aiLastFailureAt: string | null; aiLastFailureStatus: number | null;
  database: 'active' | 'unavailable'; website: 'active'; checkedAt: string;
}

const LABEL: Record<Level, string> = {
  active: 'Đang hoạt động', not_configured: 'Chưa cấu hình', unavailable: 'Tạm thời không khả dụng', unknown: 'Không xác định',
};
const TONE: Record<Level, string> = {
  active: 'bg-emerald-400', not_configured: 'bg-amber-400', unavailable: 'bg-rose-400', unknown: 'bg-slate-400',
};
const fmt = (v: string | null) => (v ? new Date(v).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—');

export const SystemStatusPanel: React.FC = () => {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/admin/system-status', { credentials: 'same-origin', cache: 'no-store' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || 'Không tải được tình trạng hệ thống.');
      setData(json as StatusData);
    } catch (e: any) { setError(e?.message || 'Không tải được tình trạng hệ thống.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const rows: { name: string; level: Level; note: string }[] = data ? [
    {
      name: 'Trí tuệ nhân tạo (Gemini)', level: data.ai,
      note: data.ai === 'not_configured' ? 'Chưa có khóa API; hệ thống dùng quy tắc dự phòng.'
        : data.ai === 'unknown' ? 'Chưa có lượt gọi AI nào kể từ lần khởi động gần nhất.'
        : data.ai === 'unavailable' ? `Lần lỗi gần nhất: ${fmt(data.aiLastFailureAt)}${data.aiLastFailureStatus ? ` (mã ${data.aiLastFailureStatus})` : ''}.`
        : `Lần thành công gần nhất: ${fmt(data.aiLastSuccessAt)}${data.aiModel ? ` · ${data.aiModel}` : ''}.`,
    },
    { name: 'Cơ sở dữ liệu', level: data.database, note: data.database === 'active' ? 'Truy vấn kiểm tra thành công.' : 'Không truy vấn được cơ sở dữ liệu.' },
    { name: 'Website', level: data.website, note: 'Máy chủ đang phản hồi yêu cầu này.' },
  ] : [];

  return (
    <section className="rounded-2xl border border-[#243956] bg-[#13233b] overflow-hidden" aria-labelledby="system-status-heading">
      <div className="p-4 sm:p-5 border-b border-[#243956] flex items-center justify-between gap-3">
        <div>
          <h2 id="system-status-heading" className="font-bold text-white text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-[#55DDF2]" /> Tình trạng hệ thống</h2>
          <p className="text-xs text-slate-400 mt-1">Chỉ quản trị viên xem được. Trạng thái AI lấy từ lần gọi Gemini thực tế gần nhất, không suy đoán.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#35506d] px-3 py-2 text-sm text-slate-200 hover:bg-[#172941] disabled:opacity-50"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới</button>
      </div>
      {error && <div role="alert" className="m-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}
      <div className="grid sm:grid-cols-3 gap-3 p-4">
        {rows.map((r) => (
          <div key={r.name} className="rounded-xl bg-[#0e1a2d] border border-[#243956] p-4">
            <div className="text-xs text-slate-400">{r.name}</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white"><span className={`w-2.5 h-2.5 rounded-full ${TONE[r.level]}`} />{LABEL[r.level]}</div>
            <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">{r.note}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

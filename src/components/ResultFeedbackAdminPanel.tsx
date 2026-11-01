import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';

export const ResultFeedbackAdminPanel: React.FC = () => {
  const [stats, setStats] = useState<{ helpful: number; unhelpful: number; total: number; recent: any[] }>({
    helpful: 0,
    unhelpful: 0,
    total: 0,
    recent: [],
  });
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/result-feedback', { credentials: 'same-origin', cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        const all = data.stats?.all || {};
        setStats({
          helpful: Number(all.helpful || 0),
          unhelpful: Number(all.not_helpful || 0),
          total: Number(data.totalItems || 0),
          recent: Array.isArray(data.items) ? data.items : [],
        });
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStats();
  }, []);

  return (
    <div className="rounded-xl border border-[#243956] bg-[#13233b] p-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#243956]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-emerald-400" />
          Đánh giá độ chính xác quét Deepfake
        </h3>
        <button
          onClick={() => void loadStats()}
          disabled={loading}
          className="p-1 rounded text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-[#0e1a2d] border border-[#1e324d]">
          <div className="text-slate-400 text-[10px]">Tổng lượt phản hồi</div>
          <div className="text-base font-bold text-white mt-0.5">{stats.total}</div>
        </div>
        <div className="p-2 rounded-lg bg-[#0e1a2d] border border-[#1e324d]">
          <div className="text-emerald-400 text-[10px] flex items-center justify-center gap-1">
            <ThumbsUp className="w-3 h-3" /> Chính xác
          </div>
          <div className="text-base font-bold text-emerald-300 mt-0.5">{stats.helpful}</div>
        </div>
        <div className="p-2 rounded-lg bg-[#0e1a2d] border border-[#1e324d]">
          <div className="text-rose-400 text-[10px] flex items-center justify-center gap-1">
            <ThumbsDown className="w-3 h-3" /> Chưa đúng
          </div>
          <div className="text-base font-bold text-rose-300 mt-0.5">{stats.unhelpful}</div>
        </div>
      </div>
    </div>
  );
};

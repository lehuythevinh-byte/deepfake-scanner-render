import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';

export const FeedbackAdminPanel: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', { credentials: 'same-origin', cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.items)) {
        setFeedbacks(data.items);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedbacks();
  }, []);

  return (
    <div className="rounded-xl border border-[#243956] bg-[#13233b] p-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#243956]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#55DDF2]" />
          Phản hồi khảo sát & góp ý người dùng ({feedbacks.length})
        </h3>
        <button
          onClick={() => void loadFeedbacks()}
          disabled={loading}
          className="p-1 rounded text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
        {feedbacks.length === 0 ? (
          <div className="text-slate-500 py-3 text-center">Chưa có phản hồi nào được ghi nhận.</div>
        ) : (
          feedbacks.map((f, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-[#0e1a2d] border border-[#1e324d] text-slate-300">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>{f.userDisplayName || f.userEmail || 'Tài khoản'}</span>
                <span>{f.createdAt ? new Date(f.createdAt).toLocaleDateString('vi-VN') : ''}</span>
              </div>
              <p>{f.comment || (Array.isArray(f.improvementAreas) ? f.improvementAreas.join(', ') : '') || `Đánh giá ${f.rating || 'chung'}/5`}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

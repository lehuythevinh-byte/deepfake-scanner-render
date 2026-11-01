import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, CheckCircle, Send } from 'lucide-react';

interface ResultFeedbackProps {
  module: string;
  resultId: string;
}

export const ResultFeedback: React.FC<ResultFeedbackProps> = ({ module, resultId }) => {
  const [rating, setRating] = useState<'helpful' | 'unhelpful' | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const handleSubmit = async (selectedRating?: 'helpful' | 'unhelpful') => {
    const activeRating = selectedRating || rating;
    if (!activeRating) return;

    setSubmitting(true);
    try {
      await fetch('/api/result-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          resultId,
          rating: activeRating,
          comment: comment.trim(),
        }),
      });
      setSubmitted(true);
    } catch {
      // Graceful fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-3 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Cảm ơn bạn đã gửi phản hồi giúp cải thiện chất lượng nhận diện của hệ thống!</span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-xl bg-[#111e33] border border-[#243956] text-xs">
      <div className="flex items-center justify-between gap-3">
        <span className="text-slate-300 font-medium">Kết quả phân tích này có chính xác và hữu ích không?</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRating('helpful');
              setShowCommentBox(true);
              void handleSubmit('helpful');
            }}
            disabled={submitting}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition ${
              rating === 'helpful'
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Chính xác</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setRating('unhelpful');
              setShowCommentBox(true);
            }}
            disabled={submitting}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition ${
              rating === 'unhelpful'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Chưa đúng</span>
          </button>
        </div>
      </div>

      {showCommentBox && !submitted && rating === 'unhelpful' && (
        <div className="mt-2.5 pt-2 border-t border-[#1e324d] flex items-center gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Góp ý thêm (tùy chọn): điểm nào chưa chính xác?..."
            className="flex-1 bg-[#0c1626] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2]"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#55DDF2] text-[#0A111E] font-medium text-xs hover:bg-[#40cde3] transition disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>Gửi</span>
          </button>
        </div>
      )}
    </div>
  );
};

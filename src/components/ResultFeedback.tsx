import React, { useState } from 'react';

type Sentiment = 'helpful' | 'okay' | 'not_helpful';
type Phase = 'idle' | 'sending' | 'done';

const OPTIONS: { value: Sentiment; emoji: string; label: string }[] = [
  { value: 'helpful', emoji: '👍', label: 'Hữu ích' },
  { value: 'okay', emoji: '😐', label: 'Tạm ổn' },
  { value: 'not_helpful', emoji: '👎', label: 'Chưa hữu ích' },
];
const MAX = 500;

interface ResultFeedbackProps {
  module: 'scanner' | 'link_scanner';
  /** Id of the exact result being rated (server-issued reportId). */
  resultId: string;
}

/**
 * Compact inline rating shown directly under one analysis result.
 * Mount it with key={resultId} so every new result starts with a fresh form.
 * It never changes the result and never blocks further use of the tool.
 */
export const ResultFeedback: React.FC<ResultFeedbackProps> = ({ module, resultId }) => {
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [comment, setComment] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!sentiment || phase !== 'idle') return;
    setPhase('sending');
    setError(null);
    try {
      const res = await fetch('/api/result-feedback', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module, resultId, sentiment, comment: comment.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      // 409 = this result was already rated: treat as done so it cannot be sent twice.
      if (res.ok || res.status === 409) { setPhase('done'); return; }
      throw new Error(data.message || 'Chưa gửi được góp ý. Bạn thử lại nhé.');
    } catch (e: any) {
      setError(e?.message || 'Chưa gửi được góp ý. Bạn thử lại nhé.');
      setPhase('idle');
    }
  };

  if (phase === 'done') {
    return (
      <div role="status" className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        Cảm ơn bạn nhé! Góp ý của bạn giúp chúng mình tốt hơn 💙
      </div>
    );
  }

  return (
    <section aria-label="Đánh giá kết quả" className="mt-4 rounded-xl border border-slate-700/60 bg-[#0f1a2e] px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <p className="text-sm font-semibold text-slate-200">Bạn thấy kết quả này thế nào?</p>
        <div role="radiogroup" aria-label="Mức độ hài lòng" className="flex flex-wrap gap-2">
          {OPTIONS.map((o) => {
            const active = sentiment === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={phase === 'sending'}
                onClick={() => setSentiment(o.value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2] ${
                  active ? 'bg-[#55DDF2]/15 border-[#55DDF2] text-[#55DDF2]' : 'border-[#35506d] text-slate-300 hover:border-slate-400'
                }`}
              >
                <span aria-hidden="true">{o.emoji}</span> {o.label}
              </button>
            );
          })}
        </div>
      </div>

      {sentiment && (
        <div className="mt-3 space-y-2">
          <label htmlFor={`fb-${resultId}`} className="block text-xs text-slate-300">Bạn muốn chúng mình cải thiện điều gì? (không bắt buộc)</label>
          <textarea
            id={`fb-${resultId}`}
            value={comment}
            maxLength={MAX}
            rows={2}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-[#35506d] bg-[#0e1a2d] p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]"
            placeholder="Đừng ghi mật khẩu hay thông tin cá nhân nhé."
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">{comment.length}/{MAX}</span>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={phase === 'sending'}
              className="px-4 py-2 rounded-lg bg-[#55DDF2] text-[#101C32] text-xs font-bold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {phase === 'sending' ? 'Đang gửi…' : 'Gửi góp ý'}
            </button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
    </section>
  );
};

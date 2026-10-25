import React, { useEffect, useRef, useState } from 'react';
import { Star, X, RefreshCw, AlertCircle, Check } from 'lucide-react';

const RATING_LABELS = ['Rất không hài lòng', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
const POSITIVE = [
  ['ui', 'Giao diện dễ sử dụng'], ['speed', 'Tốc độ xử lý'], ['analysis_quality', 'Chất lượng phân tích'],
  ['clear_reports', 'Báo cáo dễ hiểu'], ['safety_guides', 'Hướng dẫn an toàn hữu ích'], ['other', 'Khác'],
];
const IMPROVE = [
  ['ai_no_response', 'AI đôi lúc không phản hồi'], ['unclear_results', 'Kết quả chưa đủ rõ ràng'], ['slow', 'Thời gian xử lý lâu'],
  ['hard_ui', 'Giao diện khó sử dụng'], ['missing_features', 'Thiếu tính năng'], ['technical_errors', 'Gặp lỗi kỹ thuật'], ['other', 'Khác'],
];

export const SURVEY_AREA_LABELS: Record<string, string> = Object.fromEntries(IMPROVE);

interface SurveyModalProps {
  open: boolean;
  maxCommentLength?: number;
  onClose: () => void;               // closes without recording a choice (e.g. Esc / X): treated as "later"
  onDefer: (kind: 'snooze' | 'dismiss') => Promise<void> | void;
  onSubmitted: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ open, maxCommentLength = 1000, onClose, onDefer, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [positive, setPositive] = useState<string[]>([]);
  const [improve, setImprove] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [contact, setContact] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  const submit = async () => {
    if (rating < 1 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, positiveAspects: positive, improvementAreas: improve, comment: comment.trim(), contactConsent: contact }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Chưa gửi được đánh giá. Vui lòng thử lại.');
      setDone(true);          // only after the server confirmed the save
      window.setTimeout(onSubmitted, 1800);
    } catch (e: any) {
      // Keep everything the user typed so they can retry.
      setError(e?.message || 'Không kết nối được máy chủ. Nội dung của bạn vẫn được giữ lại, hãy thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const defer = async (kind: 'snooze' | 'dismiss') => {
    if (busy) return;
    setBusy(true);
    try { await onDefer(kind); } finally { setBusy(false); }
  };

  const shown = hover || rating;
  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2] ${active ? 'bg-[#55DDF2]/15 border-[#55DDF2] text-[#55DDF2]' : 'border-[#35506d] text-slate-300 hover:border-slate-400'}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" role="presentation">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="survey-title"
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#55DDF2]/20 bg-[#0d1830] shadow-2xl shadow-cyan-500/10 outline-none">
        <div className="sticky top-0 flex justify-end p-3 bg-[#0d1830]/95 backdrop-blur z-10">
          <button onClick={onClose} disabled={busy} aria-label="Đóng khảo sát" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 sm:px-7 pb-6 -mt-4">
          {done ? (
            <div role="status" className="py-10 text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-400/10 text-emerald-300 flex items-center justify-center"><Check className="w-7 h-7" /></div>
              <h2 className="text-xl font-bold text-white">Cảm ơn bạn đã đánh giá</h2>
              <p className="text-sm text-slate-400">Phản hồi của bạn đã được lưu và gửi tới quản trị viên.</p>
            </div>
          ) : (
            <>
              <h2 id="survey-title" className="text-xl sm:text-2xl font-bold text-white">Bạn đánh giá DEEPFAKE SCANNER như thế nào?</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">Ý kiến của bạn giúp chúng tôi cải thiện chất lượng phân tích, tốc độ xử lý và trải nghiệm an toàn số.</p>

              <fieldset className="mt-6">
                <legend className="text-sm font-semibold text-slate-200">Bạn hài lòng với chất lượng tổng thể của nền tảng đến mức nào?</legend>
                <div className="mt-3 flex items-center gap-1.5" role="radiogroup" aria-label="Đánh giá từ 1 đến 5 sao" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={rating === n}
                      aria-label={`${n} sao — ${RATING_LABELS[n - 1]}`}
                      onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setRating(Math.min(5, (rating || 0) + 1)); }
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setRating(Math.max(1, (rating || 2) - 1)); }
                      }}
                      className="p-1.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]">
                      <Star className={`w-9 h-9 transition ${n <= shown ? 'fill-amber-300 text-amber-300' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
                {/* Text label means the level is never conveyed by colour alone */}
                <p className="mt-2 min-h-[1.25rem] text-sm text-[#55DDF2]" aria-live="polite">
                  {shown ? `${shown}/5 sao — ${RATING_LABELS[shown - 1]}` : 'Chưa chọn số sao'}
                </p>
              </fieldset>

              {rating > 0 && (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-2">Điều gì bạn hài lòng nhất? <span className="font-normal text-slate-500">(tùy chọn)</span></p>
                    <div className="flex flex-wrap gap-2">{POSITIVE.map(([k, l]) => <button type="button" key={k} aria-pressed={positive.includes(k)} onClick={() => toggle(positive, setPositive, k)} className={chip(positive.includes(k))}>{l}</button>)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-2">Vấn đề nào cần cải thiện nhất? <span className="font-normal text-slate-500">(tùy chọn)</span></p>
                    <div className="flex flex-wrap gap-2">{IMPROVE.map(([k, l]) => <button type="button" key={k} aria-pressed={improve.includes(k)} onClick={() => toggle(improve, setImprove, k)} className={chip(improve.includes(k))}>{l}</button>)}</div>
                  </div>
                  <div>
                    <label htmlFor="survey-comment" className="text-sm font-semibold text-slate-200">Bạn muốn chúng tôi cải thiện điều gì? <span className="font-normal text-slate-500">(tùy chọn)</span></label>
                    <textarea id="survey-comment" value={comment} onChange={(e) => setComment(e.target.value.slice(0, maxCommentLength))} rows={3}
                      placeholder="Hãy chia sẻ đề xuất hoặc vấn đề bạn gặp phải…"
                      className="mt-2 w-full rounded-xl border border-[#35506d] bg-[#0a1327] px-3 py-2.5 text-sm text-white outline-none focus:border-[#55DDF2]" />
                    <div className="text-right text-[11px] text-slate-500">{comment.length}/{maxCommentLength}</div>
                  </div>
                  <label className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} className="mt-1 w-4 h-4 accent-[#55DDF2]" />
                    <span>Tôi đồng ý để quản trị viên liên hệ về phản hồi này qua email của tài khoản.</span>
                  </label>
                </div>
              )}

              {error && <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200"><AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span></div>}

              <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex gap-2">
                  <button type="button" disabled={busy} onClick={() => void defer('snooze')} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm text-slate-300 border border-[#35506d] hover:bg-white/5 disabled:opacity-50">Để sau</button>
                  <button type="button" disabled={busy} onClick={() => void defer('dismiss')} className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 disabled:opacity-50">Không phải lúc này</button>
                </div>
                <button type="button" onClick={() => void submit()} disabled={rating < 1 || busy}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#55DDF2] text-[#08121f] font-bold text-sm hover:bg-cyan-200 disabled:opacity-40 disabled:cursor-not-allowed">
                  {busy && <RefreshCw className="w-4 h-4 animate-spin" />}{busy ? 'Đang gửi…' : error ? 'Thử gửi lại' : 'Gửi đánh giá'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

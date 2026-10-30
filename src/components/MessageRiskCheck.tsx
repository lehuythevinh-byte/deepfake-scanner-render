import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Clock3, ExternalLink, Info, RefreshCw, ScanText, ShieldAlert, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';

type ThreatScenario = {
  id: string;
  title: string;
  evidenceType: 'reported_pattern' | 'emerging_pattern' | 'proactive_scenario';
  summary: string;
  exampleMessage: string;
  signs: string[];
  safetySteps: string[];
};

type ThreatSource = { title: string; url: string };
type ThreatFeed = {
  scenarios: ThreatScenario[];
  sources: ThreatSource[];
  updatedAt: string;
  nextRefreshAt: string;
  sourceStatus: 'web_grounded' | 'ai_only';
  model: string;
};
type AIAnalysis = {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical' | 'inconclusive';
  summary: string;
  signals: { title: string; evidence: string; explanation: string; advice: string }[];
  immediateActions: string[];
  limitations: string;
  intelligenceUpdatedAt?: string | null;
  aiProvider?: 'gemini' | 'openai' | 'deepseek';
  aiModel?: string;
};

const dateLabel = (value?: string | null) => {
  if (!value) return 'Chưa có dữ liệu';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa xác định' : date.toLocaleString('vi-VN');
};

const evidenceLabels: Record<ThreatScenario['evidenceType'], string> = {
  reported_pattern: 'Có nguồn ghi nhận',
  emerging_pattern: 'Dấu hiệu mới nổi',
  proactive_scenario: 'Tình huống dự báo',
};

const levelLabels: Record<AIAnalysis['level'], string> = {
  low: 'Ít dấu hiệu rõ ràng',
  medium: 'Cần kiểm tra kỹ',
  high: 'Rủi ro cao',
  critical: 'Nguy cơ nghiêm trọng',
  inconclusive: 'Chưa đủ dữ liệu',
};

export const MessageRiskCheck: React.FC = () => {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [feed, setFeed] = useState<ThreatFeed | null>(null);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedRefreshing, setFeedRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [agreedToSend, setAgreedToSend] = useState(false);
  const [error, setError] = useState('');
  const [feedError, setFeedError] = useState('');

  const loadFeed = useCallback(async (force = false) => {
    if (force) setFeedRefreshing(true);
    else setFeedLoading(true);
    setFeedError('');
    try {
      const response = force
        ? await fetch('/api/threat-intelligence/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}), cache: 'no-store' })
        : await fetch('/api/threat-intelligence/scenarios', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Chưa tải được tình huống mới từ AI.');
      setFeed(data as ThreatFeed);
    } catch (err: any) {
      setFeedError(err?.message || 'Không kết nối được dịch vụ cập nhật tình huống.');
    } finally {
      setFeedLoading(false);
      setFeedRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
    // The server only generates a new set once per 24-hour window; polling does not mean a new AI call every hour.
    const timer = window.setInterval(() => void loadFeed(), 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [loadFeed]);

  const handleAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 8) {
      setError('Hãy nhập ít nhất 8 ký tự để AI có đủ ngữ cảnh phân tích.');
      setAnalysis(null);
      return;
    }
    if (!agreedToSend) {
      setError('Hãy xác nhận đồng ý gửi nội dung đến máy chủ và nhà cung cấp AI được chọn trước khi phân tích.');
      return;
    }
    setError('');
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/threat-intelligence/analyze', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'AI chưa phân tích được nội dung này. Hãy thử lại sau.');
      setAnalysis(data as AIAnalysis);
    } catch (err: any) {
      setError(err?.message || 'Không kết nối được hệ thống AI.');
    } finally {
      setAnalyzing(false);
    }
  };

  const pickScenario = (scenario: ThreatScenario) => {
    setMessage(scenario.exampleMessage || scenario.summary);
    setAnalysis(null);
    setError('');
    setAgreedToSend(false);
  };

  const tone = analysis?.level === 'critical' || analysis?.level === 'high'
    ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
    : analysis?.level === 'medium'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
      : analysis?.level === 'low'
        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100'
        : 'border-slate-700 bg-slate-800/60 text-slate-200';

  return (
    <section className="rounded-2xl border border-[#55DDF2]/25 bg-gradient-to-br from-[#14253c] via-[#101c30] to-[#11192a] overflow-hidden shadow-xl" aria-labelledby="message-risk-title">
      <div className="p-5 md:p-7 border-b border-white/5">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#55DDF2]/10 border border-[#55DDF2]/30 text-[#55DDF2] flex items-center justify-center shrink-0"><ScanText className="w-5 h-5" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#55DDF2] uppercase">AI phân tích mở</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border border-cyan-500/30 bg-cyan-500/10 text-cyan-200"><Sparkles className="w-3 h-3" /> Không khóa vào bộ từ khóa cố định</span>
              </div>
              <h2 id="message-risk-title" className="text-lg md:text-xl font-bold text-white">Phân tích tin nhắn và chiêu trò mới</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">AI đọc ngữ cảnh, cách gây áp lực và sự kết hợp giữa nhiều dấu hiệu — kể cả cách diễn đạt chưa có trong bộ mẫu. Danh sách tình huống được tạo lại từ thông tin web mới, định kỳ 24 giờ.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void loadFeed(true)} disabled={feedRefreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#55DDF2]/30 bg-[#55DDF2]/10 px-3 py-2 text-xs font-semibold text-[#a9eaf5] hover:bg-[#55DDF2]/15 disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${feedRefreshing ? 'animate-spin' : ''}`} /> {feedRefreshing ? 'Đang cập nhật…' : 'Cập nhật tình huống'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={handleAnalyze} className="p-5 md:p-7 space-y-4 xl:border-r border-white/5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="message-risk-input" className="text-sm font-semibold text-slate-200">Nội dung cần kiểm tra</label>
            <span className="text-[10px] text-slate-500">{message.length.toLocaleString('vi-VN')} / 10.000</span>
          </div>
          <textarea id="message-risk-input" value={message} onChange={(event) => { setMessage(event.target.value); setError(''); }} rows={8} maxLength={10000} placeholder="Dán tin nhắn, lời thoại được chép lại hoặc nội dung bài đăng. Có thể xóa tên, số điện thoại và thông tin cá nhân trước khi gửi…" className="w-full rounded-xl border border-slate-700 bg-[#0b1424] px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#55DDF2]/60 focus:ring-2 focus:ring-[#55DDF2]/10 resize-y" />
          <label className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-100/90 cursor-pointer">
            <input type="checkbox" checked={agreedToSend} onChange={(event) => setAgreedToSend(event.target.checked)} className="mt-0.5 accent-cyan-400" />
            <span>Tôi hiểu nội dung sẽ được gửi đến máy chủ và một nhà cung cấp AI đã cấu hình (Gemini, OpenAI hoặc DeepSeek). Nếu nhà cung cấp đang lỗi/quá tải, máy chủ có thể lần lượt chuyển yêu cầu sang nhà cung cấp dự phòng khác. Không gửi mật khẩu, mã OTP, số giấy tờ hoặc thông tin riêng tư không cần thiết.</span>
          </label>
          {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={analyzing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55DDF2] to-[#38bdf8] px-4 py-2.5 text-xs font-bold text-[#08121f] hover:brightness-110 disabled:opacity-60 transition"><WandSparkles className={`w-4 h-4 ${analyzing ? 'animate-pulse' : ''}`} /> {analyzing ? 'AI đang phân tích…' : 'Phân tích bằng AI'}</button>
            <button type="button" onClick={() => { setMessage(''); setAnalysis(null); setError(''); setAgreedToSend(false); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition">Xóa nội dung</button>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">AI có thể sai. Điểm rủi ro thể hiện mức độ đáng ngờ do mô hình đánh giá, không phải xác suất gian lận và không xác minh danh tính người gửi.</p>
        </form>

        <div className="p-5 md:p-7 min-h-[320px]">
          {!analysis ? (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-700/80 bg-[#0b1424]/40 p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3"><ShieldAlert className="w-6 h-6" /></div>
              <h3 className="text-sm font-bold text-slate-200">Kết quả AI sẽ xuất hiện tại đây</h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">AI xem xét ngữ cảnh, dấu hiệu kết hợp và các thủ thuật mới trong tình huống; không chỉ tìm từ khóa trùng với ví dụ phổ biến.</p>
            </div>
          ) : (
            <div role="status" className="space-y-4">
              <div className={`rounded-xl border p-4 ${tone}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><p className="text-[10px] uppercase tracking-[0.15em] opacity-75 font-bold">Đánh giá tổng hợp của AI</p><h3 className="mt-1 text-base font-bold">{levelLabels[analysis.level]}</h3></div>
                  <div className="text-center rounded-xl border border-current/20 px-3 py-2"><div className="text-2xl font-extrabold tabular-nums">{Math.max(0, Math.min(100, Math.round(analysis.score)))}</div><div className="text-[9px] uppercase tracking-wider">/100 mức cảnh báo</div></div>
                </div>
                <div className="h-2 rounded-full bg-black/20 overflow-hidden mt-3"><div className={`h-full ${analysis.level === 'critical' || analysis.level === 'high' ? 'bg-rose-400' : analysis.level === 'medium' ? 'bg-amber-300' : 'bg-cyan-300'}`} style={{ width: `${Math.max(0, Math.min(100, analysis.score))}%` }} /></div>
                <p className="text-xs leading-relaxed mt-3">{analysis.summary}</p>
                {analysis.aiProvider && <p className="mt-2 text-[10px] opacity-70">Nhà cung cấp: {analysis.aiProvider.toUpperCase()} {analysis.aiModel ? `· ${analysis.aiModel}` : ''}</p>}
              </div>
              {analysis.signals?.length > 0 && <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300">Các dấu hiệu AI giải thích</h3>
                {analysis.signals.map((signal, index) => <div key={`${signal.title}-${index}`} className="rounded-xl border border-slate-700/80 bg-[#0b1424]/65 p-3.5">
                  <h4 className="text-xs font-bold text-slate-100">{signal.title}</h4>
                  {signal.evidence && <p className="mt-1 text-[11px] text-[#a9d8f0]">Bằng chứng trong nội dung: “{signal.evidence}”</p>}
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{signal.explanation}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-emerald-200"><strong>Nên làm:</strong> {signal.advice}</p>
                </div>)}
              </div>}
              {analysis.immediateActions?.length > 0 && <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3.5"><h4 className="text-xs font-bold text-cyan-100 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Hành động ưu tiên</h4><ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">{analysis.immediateActions.map((action, index) => <li key={`${index}-${action}`}>{action}</li>)}</ul></div>}
              {analysis.limitations && <p className="text-[10px] leading-relaxed text-slate-500">Giới hạn: {analysis.limitations}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 p-5 md:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#55DDF2] text-[10px] uppercase tracking-[0.16em] font-bold"><Clock3 className="w-3.5 h-3.5" /> Tình huống được AI cập nhật</div>
            <h3 className="text-base md:text-lg font-bold text-white mt-1">Tình huống mới và thủ thuật kết hợp</h3>
            <p className="text-[11px] text-slate-400 mt-1">Không giới hạn ở một danh sách phổ biến. AI tìm nguồn web gần đây rồi tạo các tình huống để luyện kiểm chứng.</p>
          </div>
          {feed?.updatedAt && <div className="text-[10px] text-slate-400">Cập nhật lần cuối: <strong className="text-slate-200">{dateLabel(feed.updatedAt)}</strong></div>}
        </div>
        {feedLoading ? <div className="py-8 text-center text-xs text-slate-400"><RefreshCw className="w-4 h-4 animate-spin inline mr-2" />Đang lấy tình huống AI mới…</div> : feedError && !feed ? <div role="alert" className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-amber-100"><p>{feedError}</p><p className="mt-1 text-amber-100/70">Kiểm tra các API key AI trong Render Environment hoặc thử cập nhật lại sau.</p><button type="button" onClick={() => void loadFeed()} className="mt-3 underline">Thử lại</button></div> : null}
        {feedError && feed && <p role="status" className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-100">Chưa lấy được bản mới; đang giữ bộ tình huống đã cập nhật lúc {dateLabel(feed.updatedAt)}. {feedError}</p>}
        {feed && <>
          {feed.sourceStatus === 'web_grounded' ? <p className="text-[10px] text-emerald-300">Đã đối chiếu tìm kiếm web · Dự kiến cập nhật tiếp: {dateLabel(feed.nextRefreshAt)}</p> : <p className="text-[10px] text-amber-300">AI đã sinh tình huống nhưng lượt này chưa trả về nguồn web để xác minh độc lập.</p>}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {feed.scenarios.map((scenario) => <article key={scenario.id} className="rounded-xl border border-slate-700/80 bg-[#0b1424]/70 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold border ${scenario.evidenceType === 'reported_pattern' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : scenario.evidenceType === 'emerging_pattern' ? 'border-amber-500/30 bg-amber-500/10 text-amber-200' : 'border-violet-500/30 bg-violet-500/10 text-violet-200'}`}>{evidenceLabels[scenario.evidenceType]}</span><span className="text-[9px] text-slate-500">AI · {feed.model}</span></div>
              <h4 className="text-sm font-bold text-white leading-snug">{scenario.title}</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">{scenario.summary}</p>
              {scenario.signs?.length > 0 && <div><p className="text-[10px] uppercase tracking-wide text-amber-200 font-bold mb-1">Dấu hiệu cần chú ý</p><ul className="list-disc list-inside space-y-1 text-[10px] leading-relaxed text-slate-400">{scenario.signs.slice(0, 4).map((sign, index) => <li key={`${scenario.id}-sign-${index}`}>{sign}</li>)}</ul></div>}
              {scenario.safetySteps?.length > 0 && <p className="text-[10px] leading-relaxed text-emerald-200"><strong>Ứng phó:</strong> {scenario.safetySteps.slice(0, 3).join(' · ')}</p>}
              {scenario.exampleMessage && <button type="button" onClick={() => pickScenario(scenario)} className="text-[10px] font-semibold text-[#55DDF2] hover:underline">Dùng tình huống này để thử AI →</button>}
            </article>)}
          </div>
          {feed.sources?.length > 0 && <div className="pt-3 border-t border-white/5"><h4 className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5" /> Nguồn web dùng để cập nhật</h4><div className="flex flex-wrap gap-x-4 gap-y-2">{feed.sources.slice(0, 8).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#a9d8f0] hover:underline">{source.title || source.url} ↗</a>)}</div></div>}
        </>}
      </div>
      <div className="px-5 md:px-7 py-3 bg-black/10 border-t border-white/5 flex items-start gap-2 text-[10px] leading-relaxed text-slate-500"><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Tình huống được AI tạo từ nguồn công khai, không phải danh sách đầy đủ mọi thủ thuật. Nhãn “dự báo” không đồng nghĩa đã có sự việc được xác minh. Không có kết quả cảnh báo cũng không chứng minh nội dung an toàn.</div>
    </section>
  );
};

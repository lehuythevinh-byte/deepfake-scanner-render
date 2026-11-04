import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertOctagon, AlertTriangle, Archive, ArrowRight, AudioLines, BadgeCheck, BookOpen,
  Camera, Check, CheckCircle2, Clock3, Copy, Download, FileAudio, FileImage,
  FileSearch, FileVideo, Fingerprint, Globe, Image as ImageIcon,
  Info, KeyRound, Link2, LockKeyhole, MapPin, MessageSquareWarning, Play, QrCode, Radar,
  RefreshCw, ScanEye, Search, Shield, ShieldAlert, ShieldCheck, Sparkles, Trash2, Upload,
  Video, XCircle, Zap
} from 'lucide-react';
import type { AuthUser } from '../types';
import {
  analyzeScamLocally, deleteEvidenceBlob, getEvidenceBlob, readJpegExif,
  saveEvidenceBlob, sha256File
} from '../lib/v4Local';

type Props = { user: AuthUser | null; initialPanel: PanelId; initialMediaMode?: 'video' | 'audio' };
type PanelId = 'origin' | 'scam' | 'qr' | 'forensics' | 'evidence' | 'media' | 'threats';
type ApiError = { error?: string; message?: string };

const PANELS: Array<{ id: PanelId; label: string; short: string; icon: React.ElementType }> = [
  { id: 'origin', label: 'Digital Origin', short: 'Nguồn gốc số', icon: Fingerprint },
  { id: 'scam', label: 'Scam Intelligence', short: 'Tin nhắn lừa đảo', icon: MessageSquareWarning },
  { id: 'qr', label: 'QR Shield', short: 'Kiểm tra mã QR', icon: QrCode },
  { id: 'forensics', label: 'AI Forensics', short: 'Ảnh & bản đồ vùng', icon: ScanEye },
  { id: 'evidence', label: 'Evidence Vault', short: 'Kho bằng chứng', icon: Archive },
  { id: 'media', label: 'Video & Audio', short: 'Phân tích đa phương tiện', icon: FileVideo },
  { id: 'threats', label: 'Threat Intelligence', short: 'Cảnh báo an toàn số', icon: Radar },
];

const cls = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');
const card = 'rounded-2xl border border-slate-700/70 bg-[#121f33] shadow-xl shadow-black/10';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50';
const primary = `${button} bg-cyan-500 text-slate-950 hover:bg-cyan-400`;
const secondary = `${button} border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700`;
const input = 'w-full rounded-xl border border-slate-700 bg-[#0b1627] px-3.5 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500';
const muted = 'text-sm leading-6 text-slate-400';
const smallLabel = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as ApiError).message || (data as ApiError).error || `HTTP_${response.status}`);
  return data as T;
}

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  return btoa(binary);
}

function RiskPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    medium: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    high: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
    critical: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    inconclusive: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
  };
  const labels: Record<string, string> = { low: 'Rủi ro thấp theo dấu hiệu đã kiểm tra', medium: 'Cần thận trọng', high: 'Rủi ro cao', critical: 'Rủi ro nghiêm trọng', inconclusive: 'Chưa đủ dữ liệu' };
  return <span className={cls('inline-flex rounded-full border px-3 py-1 text-xs font-semibold', styles[level] || styles.inconclusive)}>{labels[level] || level}</span>;
}

function SectionTitle({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: React.ElementType }) {
  return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300"><Icon size={24}/></div>
    <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p><h2 className="mt-1 text-2xl font-bold text-white">{title}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">{description}</p></div>
  </div>;
}

function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  const style = tone === 'warning' ? 'border-amber-500/30 bg-amber-500/10 text-amber-100' : tone === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100' : 'border-cyan-500/25 bg-cyan-500/10 text-cyan-100';
  const Icon = tone === 'warning' ? AlertTriangle : tone === 'success' ? CheckCircle2 : Info;
  return <div className={cls('flex gap-3 rounded-xl border p-3.5 text-sm leading-6', style)}><Icon className="mt-0.5 shrink-0" size={18}/><div>{children}</div></div>;
}

export const DigitalTrustToolsModule: React.FC<Props> = ({ user, initialPanel, initialMediaMode = 'video' }) => {
  const current = PANELS.find((item) => item.id === initialPanel) || PANELS[0];
  const panelContent = <>
    {initialPanel === 'origin' && <DigitalOriginPanel/>}
    {initialPanel === 'scam' && <ScamPanel/>}
    {initialPanel === 'qr' && <QrPanel/>}
    {initialPanel === 'forensics' && <ForensicsPanel/>}
    {initialPanel === 'evidence' && <EvidenceVaultPanel user={user} />}
    {initialPanel === 'media' && <MediaForensicsPanel initialMode={initialMediaMode} />}
    {initialPanel === 'threats' && <ThreatIntelligencePanel isAdmin={user?.role === 'admin'} />}
  </>;
  return <div className={`${card} min-h-[360px] p-4 sm:p-6`}>
    <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
      <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">V5 · Digital Forensics</p><p className="mt-1 text-sm font-semibold text-white">{current.label}</p></div>
      <span className="rounded-lg border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold text-slate-400">{current.short}</span>
    </div>
    {panelContent}
  </div>;
};

function DigitalOriginPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState('');
  const [exif, setExif] = useState<Record<string, string | number | null> | null>(null);
  const [c2pa, setC2pa] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [c2paConsent, setC2paConsent] = useState(false);
  const choose = async (next: File | null) => {
    setFile(next); setHash(''); setExif(null); setC2pa(null); setError(''); setC2paConsent(false);
    if (!next) return;
    if (next.size > 25 * 1024 * 1024) { setError('File vượt quá 25 MB. Hãy chọn file nhỏ hơn.'); setFile(null); return; }
    setBusy(true);
    try {
      const [digest, metadata] = await Promise.all([sha256File(next), readJpegExif(next)]);
      setHash(digest); setExif(metadata || { exifFound: 'Định dạng này chưa được trích xuất EXIF bằng bộ đọc cục bộ hiện tại.' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Không đọc được file.'); }
    finally { setBusy(false); }
  };
  const checkC2pa = async () => {
    if (!file || !c2paConsent) return;
    setBusy(true); setError(''); setC2pa(null);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error('C2PA kiểm tra qua backend hiện giới hạn file 8 MB.');
      const fileBase64 = await fileToBase64(file);
      const data = await postJson<any>('/api/v4/digital-origin/c2pa', { fileName: file.name, mimeType: file.type || 'application/octet-stream', fileBase64, consentC2PA: true });
      setC2pa(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không kiểm tra được C2PA.'); }
    finally { setBusy(false); }
  };
  return <div>
    <SectionTitle eyebrow="Provenance & Integrity" title="Digital Origin" description="Tính SHA-256 và đọc metadata ngay trên thiết bị. Xác minh manifest C2PA là thao tác riêng, có xin phép tải file lên backend." icon={Fingerprint}/>
    <div className={`${card} p-4 sm:p-5`}>
      <label className={smallLabel}>Chọn file ảnh hoặc video</label>
      <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime" onChange={(e) => void choose(e.target.files?.[0] || null)} className={input}/>
      {file && <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-900/70 p-3"><p className="text-[10px] uppercase text-slate-500">Tên file</p><p className="mt-1 break-all text-xs text-white">{file.name}</p></div>
        <div className="rounded-xl bg-slate-900/70 p-3"><p className="text-[10px] uppercase text-slate-500">Dung lượng</p><p className="mt-1 text-xs text-white">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
        <div className="rounded-xl bg-slate-900/70 p-3"><p className="text-[10px] uppercase text-slate-500">MIME khai báo</p><p className="mt-1 text-xs text-white">{file.type || 'Không xác định'}</p></div>
      </div>}
      {busy && <p className="mt-3 text-xs text-cyan-300">Đang xử lý file trên thiết bị…</p>}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
    {hash && <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <div className={`${card} p-4`}>
        <div className="flex items-center gap-2 text-sm font-bold text-white"><Fingerprint size={18} className="text-cyan-300"/> SHA-256</div>
        <p className="mt-3 break-all rounded-xl bg-[#091321] p-3 font-mono text-xs leading-6 text-cyan-100">{hash}</p>
        <button className={`${secondary} mt-3`} onClick={() => void navigator.clipboard.writeText(hash)}><Copy size={14}/> Sao chép hash</button>
        <p className="mt-3 text-xs text-slate-500">Hash được tính từ byte file trên thiết bị; không tải file lên để tính hash.</p>
      </div>
      <div className={`${card} p-4`}>
        <div className="flex items-center gap-2 text-sm font-bold text-white"><FileSearch size={18} className="text-violet-300"/> EXIF / Metadata</div>
        <div className="mt-3 space-y-2">
          {Object.entries(exif || {}).map(([key, value]) => <div key={key} className="flex justify-between gap-3 border-b border-slate-800 py-2 text-xs"><span className="text-slate-400">{key}</span><span className="max-w-[65%] break-words text-right text-slate-200">{String(value ?? '—')}</span></div>)}
        </div>
        <p className="mt-3 text-xs text-slate-500">Bộ đọc EXIF cục bộ hiện hỗ trợ các trường JPEG phổ biến. Không tìm thấy EXIF không có nghĩa file giả.</p>
      </div>
    </div>}
    <div className={`${card} mt-4 p-4`}>
      <div className="flex items-center gap-2 text-sm font-bold text-white"><BadgeCheck size={18} className="text-emerald-300"/> C2PA Content Credentials</div>
      <p className="mt-2 text-xs leading-5 text-slate-400">C2PA có thể cung cấp lịch sử nguồn gốc và chỉnh sửa có chữ ký. Kết quả cần phân biệt manifest, tính hợp lệ và mức độ tin cậy của chứng chỉ.</p>
      <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300"><input type="checkbox" checked={c2paConsent} onChange={(e) => setC2paConsent(e.target.checked)} className="mt-1"/> Tôi đồng ý gửi file đã chọn đến máy chủ Deepfake Scanner để kiểm tra C2PA. File chỉ xử lý trong bộ nhớ của yêu cầu và không được lưu vào kho bằng chứng.</label>
      <button className={`${primary} mt-3`} disabled={!file || !c2paConsent || busy} onClick={() => void checkC2pa()}><ShieldCheck size={16}/> Xác minh C2PA</button>
      {c2pa && <div className="mt-4 rounded-xl border border-slate-700 bg-[#0a1525] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-white">Trạng thái: {c2pa.statusLabel || c2pa.status}</p><span className={cls('rounded-full border px-3 py-1 text-xs font-semibold', c2pa.status === 'TRUSTED' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : c2pa.status === 'INVALID' ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-amber-500/30 bg-amber-500/10 text-amber-100')}>{c2pa.status}</span></div>
        <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-5 text-slate-300">{JSON.stringify(c2pa.summary || c2pa, null, 2)}</pre>
      </div>}
      <p className="mt-3 text-[11px] text-slate-500">Không có C2PA là trạng thái “không có thông tin xác thực”, không phải bằng chứng deepfake. Có manifest cũng không chứng minh nội dung bên trong là sự thật.</p>
    </div>
  </div>;
}

function ScamPanel() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ReturnType<typeof analyzeScamLocally> | null>(null);
  const [remoteConsent, setRemoteConsent] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const analyzeLocal = () => { setResult(analyzeScamLocally(text)); setAiResult(null); setError(''); };
  const analyzeAi = async () => {
    if (!remoteConsent || !text.trim()) return;
    setBusy(true); setError('');
    try {
      const data = await postJson<any>('/api/v4/scam/analyze-ai', { text, consentExternalAI: true });
      setAiResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'AI chưa xử lý được nội dung.'); }
    finally { setBusy(false); }
  };
  return <div>
    <SectionTitle eyebrow="Social Engineering Defense" title="Scam Message Intelligence" description="Bắt đầu bằng sàng lọc cục bộ. Chỉ gửi tin nhắn đến AI bên ngoài khi bạn chủ động bật đồng ý." icon={MessageSquareWarning}/>
    <div className={`${card} p-4`}>
      <label className={smallLabel}>Dán tin nhắn / email đáng ngờ</label>
      <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 12000))} rows={7} className={input} placeholder="Ví dụ: Tài khoản của bạn sẽ bị khóa. Hãy cung cấp mã OTP để xác minh…"/>
      <div className="mt-2 flex justify-between text-[11px] text-slate-500"><span>Dữ liệu được phân tích cục bộ trước.</span><span>{text.length}/12000</span></div>
      <div className="mt-3 flex flex-wrap gap-2"><button className={primary} disabled={!text.trim()} onClick={analyzeLocal}><Search size={15}/> Phân tích cục bộ</button><button className={secondary} disabled={!text.trim() || busy || !remoteConsent} onClick={() => void analyzeAi()}><Sparkles size={15}/> Phân tích nâng cao bằng AI</button></div>
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-300"><input type="checkbox" className="mt-1" checked={remoteConsent} onChange={(e) => setRemoteConsent(e.target.checked)}/> Tôi đồng ý gửi nội dung tin nhắn đến nhà cung cấp AI bên ngoài để phân tích ngữ cảnh. Tôi đã tự loại bỏ OTP, mật khẩu, số tài khoản hoặc dữ liệu cá nhân không cần thiết.</label>
      {busy && <p className="mt-3 text-xs text-cyan-300">Đang gửi yêu cầu AI…</p>}
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
    {result && <div className={`${card} mt-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-white">Kết quả sàng lọc cục bộ</h3><RiskPill level={result.level}/></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className={cls('h-full rounded-full', result.score >= 75 ? 'bg-rose-500' : result.score >= 50 ? 'bg-orange-400' : result.score >= 20 ? 'bg-amber-400' : 'bg-emerald-400')} style={{ width: `${result.score}%` }}/></div>
      <p className="mt-2 text-xs text-slate-400">Điểm quy tắc: {result.score}/100 · Không phải xác suất lừa đảo.</p>
      <div className="mt-4 space-y-2">{result.findings.length ? result.findings.map((f, i) => <div key={`${f.category}-${i}`} className="rounded-xl border border-slate-700 bg-[#0a1525] p-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-white">{f.category}</strong><span className="text-[10px] uppercase text-amber-300">{f.severity}</span></div><p className="mt-1 text-xs text-cyan-200">“{f.phrase}”</p><p className="mt-1 text-xs leading-5 text-slate-400">{f.explanation}</p></div>) : <Notice tone="success">Bộ quy tắc cục bộ chưa phát hiện mẫu đáng ngờ phổ biến. Không có nghĩa tin nhắn đã được xác minh an toàn.</Notice>}</div>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-300">{result.actions.map((a) => <li key={a}>{a}</li>)}</ul>
      <p className="mt-3 text-[11px] text-slate-500">{result.disclaimer}</p>
    </div>}
    {aiResult && <div className={`${card} mt-4 p-4`}><div className="flex items-center justify-between gap-2"><h3 className="font-bold text-white">Phân tích ngữ cảnh AI</h3><span className="text-[10px] text-cyan-300">{aiResult.provider} · {aiResult.model}</span></div><RiskPill level={aiResult.result?.riskLevel || 'inconclusive'}/><p className="mt-3 text-sm leading-6 text-slate-300">{aiResult.result?.explanation}</p><div className="mt-3 space-y-2">{(aiResult.result?.indicators || []).map((f: any, i: number) => <div key={i} className="rounded-lg bg-slate-900 p-3 text-xs"><strong className="text-white">{f.quote}</strong><p className="mt-1 text-slate-400">{f.reason}</p></div>)}</div><ul className="mt-3 list-disc pl-5 text-xs text-slate-300">{(aiResult.result?.safeActions || []).map((a: string) => <li key={a}>{a}</li>)}</ul><p className="mt-3 text-[11px] text-slate-500">AI tạo nhận định hỗ trợ; hãy xác minh danh tính và thông tin qua kênh chính thức.</p></div>}
  </div>;
}

function QrPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [value, setValue] = useState('');
  const [scanError, setScanError] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkResult, setLinkResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopCamera = useCallback(() => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; }, []);
  useEffect(() => () => stopCamera(), [stopCamera]);
  const scanFile = async (next: File | null) => {
    setFile(next); setValue(''); setScanError(''); setLinkResult(null);
    if (!next) return;
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) { setScanError('Trình duyệt hiện tại chưa hỗ trợ BarcodeDetector. Bạn có thể nhập nội dung QR đã giải mã bằng ứng dụng camera đáng tin cậy vào ô bên dưới.'); return; }
    setBusy(true);
    try {
      const detector = new Detector({ formats: ['qr_code'] });
      const bitmap = await createImageBitmap(next);
      const codes = await detector.detect(bitmap);
      bitmap.close();
      if (!codes.length) throw new Error('Không tìm thấy mã QR đọc được trong ảnh.');
      setValue(String(codes[0].rawValue || ''));
    } catch (e) { setScanError(e instanceof Error ? e.message : 'Không giải mã được QR.'); }
    finally { setBusy(false); }
  };
  const startCamera = async () => {
    setScanError('');
    try {
      const Detector = (window as any).BarcodeDetector;
      if (!Detector || !navigator.mediaDevices?.getUserMedia) throw new Error('Trình duyệt không hỗ trợ quét QR camera. Hãy dùng tải ảnh hoặc nhập nội dung.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      await videoRef.current?.play();
      const detector = new Detector({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes[0]?.rawValue) { setValue(String(codes[0].rawValue)); stopCamera(); return; }
        } catch { /* keep scanning current frame */ }
        window.setTimeout(() => void tick(), 450);
      };
      void tick();
    } catch (e) { setScanError(e instanceof Error ? e.message : 'Không thể mở camera.'); stopCamera(); }
  };
  const inspect = async () => {
    const raw = value.trim();
    if (!raw) return;
    setLinkResult(null); setScanError('');
    if (!/^https?:\/\//i.test(raw)) {
      setLinkResult({ nonUrl: true, payload: raw });
      return;
    }
    setBusy(true);
    try { setLinkResult(await postJson<any>('/api/link-scan', { url: raw })); }
    catch (e) { setScanError(e instanceof Error ? e.message : 'Không kiểm tra được URL.'); }
    finally { setBusy(false); }
  };
  return <div>
    <SectionTitle eyebrow="QR & Phishing Protection" title="QR Shield" description="Giải mã QR bằng BarcodeDetector trên trình duyệt. URL sau khi giải mã được chuyển sang Link Scanner hiện tại; không tự động mở đường link." icon={QrCode}/>
    <div className={`${card} p-4`}>
      <div className="grid gap-4 md:grid-cols-2">
        <div><label className={smallLabel}>Quét từ ảnh QR</label><input type="file" accept="image/*" onChange={(e) => void scanFile(e.target.files?.[0] || null)} className={input}/><button className={`${secondary} mt-3`} onClick={() => void startCamera()}><Camera size={15}/> Mở camera quét QR</button></div>
        <div><label className={smallLabel}>Camera (nếu được cấp quyền)</label><video ref={videoRef} className="aspect-video w-full rounded-xl bg-black object-cover" playsInline muted/><button className={`${secondary} mt-2`} onClick={stopCamera}><XCircle size={14}/> Dừng camera</button></div>
      </div>
      {busy && <p className="mt-3 text-xs text-cyan-300">Đang giải mã / kiểm tra…</p>}
      {scanError && <p className="mt-3 text-xs text-amber-200">{scanError}</p>}
      <div className="mt-4"><label className={smallLabel}>Nội dung QR đã giải mã (có thể nhập thủ công)</label><textarea className={input} rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://example.com hoặc nội dung QR…"/></div>
      <button className={`${primary} mt-3`} disabled={!value.trim() || busy} onClick={() => void inspect()}><ShieldAlert size={15}/> Kiểm tra nội dung</button>
    </div>
    {linkResult && <div className={`${card} mt-4 p-4`}>
      {linkResult.nonUrl ? <><h3 className="font-bold text-white">QR chứa văn bản không phải URL</h3><p className="mt-2 break-words text-sm text-slate-300">{linkResult.payload}</p><p className="mt-2 text-xs text-slate-500">Không tự động thực thi hoặc mở nội dung.</p></> : <><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Kết quả Link Scanner</h3><RiskPill level={linkResult.riskLevel === 'dangerous' ? 'critical' : linkResult.riskLevel === 'suspicious' ? 'medium' : 'low'}/></div><p className="mt-2 break-all text-xs text-cyan-200">{linkResult.normalizedUrl}</p><p className="mt-2 text-sm leading-6 text-slate-300">{linkResult.summary}</p><div className="mt-3 space-y-2">{(linkResult.findings || []).map((f: any, i: number) => <p key={i} className="rounded-lg bg-slate-900 p-2 text-xs text-slate-300">{f.message}</p>)}</div><p className="mt-3 text-[11px] text-slate-500">Link Scanner đánh giá dấu hiệu từ URL, không tải hoặc kiểm tra nội dung trang đích.</p></>}
    </div>}
  </div>;
}

function ForensicsPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [remoteConsent, setRemoteConsent] = useState(false);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (!file) { setPreview(''); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  const inspect = async () => {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) { setError('Chỉ hỗ trợ JPEG, PNG và WEBP.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Ảnh vượt quá giới hạn 8 MB.'); return; }
    setBusy(true); setResult(null); setError('');
    try {
      const data = await postJson<any>('/api/v4/forensics/image', { fileName: file.name, mimeType: file.type, imageBase64: await fileToBase64(file), consentExternalAI: true });
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không phân tích được ảnh.'); }
    finally { setBusy(false); }
  };
  return <div>
    <SectionTitle eyebrow="Explainable Image Triage" title="AI Forensics" description="Mô hình thị giác có thể đề xuất vùng ảnh cần quan sát. Khung vùng là gợi ý của mô hình, không phải heatmap khoa học đã được hiệu chuẩn." icon={ScanEye}/>
    <div className={`${card} p-4`}>
      <label className={smallLabel}>Chọn ảnh cần phân tích</label><input type="file" accept="image/jpeg,image/png,image/webp" className={input} onChange={(e) => { setFile(e.target.files?.[0] || null); setResult(null); setError(''); setRemoteConsent(false); }}/>
      <div className="mt-3 flex flex-wrap gap-2"><button className={primary} disabled={!file || busy || !remoteConsent} onClick={() => void inspect()}><Sparkles size={15}/> Phân tích bằng AI</button>{busy && <span className="self-center text-xs text-cyan-300">Đang xử lý; thời gian phụ thuộc nhà cung cấp AI…</span>}</div>
      <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-300"><input type="checkbox" className="mt-1" checked={remoteConsent} onChange={(e) => setRemoteConsent(e.target.checked)}/> Tôi đồng ý gửi ảnh đã chọn tới nhà cung cấp AI bên ngoài để phân tích. Tôi hiểu rằng ảnh có thể chứa thông tin nhận dạng và đã chọn file phù hợp để chia sẻ.</label>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
    {result && <div className={`${card} mt-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Kết quả phân tích hình ảnh</h3><span className="text-[10px] text-cyan-300">{result.provider} · {result.model}</span></div>
      <RiskPill level={result.result?.overallRisk || 'inconclusive'}/>
      <p className="mt-3 text-sm leading-6 text-slate-300">{result.result?.summary}</p>
      {preview && <div className="relative mt-4 inline-block max-w-full overflow-hidden rounded-xl border border-slate-600"><img src={preview} alt="Ảnh đang kiểm tra" className="block max-h-[560px] max-w-full object-contain"/>{(result.result?.regions || []).map((r: any, i: number) => <div key={i} className="absolute border-2 border-rose-400 bg-rose-400/10" style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.width * 100}%`, height: `${r.height * 100}%` }}><span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-rose-600 px-1 py-0.5 text-[9px] text-white">{i + 1}. {r.severity}</span></div>)}</div>}
      <div className="mt-4 space-y-2">{(result.result?.regions || []).map((r: any, i: number) => <div key={i} className="rounded-xl bg-[#0a1525] p-3"><strong className="text-xs text-white">Vùng {i + 1} · {r.severity}</strong><p className="mt-1 text-xs leading-5 text-slate-400">{r.reason}</p></div>)}</div>
      <Notice tone="warning">Vùng đánh dấu là vị trí mô hình ước lượng cần xem xét. Đây không phải kết luận pháp chứng, không phải bằng chứng pixel giả mạo và không chứng minh ảnh là deepfake.</Notice>
    </div>}
  </div>;
}

type EvidenceRecord = { id: string; title: string; originalName: string; mimeType: string; sizeBytes: number; sha256: string; storageMode: string; createdAt: string; integrityStatus: string };

function EvidenceVaultPanel({ user }: { user: AuthUser | null }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [items, setItems] = useState<EvidenceRecord[]>([]);
  const [eventsById, setEventsById] = useState<Record<string, any>>({});
  const [eventsBusyId, setEventsBusyId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/v4/evidence', { credentials: 'same-origin', cache: 'no-store' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || d.error || 'Không tải được danh sách.');
      setItems(d.items || []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được Vault.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const loadEvents = async (itemId: string) => {
    setEventsBusyId(itemId);
    try {
      const r = await fetch(`/api/v4/evidence/${encodeURIComponent(itemId)}/events`, { credentials: 'same-origin', cache: 'no-store' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || d.error || 'Không tải được nhật ký.');
      setEventsById((old) => ({ ...old, [itemId]: d }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được nhật ký bằng chứng.');
    } finally { setEventsBusyId(''); }
  };
  const save = async () => {
    if (!file || !user) return;
    if (file.size > 50 * 1024 * 1024) { setError('File vượt giới hạn 50 MB.'); return; }
    setBusy(true); setError(''); setMessage('');
    const id = crypto.randomUUID();
    try {
      const hash = await sha256File(file);
      await saveEvidenceBlob(id, user.id, file, vaultPassphrase);
      const data = await postJson<any>('/api/v4/evidence', {
        id, title: title.trim() || file.name, originalName: file.name, mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size, sha256: hash, storageMode: 'device_only',
      });
      setMessage('Đã lưu metadata trên tài khoản và file gốc trong IndexedDB của trình duyệt hiện tại.');
      setFile(null); setTitle(''); setVaultPassphrase('');
      await load();
    } catch (e) {
      await deleteEvidenceBlob(id, user.id).catch(() => undefined);
      setError(e instanceof Error ? e.message : 'Không lưu được bằng chứng.');
    } finally { setBusy(false); }
  };
  const download = async (item: EvidenceRecord) => {
    try {
      const passphrase = window.prompt('Nhập mật khẩu Vault để giải mã file. Mật khẩu không được lưu trên máy chủ:');
      if (!passphrase) return;
      const blob = await getEvidenceBlob(item.id, user?.id || '', passphrase);
      if (!blob) throw new Error('Không tìm thấy file đã mã hóa trong trình duyệt này. Metadata vẫn còn trên tài khoản, nhưng bản file chỉ tồn tại tại thiết bị đã tiếp nhận.');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = item.originalName; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được file.'); }
  };
  const remove = async (item: EvidenceRecord) => {
    if (!window.confirm('Xóa metadata bằng chứng khỏi tài khoản và file cục bộ trên thiết bị này?')) return;
    try {
      const r = await fetch(`/api/v4/evidence/${encodeURIComponent(item.id)}`, { method: 'DELETE', credentials: 'same-origin' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || d.error || 'Không xóa được.');
      await deleteEvidenceBlob(item.id, user?.id || '');
      await load(); setMessage('Đã đánh dấu xóa metadata và xóa bản file cục bộ trên thiết bị này.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Không xóa được.'); }
  };
  return <div>
    <SectionTitle eyebrow="Chain of Custody · Privacy-first" title="Evidence Vault" description="Lưu hash, metadata và nhật ký trên tài khoản. File gốc được giữ trong IndexedDB của trình duyệt đang dùng; không upload file gốc lên server." icon={Archive}/>
    <Notice tone="warning">Kho này là kho lai: metadata/hash và nhật ký lưu trên máy chủ; file gốc được mã hóa AES-GCM 256-bit trong IndexedDB bằng mật khẩu do bạn tự đặt. Mật khẩu không được gửi lên server và không có chức năng khôi phục. Nếu quên mật khẩu hoặc xóa dữ liệu trình duyệt, file có thể không khôi phục được. Hãy giữ bản sao độc lập.</Notice>
    <div className={`${card} mt-4 p-4`}>
      <h3 className="font-bold text-white">Tiếp nhận bằng chứng mới</h3>
      <label className={`${smallLabel} mt-4`}>Tên hiển thị</label><input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="Ví dụ: Tin nhắn giả danh ngân hàng"/>
      <label className={`${smallLabel} mt-3`}>Mật khẩu mã hóa Vault (ít nhất 12 ký tự)</label><input type="password" autoComplete="new-password" value={vaultPassphrase} onChange={(e) => setVaultPassphrase(e.target.value)} className={input} placeholder="Mật khẩu chỉ dùng trên thiết bị này"/>
      <label className={`${smallLabel} mt-3`}>File gốc (tối đa 50 MB)</label><input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className={input}/>
      {file && <p className="mt-2 text-xs text-slate-400">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
      <button className={`${primary} mt-3`} disabled={!file || vaultPassphrase.length < 12 || busy} onClick={() => void save()}><LockKeyhole size={15}/> {busy ? 'Đang mã hóa & tiếp nhận…' : 'Mã hóa, tính hash & lưu'}</button>
      {message && <p className="mt-3 text-xs text-emerald-300">{message}</p>}{error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
    </div>
    <div className="mt-4 flex items-center justify-between"><h3 className="font-bold text-white">Bằng chứng của tôi</h3><button className={secondary} onClick={() => void load()}><RefreshCw size={14}/> Làm mới</button></div>
    <div className="mt-3 space-y-2">
      {items.length === 0 && <div className={`${card} p-5 text-sm text-slate-400`}>Chưa có bằng chứng được lưu trên tài khoản.</div>}
      {items.map((item) => <div key={item.id} className={`${card} p-4`}>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0"><h4 className="break-words font-semibold text-white">{item.title}</h4><p className="mt-1 text-xs text-slate-400">{item.originalName} · {(item.sizeBytes / 1024 / 1024).toFixed(2)} MB · {new Date(item.createdAt).toLocaleString('vi-VN')}</p><p className="mt-2 break-all font-mono text-[10px] text-cyan-200">SHA-256: {item.sha256}</p><p className="mt-1 text-[10px] text-emerald-200">File gốc: AES-GCM mã hóa trong thiết bị tiếp nhận</p></div><div className="flex shrink-0 flex-wrap gap-2"><button className={secondary} onClick={() => void loadEvents(item.id)} disabled={eventsBusyId === item.id} title="Kiểm tra chuỗi nhật ký"><Clock3 size={14}/></button><button className={secondary} onClick={() => void download(item)} title="Tải file"><Download size={14}/></button><button className={secondary} onClick={() => void remove(item)} title="Xóa"><Trash2 size={14}/></button></div></div>
        {eventsById[item.id] && <div className="mt-4 rounded-xl border border-slate-700 bg-[#091321] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-white">Chuỗi sự kiện: {eventsById[item.id].eventCount} mục</strong><span className={cls('text-[10px] font-bold', eventsById[item.id].chainValid ? 'text-emerald-300' : 'text-rose-300')}>{eventsById[item.id].chainValid ? 'HASH CHAIN KHỚP' : 'CÓ SAI LỆCH CHUỖI'}</span></div><div className="mt-2 space-y-2">{eventsById[item.id].events.map((event: any) => <div key={event.id} className="flex flex-wrap justify-between gap-2 border-t border-slate-800 pt-2 text-[10px]"><span className="text-slate-300">{event.eventType}</span><span className="text-slate-500">{new Date(event.createdAt).toLocaleString('vi-VN')} · {event.valid ? 'OK' : 'Sai hash'}</span></div>)}</div><p className="mt-3 text-[10px] leading-5 text-slate-500">{eventsById[item.id].limitation}</p></div>}
      </div>)}
    </div>
  </div>;
}

function MediaForensicsPanel({ initialMode = 'video' }: { initialMode?: 'video' | 'audio' }) {
  const [mode, setMode] = useState<'video' | 'audio'>(initialMode);
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  const [videoConsent, setVideoConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);
  const [audioResult, setAudioResult] = useState<any>(null);
  const sampleVideo = async () => {
    if (!file) return;
    if (file.size > 80 * 1024 * 1024) { setError('Video vượt quá 80 MB.'); return; }
    setBusy(true); setError(''); setVideoResult(null);
    const url = URL.createObjectURL(file);
    try {
      const video = document.createElement('video');
      video.preload = 'metadata'; video.muted = true; video.src = url;
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Không đọc được metadata video.'));
      });
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) return resolve();
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error('Không giải mã được frame đầu tiên của video.'));
      });
      if (!Number.isFinite(video.duration) || video.duration <= 0 || video.duration > 180) throw new Error('Giới hạn video: 1 giây đến 180 giây.');
      const cols = 3, rows = 2, width = 320, height = 180;
      const canvas = document.createElement('canvas'); canvas.width = cols * width; canvas.height = rows * (height + 26);
      const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Không khởi tạo được canvas.');
      ctx.fillStyle = '#0b1627'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const count = Math.min(6, Math.max(2, Math.ceil(video.duration)));
      const times = Array.from({ length: count }, (_, i) => Math.min(Math.max(0, video.duration - 0.08), (video.duration * i) / Math.max(1, count - 1)));
      for (let i = 0; i < times.length; i += 1) {
        if (Math.abs(video.currentTime - times[i]) > 0.03) {
          await new Promise<void>((resolve, reject) => {
            const timer = window.setTimeout(() => reject(new Error('Hết thời gian lấy mẫu video.')), 5000);
            video.onseeked = () => { clearTimeout(timer); resolve(); };
            video.currentTime = times[i];
          });
        }
        const x = (i % cols) * width, y = Math.floor(i / cols) * (height + 26);
        ctx.drawImage(video, x, y, width, height);
        ctx.fillStyle = '#dbeafe'; ctx.font = '12px sans-serif'; ctx.fillText(`${times[i].toFixed(1)} giây`, x + 8, y + height + 18);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
      const base64 = dataUrl.split(',')[1];
      const data = await postJson<any>('/api/v4/forensics/image', { fileName: file.name, mimeType: 'image/jpeg', imageBase64: base64, analysisType: 'video_contact_sheet', context: `Đây là contact sheet gồm ${times.length} khung hình mẫu từ một video dài ${video.duration.toFixed(2)} giây, tại các mốc ${times.map((t) => `${t.toFixed(1)}s`).join(', ')}. Chỉ đánh giá dấu hiệu nhìn thấy trên các khung hình; không suy diễn chuyển động liên tục hoặc đồng bộ âm thanh.`, consentExternalAI: true });
      setVideoResult({ ...data, duration: video.duration, timestamps: times });
    } catch (e) { setError(e instanceof Error ? e.message : 'Không phân tích được video.'); }
    finally { URL.revokeObjectURL(url); setBusy(false); }
  };
  const inspectAudio = async () => {
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) { setError('Audio vượt quá 40 MB.'); return; }
    setBusy(true); setError(''); setAudioResult(null);
    let context: AudioContext | null = null;
    try {
      const bytes = await file.arrayBuffer();
      context = new AudioContext();
      const audio = await context.decodeAudioData(bytes.slice(0));
      const sample = audio.getChannelData(0);
      const stride = Math.max(1, Math.floor(sample.length / 200000));
      let sum = 0, peak = 0, clipped = 0, silent = 0, count = 0;
      for (let i = 0; i < sample.length; i += stride) {
        const value = Math.abs(sample[i]); sum += value * value; peak = Math.max(peak, value);
        if (value >= 0.999) clipped += 1;
        if (value <= 0.002) silent += 1;
        count += 1;
      }
      setAudioResult({ duration: audio.duration, sampleRate: audio.sampleRate, channels: audio.numberOfChannels, rms: Math.sqrt(sum / Math.max(1, count)), peak, clippedRatio: clipped / Math.max(1, count), silentRatio: silent / Math.max(1, count), samples: count });
    } catch (e) { setError(e instanceof Error ? e.message : 'Trình duyệt không giải mã được file audio.'); }
    finally { await context?.close().catch(() => undefined); setBusy(false); }
  };
  return <div>
    <SectionTitle eyebrow="Multimedia Triage" title="Video & Audio Forensics" description="Video có thể được lấy mẫu frame và đưa qua AI thị giác. Audio hiện có phân tích tín hiệu cục bộ; chưa tích hợp model audio-deepfake đã được kiểm định nên không đưa ra phán quyết thật/giả." icon={FileVideo}/>
    <div className="mb-4 flex gap-2"><button className={mode === 'video' ? primary : secondary} onClick={() => { setMode('video'); setFile(null); setError(''); setVideoConsent(false); }}>Video frames</button><button className={mode === 'audio' ? primary : secondary} onClick={() => { setMode('audio'); setFile(null); setError(''); }}>Audio signal</button></div>
    <div className={`${card} p-4`}><label className={smallLabel}>{mode === 'video' ? 'Video MP4 / MOV (tối đa 180 giây, 80 MB)' : 'Audio WAV / MP3 / M4A (tối đa 40 MB)'}</label><input type="file" accept={mode === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'audio/*'} className={input} onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); setVideoResult(null); setAudioResult(null); setVideoConsent(false); }}/>
      {mode === 'video' && <label className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-300"><input type="checkbox" className="mt-1" checked={videoConsent} onChange={(e) => setVideoConsent(e.target.checked)}/> Tôi đồng ý gửi contact sheet gồm các frame đã lấy mẫu (không gửi file video gốc) tới nhà cung cấp AI bên ngoài để phân tích.</label>}
      <button className={`${primary} mt-3`} disabled={!file || busy || (mode === 'video' && !videoConsent)} onClick={() => void (mode === 'video' ? sampleVideo() : inspectAudio())}>{busy ? 'Đang xử lý…' : mode === 'video' ? <><Video size={15}/> Lấy mẫu frame & phân tích AI</> : <><AudioLines size={15}/> Phân tích tín hiệu cục bộ</>}</button>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    </div>
    {videoResult && <div className={`${card} mt-4 p-4`}><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Video frame triage</h3><span className="text-[10px] text-cyan-300">{videoResult.provider} · {videoResult.model}</span></div><p className="mt-2 text-xs text-slate-400">Đã lấy {videoResult.timestamps.length} frame từ video {videoResult.duration.toFixed(2)} giây. Khung hình không bao phủ toàn bộ video.</p><RiskPill level={videoResult.result?.overallRisk || 'inconclusive'}/><p className="mt-3 text-sm leading-6 text-slate-300">{videoResult.result?.summary}</p>{Array.isArray(videoResult.intelligenceReferences) && videoResult.intelligenceReferences.length > 0 && <div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3"><p className="text-[10px] font-semibold text-cyan-200">Nguồn tình báo tham khảo đã duyệt</p><div className="mt-2 flex flex-wrap gap-3">{videoResult.intelligenceReferences.map((source: any, index: number) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer" className="break-all text-[10px] text-cyan-300 underline">{source.title || source.url} ↗</a>)}</div><p className="mt-2 text-[10px] text-slate-500">Các nguồn này chỉ là bối cảnh kiến thức, không phải bằng chứng trực tiếp của video.</p></div>}<Notice tone="warning">Đây là phân tích ảnh của các frame được chọn, không phải mô hình video-temporal đầy đủ và không kiểm tra đồng bộ âm thanh/khẩu hình.</Notice></div>}
    {audioResult && <div className={`${card} mt-4 p-4`}><h3 className="font-bold text-white">Acoustic signal triage</h3><RiskPill level="inconclusive"/><div className="mt-3 grid gap-3 sm:grid-cols-3">{[{k:'Thời lượng',v:`${audioResult.duration.toFixed(2)} giây`},{k:'Sample rate',v:`${audioResult.sampleRate} Hz`},{k:'Channels',v:String(audioResult.channels)},{k:'RMS',v:audioResult.rms.toFixed(4)},{k:'Peak',v:audioResult.peak.toFixed(4)},{k:'Tỷ lệ clipping',v:`${(audioResult.clippedRatio * 100).toFixed(2)}%`},{k:'Tỷ lệ mẫu gần im lặng',v:`${(audioResult.silentRatio * 100).toFixed(1)}%`}].map((x) => <div key={x.k} className="rounded-xl bg-[#0a1525] p-3"><p className="text-[10px] text-slate-500">{x.k}</p><p className="mt-1 text-sm font-semibold text-white">{x.v}</p></div>)}</div><Notice tone="warning">Các chỉ số âm học mô tả file và mức tín hiệu, không phân biệt được giọng thật với giọng tổng hợp. Chưa có audio-deepfake classifier đã hiệu chuẩn trong bản này nên kết quả là INCONCLUSIVE.</Notice></div>}
  </div>;
}

function ThreatIntelligencePanel({ isAdmin }: { isAdmin: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [verifiedKnowledge, setVerifiedKnowledge] = useState<{ reports: any[]; patterns: any[] }>({ reports: [], patterns: [] });
  const [scheduler, setScheduler] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ title: '', category: 'phishing', severity: 'medium', summary: '', sourceUrl: '', expiresAt: '' });
  const [sourceForm, setSourceForm] = useState({ name: '', sourceUrl: '' });
  const [patternForm, setPatternForm] = useState({ patternName: '', category: 'identity_impersonation', mediaType: 'multimodal', attackPattern: '', description: '', indicators: '', falsePositiveRisks: '', defensiveActions: '', sourceTitle: '', sourceUrl: '', evidenceConfidence: '70' });
  const load = useCallback(async () => {
    try {
      const [threatResponse, statusResponse, adminResponses] = await Promise.all([
        fetch('/api/v4/threats', { credentials: 'same-origin', cache: 'no-store' }),
        fetch('/api/threat-intelligence/status', { credentials: 'same-origin', cache: 'no-store' }),
        isAdmin ? Promise.all([
          fetch('/api/admin/threat-intelligence/reports?status=unverified', { credentials: 'same-origin', cache: 'no-store' }),
          fetch('/api/admin/threat-intelligence/patterns', { credentials: 'same-origin', cache: 'no-store' }),
        ]) : Promise.resolve(null),
      ]);
      const [threatData, statusData] = await Promise.all([threatResponse.json(), statusResponse.json().catch(() => ({}))]);
      // Read verified knowledge separately so an unavailable status widget does not hide approved RAG records.
      const verifiedResponseResult = await fetch('/api/threat-intelligence/verified', { credentials: 'same-origin', cache: 'no-store' });
      const verifiedData = await verifiedResponseResult.json().catch(() => ({}));
      setVerifiedKnowledge(verifiedResponseResult.ok ? { reports: Array.isArray(verifiedData.reports) ? verifiedData.reports : [], patterns: Array.isArray(verifiedData.patterns) ? verifiedData.patterns : [] } : { reports: [], patterns: [] });
      if (!threatResponse.ok) throw new Error(threatData.message || threatData.error || 'Không tải được cảnh báo.');
      setItems(threatData.items || []);
      if (statusResponse.ok) setScheduler(statusData);
      else setScheduler(null);
      if (adminResponses) {
        const [reportsResponse, patternsResponse] = adminResponses;
        const [reportsData, patternsData] = await Promise.all([reportsResponse.json().catch(() => ({})), patternsResponse.json().catch(() => ({}))]);
        if (reportsResponse.ok) setReports(Array.isArray(reportsData.items) ? reportsData.items : []);
        if (patternsResponse.ok) setPatterns(Array.isArray(patternsData.items) ? patternsData.items : []);
      } else { setReports([]); setPatterns([]); }
    } catch (e) { setError(e instanceof Error ? e.message : 'Không tải được cảnh báo.'); }
  }, [isAdmin]);
  useEffect(() => { void load(); }, [load]);
  const withdraw = async (id: string) => {
    if (!window.confirm('Rút cảnh báo này khỏi danh sách đang công bố?')) return;
    try {
      const r = await fetch(`/api/v4/admin/threats/${encodeURIComponent(id)}/withdraw`, { method: 'PATCH', credentials: 'same-origin' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || d.error || 'Không rút được cảnh báo.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không rút được cảnh báo.'); }
  };
  const publish = async () => {
    setBusy(true); setError('');
    try { await postJson('/api/v4/admin/threats', form); setForm({ title: '', category: 'phishing', severity: 'medium', summary: '', sourceUrl: '', expiresAt: '' }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không xuất bản được.'); }
    finally { setBusy(false); }
  };
  const addSource = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/threat-intelligence/sources', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sourceForm) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Không thêm được nguồn.');
      setSourceForm({ name: '', sourceUrl: '' });
      setNotice('Đã thêm nguồn vào danh sách kiểm soát. Nguồn sẽ được kiểm tra ở lượt cập nhật tiếp theo.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không thêm được nguồn.'); }
    finally { setBusy(false); }
  };
  const toggleSource = async (source: any) => {
    try {
      const response = await fetch(`/api/admin/threat-intelligence/sources/${encodeURIComponent(source.id)}`, { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !source.is_active }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Không cập nhật được nguồn.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không cập nhật được nguồn.'); }
  };
  const reviewReport = async (report: any, decision: 'verified' | 'rejected') => {
    const notes = window.prompt(decision === 'verified'
      ? 'Ghi căn cứ xác minh độc lập (nguồn đối chiếu, nội dung được xác nhận, ngày kiểm tra):'
      : 'Ghi lý do loại bỏ / không đủ độ tin cậy:');
    if (!notes || notes.trim().length < 12) return;
    let evidenceConfidence = 0;
    let classification = String(report.classification || 'unclassified');
    let mediaType = String(report.media_type || 'unknown');
    if (decision === 'verified') {
      const categoryInput = window.prompt(
        'Phân loại bản tin (deepfake / synthetic_media / voice_cloning / ai_impersonation / ai_assisted_scam / conventional_phishing / other):',
        classification === 'unclassified' ? 'other' : classification,
      );
      if (!categoryInput) return;
      const allowedCategories = ['deepfake', 'synthetic_media', 'voice_cloning', 'ai_impersonation', 'ai_assisted_scam', 'conventional_phishing', 'other'];
      classification = categoryInput.trim();
      if (!allowedCategories.includes(classification)) {
        setError('Nhóm phân loại không hợp lệ. Hãy dùng một trong các giá trị được liệt kê.');
        return;
      }
      const mediaInput = window.prompt('Loại nội dung (image / video / audio / text / multimodal / unknown):', mediaType);
      if (!mediaInput) return;
      mediaType = mediaInput.trim();
      if (!['image', 'video', 'audio', 'text', 'multimodal', 'unknown'].includes(mediaType)) {
        setError('Loại nội dung không hợp lệ.');
        return;
      }
      const raw = window.prompt('Độ tin cậy của bằng chứng (50–100). Đây là đánh giá của quản trị viên, không phải xác suất deepfake:', '70');
      evidenceConfidence = Number(raw);
      if (!Number.isInteger(evidenceConfidence) || evidenceConfidence < 50 || evidenceConfidence > 100) {
        setError('Điểm tin cậy phải là số nguyên từ 50 đến 100.');
        return;
      }
    }
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/threat-intelligence/reports/${encodeURIComponent(report.id)}/review`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, notes, evidenceConfidence, classification, mediaType }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Không lưu được kết quả kiểm chứng.');
      setNotice(decision === 'verified' ? 'Đã xác minh bản tin. Nội dung có thể được truy xuất trong RAG; không thay đổi thuật toán phát hiện.' : 'Đã đánh dấu bản tin không được xác minh.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được kết quả kiểm chứng.'); }
    finally { setBusy(false); }
  };
  const createKnowledgePattern = async () => {
    setBusy(true); setError(''); setNotice('');
    try {
      await postJson('/api/admin/threat-intelligence/patterns', {
        patternName: patternForm.patternName,
        category: patternForm.category,
        mediaType: patternForm.mediaType,
        attackPattern: patternForm.attackPattern,
        description: patternForm.description,
        indicators: patternForm.indicators.split('\n').map((value) => value.trim()).filter(Boolean),
        falsePositiveRisks: patternForm.falsePositiveRisks,
        defensiveActions: patternForm.defensiveActions.split('\n').map((value) => value.trim()).filter(Boolean),
        sourceReferences: [{ title: patternForm.sourceTitle, url: patternForm.sourceUrl }],
        evidenceConfidence: Number(patternForm.evidenceConfidence),
        updateType: 'knowledge',
      });
      setPatternForm({ patternName: '', category: 'identity_impersonation', mediaType: 'multimodal', attackPattern: '', description: '', indicators: '', falsePositiveRisks: '', defensiveActions: '', sourceTitle: '', sourceUrl: '', evidenceConfidence: '70' });
      setNotice('Đã lưu bản nháp tri thức. Quản trị viên cần rà soát nguồn và ghi chú trước khi phê duyệt.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được bản nháp tri thức.'); }
    finally { setBusy(false); }
  };
  const reviewPattern = async (pattern: any, action: 'approve' | 'reject' | 'withdraw') => {
    const notes = window.prompt(action === 'approve'
      ? 'Ghi căn cứ kiểm tra nguồn, tính phù hợp và nguy cơ false positive trước khi duyệt:'
      : 'Ghi lý do từ chối / rút mẫu tình huống:');
    if (!notes || notes.trim().length < 12) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/threat-intelligence/patterns/${encodeURIComponent(pattern.id)}/review`, {
        method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, notes }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Không cập nhật được mẫu tình huống.');
      setNotice(data.message || 'Đã cập nhật mẫu tình huống.');
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không cập nhật được mẫu tình huống.'); }
    finally { setBusy(false); }
  };

  const refreshNow = async () => {
    setUpdating(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/threat-intelligence/refresh', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || data.error || 'Không cập nhật được tình báo.');
      setNotice(data.skipped ? 'Lượt cập nhật bị bỏ qua vì đang có lượt chạy hoặc chưa đến hạn.' : `Đã xử lý ${data.sourcesFetched || 0}/${data.sourcesAttempted || 0} nguồn RSS; thu thập ${data.rssItems || 0} mục; lưu ${data.scenarioCount || 0} kịch bản phòng ngừa.`);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không cập nhật được tình báo.'); }
    finally { setUpdating(false); }
  };
  const schedulerState = scheduler?.state;
  const latestRun = scheduler?.latestRun;
  return <div>
    <SectionTitle eyebrow="Threat Intelligence · Server schedule" title="Threat Intelligence Center" description="Nguồn RSS HTTPS được kiểm tra theo lịch máy chủ 48 giờ. Kịch bản AI vẫn là đề xuất phòng ngừa cho đến khi có bằng chứng riêng và được kiểm duyệt." icon={Radar}/>
    <div className={`${card} mb-4 grid gap-3 p-4 sm:grid-cols-3`}>
      <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Chu kỳ</p><p className="mt-1 text-lg font-bold text-white">48 giờ</p><p className="text-[10px] text-slate-400">Scheduler phía máy chủ</p></div>
      <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Thành công gần nhất</p><p className="mt-1 text-sm font-semibold text-white">{schedulerState?.last_successful_at ? new Date(schedulerState.last_successful_at).toLocaleString('vi-VN') : 'Chưa có lượt thành công'}</p></div>
      <div><p className="text-[10px] uppercase tracking-wider text-slate-500">Dự kiến tiếp theo</p><p className="mt-1 text-sm font-semibold text-white">{schedulerState?.next_run_at ? new Date(schedulerState.next_run_at).toLocaleString('vi-VN') : 'Chưa lên lịch'}</p></div>
      <div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 pt-3 text-[10px] text-slate-400">
        <span>Trạng thái: {latestRun?.status === 'succeeded' ? 'Lượt gần nhất thành công' : latestRun?.status === 'failed' ? 'Lượt gần nhất thất bại' : latestRun?.status === 'running' ? 'Đang chạy' : 'Chưa có nhật ký chạy'} · {latestRun?.sources_checked ?? 0} nguồn RSS đọc thành công · {latestRun?.records_discovered ?? 0} mục thu thập · {latestRun?.records_published ?? 0} mục tự động xuất bản (không tự duyệt)</span>
        {isAdmin && <button className={secondary} disabled={updating} onClick={() => void refreshNow()}><RefreshCw size={14} className={updating ? 'animate-spin' : ''}/> {updating ? 'Đang cập nhật…' : 'Cập nhật ngay'}</button>}
      </div>
    </div>
    {error && <p role="alert" className="mb-3 text-sm text-rose-300">{error}</p>}
    {notice && <p role="status" className="mb-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200">{notice}</p>}
    <div className={`${card} mb-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Tri thức và báo cáo đã được kiểm chứng</h3><span className="text-[10px] text-emerald-300">Nguồn đã được Admin duyệt</span></div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Chỉ hiển thị báo cáo có trạng thái verified và knowledge pattern approved. Điểm bên dưới là đánh giá độ tin cậy của bằng chứng do người duyệt ghi nhận, không phải xác suất nội dung giả.</p>
      <div className="mt-3 space-y-2">
        {verifiedKnowledge.reports.length === 0 && verifiedKnowledge.patterns.length === 0 && <p className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-500">Chưa có tri thức được duyệt. Bản tin RSS mới vẫn nằm trong hàng đợi chờ kiểm chứng.</p>}
        {verifiedKnowledge.reports.map((report, index) => <article key={`${report.sourceUrl}-${index}`} className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold text-emerald-300">{report.source || 'Nguồn đã duyệt'} · {report.classification} · {report.mediaType}</span><span className="text-[10px] text-slate-400">Độ tin cậy bằng chứng: {report.evidenceConfidence}/100</span></div><h4 className="mt-1 text-xs font-semibold text-white">{report.title}</h4>{report.summary && <p className="mt-1 text-xs leading-5 text-slate-400">{report.summary}</p>}<div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500"><span>Kiểm chứng: {report.verifiedAt ? new Date(report.verifiedAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}</span><a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">Mở nguồn ↗</a></div></article>)}
        {verifiedKnowledge.patterns.map((pattern, index) => <article key={`${pattern.name}-${index}`} className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold text-cyan-200">Knowledge pattern · {pattern.category} · {pattern.mediaType}</span><span className="text-[10px] text-slate-400">Bằng chứng: {pattern.confidence}/100</span></div><h4 className="mt-1 text-xs font-semibold text-white">{pattern.name}</h4><p className="mt-1 text-xs leading-5 text-slate-400">{pattern.description}</p>{Array.isArray(pattern.sources) && <div className="mt-2 flex flex-wrap gap-3">{pattern.sources.slice(0, 3).map((source: any, sourceIndex: number) => <a key={source.url || sourceIndex} href={source.url} target="_blank" rel="noopener noreferrer" className="break-all text-[10px] text-cyan-300 underline">{source.title || 'Nguồn tham chiếu'} ↗</a>)}</div>}</article>)}
      </div>
    </div>
    {isAdmin && <div className={`${card} mb-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Hàng đợi kiểm chứng nguồn RSS</h3><span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">{reports.length} mục chưa duyệt</span></div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Bản tin tự động chỉ được lưu ở trạng thái chưa xác minh. Chỉ quản trị viên mới có thể xác nhận sau khi đối chiếu nguồn gốc; việc duyệt bản tin không tự tạo quy tắc detector.</p>
      <div className="mt-3 space-y-2">{reports.length === 0 ? <p className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-500">Không có bản tin đang chờ kiểm chứng.</p> : reports.map((report) => <article key={report.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold text-cyan-200">{report.source_name || 'Nguồn RSS'} · {report.source_reliability || 'unrated'}</span><time className="text-[10px] text-slate-500">{report.published_at ? new Date(report.published_at).toLocaleDateString('vi-VN') : 'Không rõ ngày'}</time></div><h4 className="mt-1 text-xs font-semibold text-white">{report.title}</h4>{report.summary && <p className="mt-1 text-xs leading-5 text-slate-400">{report.summary}</p>}<div className="mt-2 flex flex-wrap items-center justify-between gap-2"><a href={report.source_url} target="_blank" rel="noopener noreferrer" className="break-all text-[10px] text-cyan-300 underline">Mở nguồn gốc ↗</a><div className="flex gap-3"><button disabled={busy} className="text-[10px] text-emerald-300 underline disabled:opacity-50" onClick={() => void reviewReport(report, 'verified')}>Xác minh</button><button disabled={busy} className="text-[10px] text-rose-300 underline disabled:opacity-50" onClick={() => void reviewReport(report, 'rejected')}>Loại bỏ</button></div></div></article>)}</div>
    </div>}
    {isAdmin && <div className={`${card} mb-4 p-4`}>
      <h3 className="font-bold text-white">Quản lý nguồn RSS (chỉ HTTPS và miền được cho phép)</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className={smallLabel}>Tên nguồn</label><input className={input} value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} placeholder="Tên cơ quan / tổ chức"/></div><div><label className={smallLabel}>URL RSS/XML</label><input className={input} value={sourceForm.sourceUrl} onChange={(e) => setSourceForm({ ...sourceForm, sourceUrl: e.target.value })} placeholder="https://www.cisa.gov/...xml"/></div></div>
      <button className={`${primary} mt-3`} disabled={busy || !sourceForm.name.trim() || !sourceForm.sourceUrl.trim()} onClick={() => void addSource()}>Thêm nguồn</button>
      <div className="mt-4 space-y-2">{(scheduler?.sources || []).map((source: any) => <div key={source.source_url || source.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3"><div className="min-w-0"><p className="text-xs font-semibold text-white">{source.name}</p><p className="break-all text-[10px] text-slate-500">{source.source_url}</p><p className="mt-1 text-[10px] text-slate-400">{source.last_success_at ? `Thành công: ${new Date(source.last_success_at).toLocaleString('vi-VN')}` : source.last_error || 'Chưa kiểm tra'}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] ${source.is_active ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>{source.is_active ? 'Đang bật' : 'Đã tắt'}</span><button className="text-[10px] text-cyan-300 underline" onClick={() => void toggleSource(source)}>{source.is_active ? 'Tắt' : 'Bật'}</button></div></div>)}</div>
    </div>}
    <div className={`${card} mb-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-white">Bản tin nguồn vừa thu thập</h3><span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] text-amber-200">Chưa phải cảnh báo đã xác minh</span></div>
      <p className="mt-1 text-xs leading-5 text-slate-400">Các tiêu đề dưới đây được đọc từ nguồn RSS HTTPS trong danh sách cho phép. Chúng chỉ là tài liệu tham khảo; không tự động trở thành kết luận hoặc quy tắc phát hiện.</p>
      <div className="mt-3 space-y-2">{(scheduler?.latestFeed?.sourceItems || []).length === 0 ? <p className="rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-500">Chưa có bản tin RSS nào được lưu trong snapshot gần nhất.</p> : (scheduler.latestFeed.sourceItems as any[]).map((item: any, index: number) => <article key={item.url || index} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold text-cyan-200">{item.sourceName || 'Nguồn tham chiếu'}</span><time className="text-[10px] text-slate-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('vi-VN') : 'Không rõ ngày xuất bản'}</time></div><h4 className="mt-1 text-xs font-semibold text-white">{item.title}</h4>{item.summary && <p className="mt-1 text-xs leading-5 text-slate-400">{item.summary}</p>}<a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[10px] text-cyan-300 underline">Mở nguồn gốc</a></article>)}</div>
    </div>
    {isAdmin && <div className={`${card} mb-4 p-4`}>
      <h3 className="font-bold text-white">Kho mẫu tình huống đã kiểm chứng (RAG)</h3>
      <p className="mt-1 text-xs leading-5 text-slate-400">Chỉ tạo knowledge pattern có nguồn HTTPS tin cậy. Nội dung được duyệt có thể làm ngữ cảnh tham khảo cho Scanner/SafeBot; không tự thay đổi trọng số, ngưỡng hay thuật toán phát hiện.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className={smallLabel}>Tên mẫu tình huống</label><input className={input} value={patternForm.patternName} onChange={(e) => setPatternForm({ ...patternForm, patternName: e.target.value })}/></div><div><label className={smallLabel}>Nhóm</label><select className={input} value={patternForm.category} onChange={(e) => setPatternForm({ ...patternForm, category: e.target.value })}><option value="visual_deepfake">Visual deepfake</option><option value="audio_deepfake">Audio deepfake</option><option value="video_deepfake">Video deepfake</option><option value="multimodal">Đa phương thức</option><option value="identity_impersonation">Giả mạo danh tính</option><option value="ai_assisted_scam">Lừa đảo dùng AI</option><option value="phishing">Phishing</option><option value="other">Khác</option></select></div><div><label className={smallLabel}>Loại nội dung</label><select className={input} value={patternForm.mediaType} onChange={(e) => setPatternForm({ ...patternForm, mediaType: e.target.value })}><option value="image">Image</option><option value="video">Video</option><option value="audio">Audio</option><option value="text">Text</option><option value="multimodal">Multimodal</option><option value="unknown">Chưa rõ</option></select></div><div><label className={smallLabel}>Độ tin cậy bằng chứng (0–100)</label><input className={input} type="number" min="0" max="100" value={patternForm.evidenceConfidence} onChange={(e) => setPatternForm({ ...patternForm, evidenceConfidence: e.target.value })}/></div><div className="sm:col-span-2"><label className={smallLabel}>Mô tả (tối thiểu 30 ký tự)</label><textarea className={input} rows={2} value={patternForm.description} onChange={(e) => setPatternForm({ ...patternForm, description: e.target.value })}/></div><div><label className={smallLabel}>Dạng tấn công / bối cảnh</label><textarea className={input} rows={2} value={patternForm.attackPattern} onChange={(e) => setPatternForm({ ...patternForm, attackPattern: e.target.value })}/></div><div><label className={smallLabel}>Dấu hiệu quan sát (mỗi dòng một mục)</label><textarea className={input} rows={2} value={patternForm.indicators} onChange={(e) => setPatternForm({ ...patternForm, indicators: e.target.value })}/></div><div><label className={smallLabel}>Rủi ro false positive</label><textarea className={input} rows={2} value={patternForm.falsePositiveRisks} onChange={(e) => setPatternForm({ ...patternForm, falsePositiveRisks: e.target.value })}/></div><div><label className={smallLabel}>Hướng dẫn phòng vệ (mỗi dòng một mục)</label><textarea className={input} rows={2} value={patternForm.defensiveActions} onChange={(e) => setPatternForm({ ...patternForm, defensiveActions: e.target.value })}/></div><div><label className={smallLabel}>Tên nguồn</label><input className={input} value={patternForm.sourceTitle} onChange={(e) => setPatternForm({ ...patternForm, sourceTitle: e.target.value })}/></div><div><label className={smallLabel}>URL nguồn HTTPS</label><input className={input} value={patternForm.sourceUrl} onChange={(e) => setPatternForm({ ...patternForm, sourceUrl: e.target.value })}/></div></div>
      <button className={`${primary} mt-3`} disabled={busy || !patternForm.patternName.trim() || patternForm.description.trim().length < 30 || !patternForm.sourceTitle.trim() || !patternForm.sourceUrl.trim()} onClick={() => void createKnowledgePattern()}>Lưu bản nháp tri thức</button>
      <div className="mt-4 space-y-2">{patterns.map((pattern) => <article key={pattern.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-semibold text-white">{pattern.pattern_name}</h4><span className={`rounded-full px-2 py-1 text-[9px] ${pattern.status === 'approved' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-200'}`}>{pattern.status} · {pattern.test_status}</span></div><p className="mt-1 text-xs text-slate-400">{pattern.category} · {pattern.update_type} · confidence {pattern.evidence_confidence}/100 · Detector: {pattern.enforced_by_detector ? 'đã kích hoạt' : 'không tự động áp dụng'}</p>{Array.isArray(pattern.review_events) && pattern.review_events.length > 0 && <details className="mt-2 border-t border-slate-700 pt-2"><summary className="cursor-pointer text-[10px] text-slate-400">Lịch sử duyệt ({pattern.review_events.length})</summary><div className="mt-2 space-y-2">{pattern.review_events.map((event: any, eventIndex: number) => <div key={`${event.createdAt}-${eventIndex}`} className="rounded-md bg-slate-950/60 p-2 text-[10px]"><div className="flex flex-wrap justify-between gap-2 text-slate-400"><span>{event.decision} · {event.reviewer}</span><time>{new Date(event.createdAt).toLocaleString('vi-VN')}</time></div><p className="mt-1 whitespace-pre-wrap text-slate-300">{event.notes}</p>{event.testEvidence && <p className="mt-1 whitespace-pre-wrap text-slate-500">Kiểm thử: {event.testEvidence}</p>}</div>)}</div></details>}{pattern.status !== 'approved' && <div className="mt-2 flex flex-wrap gap-3"><button disabled={busy} className="text-[10px] text-emerald-300 underline" onClick={() => void reviewPattern(pattern, 'approve')}>Duyệt vào RAG</button><button disabled={busy} className="text-[10px] text-rose-300 underline" onClick={() => void reviewPattern(pattern, 'reject')}>Từ chối</button></div>}{pattern.status === 'approved' && <button disabled={busy} className="mt-2 text-[10px] text-rose-300 underline" onClick={() => void reviewPattern(pattern, 'withdraw')}>Rút khỏi RAG</button>}</article>)}</div>
    </div>}
    {isAdmin && <div className={`${card} mb-4 p-4`}>
      <h3 className="font-bold text-white">Quản trị cảnh báo đã xác minh</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className={smallLabel}>Tiêu đề</label><input className={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></div><div><label className={smallLabel}>Loại</label><select className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="phishing">Phishing</option><option value="impersonation">Giả mạo danh tính</option><option value="deepfake">Deepfake scam</option><option value="malware">Malware</option><option value="payment">Lừa đảo thanh toán</option></select></div><div><label className={smallLabel}>Mức độ</label><select className={input} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}><option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option><option value="critical">Nghiêm trọng</option></select></div><div><label className={smallLabel}>Nguồn URL</label><input className={input} value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} placeholder="https://nguon-chinh-thuc.example"/></div><div className="sm:col-span-2"><label className={smallLabel}>Nội dung / cách phòng tránh</label><textarea className={input} rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}/></div><div><label className={smallLabel}>Hết hạn (tùy chọn)</label><input className={input} type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}/></div></div>
      <button className={`${primary} mt-3`} disabled={busy || !form.title.trim() || !form.summary.trim() || !form.sourceUrl.trim()} onClick={() => void publish()}>{busy ? 'Đang lưu…' : 'Xuất bản cảnh báo'}</button>
    </div>}
    <div className="flex items-center justify-between"><h3 className="font-bold text-white">Cảnh báo đã được phê duyệt</h3><button className={secondary} onClick={() => void load()}><RefreshCw size={14}/> Làm mới</button></div>
    <div className="mt-3 space-y-3">{items.length === 0 && <div className={`${card} p-5 text-sm text-slate-400`}>Chưa có cảnh báo được phê duyệt. Quản trị viên cần thêm cảnh báo kèm nguồn có thể kiểm chứng.</div>}{items.map((item) => <div key={item.id} className={`${card} p-4`}><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold text-white">{item.title}</h4><RiskPill level={item.severity === 'critical' ? 'critical' : item.severity}/></div><p className="mt-2 text-sm leading-6 text-slate-300">{item.summary}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"><span>{item.category} · Cập nhật {new Date(item.createdAt).toLocaleString('vi-VN')}</span><div className="flex flex-wrap items-center gap-3"><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">Mở nguồn tham chiếu</a>{isAdmin && <button className="text-rose-300 underline" onClick={() => void withdraw(item.id)}>Rút cảnh báo</button>}</div></div></div>)}</div>
  </div>;
}

import React, { FormEvent, useMemo, useState } from 'react';
import { AlertTriangle, ClipboardCheck, Download, FileText, LockKeyhole, RotateCcw, ScanText, ShieldAlert, ShieldCheck } from 'lucide-react';

type RiskSignal = {
  id: string;
  title: string;
  description: string;
  weight: number;
  pattern: RegExp;
  advice: string;
};

type MatchedSignal = Omit<RiskSignal, 'pattern'>;

type MessageAnalysis = {
  score: number;
  level: 'none' | 'low' | 'medium' | 'high';
  label: string;
  signals: MatchedSignal[];
};

const SIGNALS: RiskSignal[] = [
  { id: 'urgency', title: 'Gây áp lực thời gian', description: 'Yêu cầu hành động ngay, dọa khóa tài khoản hoặc đặt thời hạn gấp.', weight: 15, pattern: /khan cap|ngay lap tuc|trong \d+ phut|truoc \d+ gio|tai khoan.{0,35}(khoa|dong)|lam ngay|gap ngay|khong con nhieu thoi gian/, advice: 'Dừng thao tác và tự kiểm tra qua kênh chính thức; không làm theo đồng hồ đếm ngược trong tin nhắn.' },
  { id: 'secrecy', title: 'Ép giữ bí mật hoặc cô lập', description: 'Dặn không nói với gia đình, giáo viên hoặc yêu cầu xóa dấu vết.', weight: 20, pattern: /dung noi voi ai|giu bi mat|khong duoc ke|khong cho bo me biet|dung bao cho ai|xoa tin nhan|chi hai chung ta biet|khong duoc hoi ai/, advice: 'Trao đổi ngay với người lớn đáng tin cậy; không giữ bí mật theo yêu cầu của người lạ.' },
  { id: 'money', title: 'Yêu cầu tiền hoặc thanh toán', description: 'Nhắc đến chuyển tiền, nạp tiền, phí xác minh hoặc nhận tiền có điều kiện.', weight: 20, pattern: /chuyen tien|chuyen khoan|nap tien|phi xac minh|thanh toan|ma qr|hoan tien|nhan tien|vi dien tu|dong phi|gui tien|mua the cao/, advice: 'Không chuyển tiền, không quét mã thanh toán và không gửi ảnh giao dịch trước khi xác minh độc lập.' },
  { id: 'credentials', title: 'Thu thập mã OTP hoặc mật khẩu', description: 'Yêu cầu mã đăng nhập, OTP, mật khẩu hoặc thông tin bảo mật.', weight: 25, pattern: /\botp\b|ma xac minh|mat khau|ma dang nhap|ma bao mat|gui ma|doc ma|so the ngan hang|ma cvv|ma pin/, advice: 'Không chia sẻ OTP, mật khẩu, mã PIN hay mã khôi phục với bất kỳ ai, kể cả người tự xưng là nhân viên hỗ trợ.' },
  { id: 'impersonation', title: 'Có dấu hiệu mạo danh', description: 'Nội dung có thể giả danh người thân, cơ quan, ngân hàng hoặc nhà trường.', weight: 12, pattern: /con day|bo day|me day|con bi tai nan|con dang gap|con bi bat|con dang o don cong an|cong an|ngan hang|giao vien chu nhiem|hieu truong|nhan vien ngan hang|can bo dieu tra/, advice: 'Gọi lại số điện thoại đã lưu hoặc hỏi trực tiếp người/cơ quan qua một kênh khác; không dùng thông tin liên hệ trong tin nhắn đáng ngờ.' },
  { id: 'reward', title: 'Mồi nhử quà tặng hoặc trúng thưởng', description: 'Hứa nhận quà, voucher hoặc phần thưởng để thúc đẩy bấm link hay nộp phí.', weight: 12, pattern: /trung thuong|nhan qua|qua tang mien phi|voucher|qua tang|ban da trung|nhan thuong|qua tri an|phan thuong dac biet/, advice: 'Kiểm tra chương trình trên trang chính thức và đọc kỹ điều kiện; quà tặng yêu cầu trả phí hoặc nhập mã bảo mật là dấu hiệu cần cảnh giác.' },
  { id: 'threat', title: 'Đe dọa hoặc tống tiền', description: 'Đe dọa phát tán ảnh/video, làm nhục hoặc gây tổn hại nếu không làm theo.', weight: 25, pattern: /tong tien|phat tan anh|anh nhay cam|se dang anh|gui cho moi nguoi|lan truyen video|se tung len mang|de doa|neu khong lam theo|anh ghep/, advice: 'Không trả tiền hoặc đối đầu một mình. Lưu bằng chứng, chặn khi an toàn và báo ngay cho người lớn đáng tin cậy; tình huống liên quan trẻ em có thể gọi 111.' },
  { id: 'link', title: 'Có đường liên kết cần kiểm tra', description: 'Tin nhắn chứa URL, tên miền hoặc dịch vụ rút gọn có thể dẫn đến trang giả mạo.', weight: 18, pattern: /(https?:\/\/|www\.|bit\.ly|tinyurl|t\.co|rb\.gy|is\.gd)/, advice: 'Không mở liên kết khi chưa xác minh tên miền. Dùng Link Scanner và tự truy cập website chính thức thay vì bấm link nhận được.' },
  { id: 'account', title: 'Yêu cầu xác minh tài khoản bất thường', description: 'Dùng lý do khóa tài khoản/cập nhật thông tin để dụ nhập thông tin cá nhân.', weight: 18, pattern: /xac minh tai khoan|cap nhat thong tin|tai khoan se bi khoa|dang nhap de nhan|nhap thong tin ca nhan|xac thuc danh tinh|tai khoan bi tam khoa/, advice: 'Không nhập thông tin từ liên kết gửi qua tin nhắn; mở ứng dụng hoặc website chính thức bằng cách tự nhập địa chỉ.' },
];

const EXAMPLES = [
  { label: 'Tin nhắn đòi OTP', text: 'Tai khoan cua ban se bi khoa trong 10 phut. Gui ma OTP de xac minh ngay lap tuc theo lien ket https://verify-account.example.' },
  { label: 'Mạo danh người thân', text: 'Con day, con dang gap su co khan cap. Bo me chuyen tien ngay vao tai khoan nay, dung noi voi ai va xoa tin nhan di.' },
  { label: 'Tống tiền bằng ảnh', text: 'Neu khong chuyen tien trong hom nay, toi se phat tan anh nhay cam va gui cho moi nguoi.' },
];

function normalizeText(value: string): string {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function analyzeText(value: string): MessageAnalysis {
  const normalized = normalizeText(value);
  const signals = SIGNALS.filter((signal) => signal.pattern.test(normalized)).map(({ pattern: _pattern, ...signal }) => signal);
  const score = Math.min(100, signals.reduce((total, signal) => total + signal.weight, 0));
  const level: MessageAnalysis['level'] = score >= 60 ? 'high' : score >= 30 ? 'medium' : score > 0 ? 'low' : 'none';
  const label = level === 'high' ? 'CẢNH BÁO CAO' : level === 'medium' ? 'NHIỀU DẤU HIỆU CẦN KIỂM TRA' : level === 'low' ? 'CẦN THẬN TRỌNG' : 'CHƯA THẤY DẤU HIỆU THEO BỘ QUY TẮC';
  return { score, level, label, signals };
}

export const MessageRiskCheck: React.FC = () => {
  const [message, setMessage] = useState('');
  const [analyzedMessage, setAnalyzedMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const analysis = useMemo(() => analyzedMessage === null ? null : analyzeText(analyzedMessage), [analyzedMessage]);

  const handleAnalyze = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 8) {
      setError('Hãy nhập ít nhất 8 ký tự để phân tích được ngữ cảnh.');
      setAnalyzedMessage(null);
      return;
    }
    setError('');
    setCopied(false);
    setAnalyzedMessage(trimmed);
  };

  const reportText = () => {
    if (!analysis || analyzedMessage === null) return '';
    return [
      'HỒ SƠ SÀNG LỌC TIN NHẮN ĐÁNG NGỜ',
      `Thời gian tạo: ${new Date().toLocaleString('vi-VN')}`,
      `Điểm cảnh báo theo quy tắc: ${analysis.score}/100`,
      `Kết quả: ${analysis.label}`,
      '',
      'NỘI DUNG ĐƯỢC KIỂM TRA',
      analyzedMessage,
      '',
      'CÁC DẤU HIỆU ĐƯỢC TÌM THẤY',
      ...(analysis.signals.length ? analysis.signals.map((signal, index) => `${index + 1}. ${signal.title}: ${signal.description}\n   Khuyến nghị: ${signal.advice}`) : ['Không phát hiện dấu hiệu trùng khớp trong bộ quy tắc hiện tại.']),
      '',
      'LƯU Ý',
      'Đây là sàng lọc quy tắc trên văn bản, không phải kết luận AI, xác minh danh tính, hay xác suất tin nhắn là lừa đảo. Kết quả không có dấu hiệu không chứng minh nội dung an toàn. Hãy xác minh qua kênh độc lập.',
      'Quyền riêng tư: nội dung được xử lý trong trình duyệt và không được gửi đến API của website bởi công cụ này.',
    ].join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Trình duyệt không cho phép sao chép tự động. Hãy dùng nút tải hồ sơ TXT.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([reportText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ho-so-sang-loc-tin-nhan-${Date.now()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const clear = () => { setMessage(''); setAnalyzedMessage(null); setError(''); setCopied(false); };
  const palette = analysis?.level === 'high' ? 'rose' : analysis?.level === 'medium' ? 'amber' : analysis?.level === 'low' ? 'yellow' : 'emerald';
  const badgeClass = palette === 'rose' ? 'text-rose-300 bg-rose-500/10 border-rose-500/30' : palette === 'amber' ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : palette === 'yellow' ? 'text-yellow-200 bg-yellow-500/10 border-yellow-500/30' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
  const barClass = palette === 'rose' ? 'bg-rose-500' : palette === 'amber' ? 'bg-amber-400' : palette === 'yellow' ? 'bg-yellow-400' : 'bg-emerald-500';

  return (
    <section className="rounded-2xl border border-[#55DDF2]/25 bg-gradient-to-br from-[#14253c] via-[#101c30] to-[#11192a] overflow-hidden shadow-xl" aria-labelledby="message-risk-title">
      <div className="p-5 md:p-7 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#55DDF2]/10 border border-[#55DDF2]/30 text-[#55DDF2] flex items-center justify-center shrink-0"><ScanText className="w-5 h-5" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#55DDF2] uppercase">Công cụ nâng cao</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"><LockKeyhole className="w-3 h-3" /> Xử lý tại trình duyệt</span>
              </div>
              <h2 id="message-risk-title" className="text-lg md:text-xl font-bold text-white">Bộ sàng lọc tin nhắn đáng ngờ</h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">Tìm dấu hiệu gây áp lực, mạo danh, dụ chuyển tiền, lấy OTP, phát tán ảnh hoặc đường link bất thường. Công cụ này xử lý nội dung ngay trên thiết bị, không gọi API.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Không lưu lịch sử văn bản</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleAnalyze} className="p-5 md:p-7 space-y-4 xl:border-r border-white/5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="message-risk-input" className="text-sm font-semibold text-slate-200">Dán tin nhắn hoặc nội dung bài đăng</label>
            <span className="text-[10px] text-slate-500">{message.length.toLocaleString('vi-VN')} ký tự</span>
          </div>
          <textarea id="message-risk-input" value={message} onChange={(event) => { setMessage(event.target.value); setError(''); }} rows={7} maxLength={10000} placeholder="Dán nội dung cần kiểm tra tại đây. Có thể xóa tên, số điện thoại hoặc thông tin cá nhân trước khi phân tích…" className="w-full rounded-xl border border-slate-700 bg-[#0b1424] px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#55DDF2]/60 focus:ring-2 focus:ring-[#55DDF2]/10 resize-y" />
          {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#55DDF2] to-[#38bdf8] px-4 py-2.5 text-xs font-bold text-[#08121f] hover:brightness-110 transition"><ScanText className="w-4 h-4" /> Phân tích dấu hiệu</button>
            <button type="button" onClick={clear} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/5 transition"><RotateCcw className="w-3.5 h-3.5" /> Xóa nội dung</button>
          </div>
          <div className="pt-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Thử nhanh với mẫu tình huống</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => <button key={example.label} type="button" onClick={() => { setMessage(example.text); setAnalyzedMessage(null); setError(''); setCopied(false); }} className="rounded-lg border border-slate-700/80 bg-[#0b1424]/70 px-3 py-2 text-[11px] text-slate-300 hover:border-[#55DDF2]/40 hover:text-white transition">{example.label}</button>)}
            </div>
          </div>
        </form>

        <div className="p-5 md:p-7 min-h-[300px]">
          {!analysis ? (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-700/80 bg-[#0b1424]/40 p-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3"><ShieldAlert className="w-6 h-6" /></div>
              <h3 className="text-sm font-bold text-slate-200">Kết quả sẽ xuất hiện tại đây</h3>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">Dán nội dung hoặc chọn một mẫu để bắt đầu. Điểm cảnh báo dựa trên các nhóm dấu hiệu trùng khớp, không phải xác suất tin nhắn là lừa đảo.</p>
            </div>
          ) : (
            <div role="status" className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-bold">Kết quả sàng lọc quy tắc</p>
                  <h3 className="mt-1 text-base font-bold text-white">{analysis.label}</h3>
                </div>
                <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${badgeClass}`}><div className="text-xl font-extrabold tabular-nums">{analysis.score}</div><div className="text-[9px] uppercase tracking-wider">/100 điểm</div></div>
              </div>
              <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${analysis.score}%` }} /></div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400"><span className="rounded-full bg-slate-800 px-2.5 py-1">{analysis.signals.length} nhóm dấu hiệu</span><span>Đã quét {analyzedMessage.length.toLocaleString('vi-VN')} ký tự</span></div>

              {analysis.signals.length ? <div className="space-y-2">
                {analysis.signals.map((signal) => <div key={signal.id} className="rounded-xl border border-slate-700/80 bg-[#0b1424]/65 p-3.5">
                  <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" /><div className="min-w-0"><h4 className="text-xs font-bold text-slate-100">{signal.title}</h4><p className="mt-1 text-[11px] leading-relaxed text-slate-400">{signal.description}</p><p className="mt-2 text-[11px] leading-relaxed text-[#a9d8f0]"><strong>Khuyến nghị:</strong> {signal.advice}</p></div></div>
                </div>)}
              </div> : <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4"><div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 text-emerald-300 shrink-0"/><p className="text-xs leading-relaxed text-slate-300">Chưa tìm thấy cụm dấu hiệu trùng khớp trong bộ quy tắc hiện tại. Điều này <strong>không chứng minh tin nhắn an toàn</strong>; kẻ lừa đảo có thể dùng cách diễn đạt khác hoặc gửi hình ảnh/giọng nói giả.</p></div></div>}

              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => void handleCopy()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#172941] px-3 py-2 text-[11px] font-semibold text-slate-200 hover:border-[#55DDF2]/40 transition"><ClipboardCheck className="w-3.5 h-3.5 text-[#55DDF2]" /> {copied ? 'Đã sao chép' : 'Sao chép hồ sơ'}</button>
                <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#172941] px-3 py-2 text-[11px] font-semibold text-slate-200 hover:border-emerald-400/40 transition"><Download className="w-3.5 h-3.5 text-emerald-300" /> Tải hồ sơ TXT</button>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500 flex items-start gap-1.5"><FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" /> Điểm chỉ phản ánh số lượng và mức trọng số của các dấu hiệu ngôn ngữ. Hãy xác minh người gửi qua kênh độc lập trước khi hành động.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

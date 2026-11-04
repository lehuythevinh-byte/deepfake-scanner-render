import React, { useState } from 'react';
import {
  AudioLines, BookOpen, FileImage, FileVideo, Fingerprint,
  Link2, MessageSquareWarning, QrCode, ScanSearch, ShieldAlert, ShieldCheck,
  Siren, Sparkles, FolderLock, Radar, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { ActiveTab, AuthUser } from '../types';
import { ScannerModule } from './ScannerModule';
import { MessageRiskCheck } from './MessageRiskCheck';
import { LinkScannerModule } from './LinkScannerModule';
import { AcademyModule } from './AcademyModule';
import { SafeBotModule } from './SafeBotModule';
import { EmergencyModule } from './EmergencyModule';
import { DigitalTrustToolsModule } from './DigitalTrustToolsModule';

type Props = {
  user: AuthUser | null;
  aiConfigured: boolean | null;
  onTabChange: (tab: ActiveTab) => void;
};

type AnalysisPanel = 'image' | 'video' | 'audio' | 'message' | 'link' | 'qr' | 'origin' | 'forensics' | 'scam' | 'evidence';
type SafetyPanel = 'knowledge' | 'assistant' | 'threats' | 'emergency';

const panelButton = (active: boolean) => `flex min-h-[76px] items-center gap-3 rounded-xl border px-3 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-100 shadow-lg shadow-cyan-950/20' : 'border-slate-700 bg-[#0d1929]/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80'}`;
const iconBox = (active: boolean) => `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-cyan-400/15 text-cyan-200' : 'bg-slate-800 text-slate-400'}`;

function WorkspaceHeader({ eyebrow, title, description, aiConfigured }: { eyebrow: string; title: string; description: string; aiConfigured: boolean | null }) {
  return <header className="relative mb-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-[#10273e] via-[#111f34] to-[#10192a] p-5 shadow-2xl sm:p-7">
    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
    <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-cyan-200"><ShieldCheck size={14}/>{eyebrow}</div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-emerald-200">Local-first</span>
        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-2 text-blue-200">AI opt-in</span>
        <span className={`rounded-full border px-3 py-2 ${aiConfigured ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/20 bg-amber-400/10 text-amber-100'}`}>{aiConfigured ? 'AI đã cấu hình' : 'AI chưa sẵn sàng'}</span>
      </div>
    </div>
  </header>;
}

export const ContentAnalysisWorkspace: React.FC<Props> = ({ user, aiConfigured, onTabChange }) => {
  const [panel, setPanel] = useState<AnalysisPanel>('image');
  const [supportOpen, setSupportOpen] = useState(false);
  const panels: Array<{ id: AnalysisPanel; label: string; sub: string; icon: React.ElementType }> = [
    { id: 'image', label: 'Image Analysis', sub: 'Ảnh tĩnh & hình ảnh tổng hợp', icon: FileImage },
    { id: 'video', label: 'Video Analysis', sub: 'Khung hình & tính liên tục', icon: FileVideo },
    { id: 'audio', label: 'Audio Analysis', sub: 'Tín hiệu âm thanh', icon: AudioLines },
    { id: 'message', label: 'Message Risk Check', sub: 'Tin nhắn & hội thoại', icon: MessageSquareWarning },
  ];
  const supportTools: Array<{ id: AnalysisPanel; label: string; sub: string; icon: React.ElementType }> = [
    { id: 'link', label: 'Link Scanner', sub: 'URL & tên miền', icon: Link2 },
    { id: 'qr', label: 'QR Shield', sub: 'Giải mã QR', icon: QrCode },
    { id: 'origin', label: 'Digital Origin', sub: 'SHA-256 · EXIF · C2PA', icon: Fingerprint },
    { id: 'forensics', label: 'Image Forensics', sub: 'Vùng cần kiểm tra', icon: ScanSearch },
    { id: 'scam', label: 'Scam Intelligence', sub: 'Quy tắc cục bộ', icon: ShieldAlert },
    { id: 'evidence', label: 'Evidence Vault', sub: 'Lưu trữ mã hóa', icon: FolderLock },
  ];
  return <div className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 lg:px-7">
    <WorkspaceHeader eyebrow="V5 · CONTENT ANALYSIS" title="Đừng vội tin. Hãy kiểm tra." description="Một workspace thống nhất cho ảnh, video, âm thanh, tin nhắn và đường dẫn. Chọn đúng loại nội dung để xem phương pháp, bằng chứng và giới hạn phân tích." aiConfigured={aiConfigured}/>
    <div className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {panels.map(({ id, label, sub, icon: Icon }) => <button key={id} onClick={() => setPanel(id)} className={panelButton(panel === id)} aria-pressed={panel === id}>
        <span className={iconBox(panel === id)}><Icon size={19}/></span>
        <span className="min-w-0"><span className="block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] leading-4 text-slate-500">{sub}</span></span>
      </button>)}
    </div>
    <div className="mb-5 rounded-xl border border-slate-700/70 bg-[#0c1727]/80 p-3">
      <button type="button" aria-expanded={supportOpen} onClick={() => setSupportOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left text-xs font-semibold text-slate-200">
        <span className="flex items-center gap-2"><FolderLock size={15} className="text-cyan-300"/> Công cụ xác minh bổ trợ <span className="text-[10px] font-normal text-slate-500">Link · QR · Nguồn gốc · Bằng chứng</span></span>
        {supportOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {supportOpen && <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {supportTools.map(({ id, label, sub, icon: Icon }) => <button key={id} type="button" onClick={() => setPanel(id)} aria-pressed={panel === id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${panel === id ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-100' : 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500'}`}>
          <Icon size={16}/><span><span className="block text-[11px] font-semibold">{label}</span><span className="block text-[9px] text-slate-500">{sub}</span></span>
        </button>)}
      </div>}
    </div>
    <section className="min-h-[520px] rounded-2xl border border-slate-700/70 bg-[#101b2b] p-3 shadow-xl sm:p-5">
      {panel === 'image' && <ScannerModule onTabChange={onTabChange}/>}
      {panel === 'video' && <DigitalTrustToolsModule key="video" user={user} initialPanel="media" initialMediaMode="video"/>}
      {panel === 'audio' && <DigitalTrustToolsModule key="audio" user={user} initialPanel="media" initialMediaMode="audio"/>}
      {panel === 'message' && <MessageRiskCheck/>}
      {panel === 'link' && <LinkScannerModule onTabChange={onTabChange}/>}
      {panel === 'qr' && <DigitalTrustToolsModule user={user} initialPanel="qr"/>}
      {panel === 'origin' && <DigitalTrustToolsModule user={user} initialPanel="origin"/>}
      {panel === 'forensics' && <DigitalTrustToolsModule user={user} initialPanel="forensics"/>}
      {panel === 'scam' && <DigitalTrustToolsModule user={user} initialPanel="scam"/>}
      {panel === 'evidence' && <DigitalTrustToolsModule user={user} initialPanel="evidence"/>}
    </section>
    <p className="mt-4 text-[11px] leading-5 text-slate-500">Kết quả là sàng lọc hỗ trợ xác minh, không phải kết luận pháp lý hoặc chứng nhận nội dung thật/giả. Một số phép phân tích AI yêu cầu bạn chủ động đồng ý gửi dữ liệu tới nhà cung cấp bên ngoài.</p>
  </div>;
};

export const SafetyCenterWorkspace: React.FC<Props> = ({ user, aiConfigured, onTabChange }) => {
  const [panel, setPanel] = useState<SafetyPanel>('assistant');
  const panels: Array<{ id: SafetyPanel; label: string; sub: string; icon: React.ElementType }> = [
    { id: 'assistant', label: 'AI Safety Assistant', sub: 'Hỏi đáp & hướng dẫn xử lý', icon: Sparkles },
    { id: 'knowledge', label: 'Knowledge Base', sub: 'Kiến thức & phương pháp xác minh', icon: BookOpen },
    { id: 'threats', label: 'Threat Intelligence', sub: 'Nguồn, cập nhật & kiểm chứng', icon: Radar },
    { id: 'emergency', label: 'Incident Response', sub: 'Các bước xử lý sự cố', icon: Siren },
  ];
  return <div className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-5 lg:px-7">
    <WorkspaceHeader eyebrow="V5 · SAFETY CENTER" title="Safety Center" description="Trợ lý an toàn số, thư viện xác minh, cập nhật tình báo có nguồn và hướng dẫn ứng phó. Nội dung được phân biệt rõ giữa thông tin đã ghi nhận và tình huống giả định." aiConfigured={aiConfigured}/>
    <div className="mb-5 flex flex-wrap gap-2">
      {panels.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setPanel(id)} aria-pressed={panel === id} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${panel === id ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-100' : 'border-slate-700 bg-[#0d1929] text-slate-300 hover:border-slate-500'}`}><Icon size={15}/>{label}</button>)}
    </div>
    <section className="min-h-[520px] rounded-2xl border border-slate-700/70 bg-[#101b2b] p-3 shadow-xl sm:p-5">
      {panel === 'assistant' && <SafeBotModule onTabChange={onTabChange} aiConfigured={aiConfigured}/>}
      {panel === 'knowledge' && <AcademyModule onTabChange={onTabChange}/>}
      {panel === 'threats' && <DigitalTrustToolsModule user={user} initialPanel="threats"/>}
      {panel === 'emergency' && <EmergencyModule onTabChange={onTabChange}/>}
    </section>
  </div>;
};

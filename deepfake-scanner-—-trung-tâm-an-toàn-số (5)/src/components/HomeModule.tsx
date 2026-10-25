import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Eye, 
  Mic, 
  AlertOctagon, 
  UserX, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Lock, 
  MessageSquare, 
  Award,
  Sparkles,
  HelpCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';

interface HomeModuleProps {
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ onTabChange, aiConfigured }) => {
  const [selectedProcessStep, setSelectedProcessStep] = useState<number>(0);

  const processSteps = [
    {
      stepNumber: '01',
      title: 'DỪNG LẠI (Stop & Breathe)',
      action: 'Tạm dừng 30 giây',
      desc: 'Không vội tin, không bấm chia sẻ, không chuyển tiền hay làm theo bất kỳ yêu cầu khẩn cấp nào từ tin nhắn hay cuộc gọi.',
      details: [
        'Kẻ gian luôn kích thích tâm lý hoảng loạn, sợ hãi hoặc tò mò của học sinh để ép hành động vội vàng.',
        'Hít một hơi thật sâu để chuyển sang tư duy phân tích thay vì phản xạ cảm xúc.',
        'Không bấm vào bất kỳ liên kết lạ nào đính kèm trong tin nhắn.',
      ],
      color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    },
    {
      stepNumber: '02',
      title: 'KIỂM CHỨNG (Cross-Check)',
      action: 'Đối chiếu nguồn tin độc lập',
      desc: 'Kiểm tra tài khoản gốc, tìm kiếm thông tin trên báo chí chính thống hoặc gọi điện thoại SIM trực tiếp cho người liên quan.',
      details: [
        'Dùng phương pháp Lateral Reading (đọc ngang): Mở tab mới tra cứu trên báo chí uy tín.',
        'Kiểm tra ngày tạo tài khoản, lịch sử hoạt động và các dấu vết bất thường về hình ảnh/giọng nói.',
        'Sử dụng công cụ AI Scanner & Evidence Lab trên website này để rà soát kỹ thuật.',
      ],
      color: 'border-[#55DDF2]/40 text-[#55DDF2] bg-[#55DDF2]/10',
    },
    {
      stepNumber: '03',
      title: 'BẢO VỆ (Protect Privacy)',
      action: 'Giữ kín thông tin cá nhân',
      desc: 'Tuyệt đối không gửi mã OTP, mật khẩu, thông tin người thân hay hình ảnh riêng tư cho bất kỳ ai qua mạng xã hội.',
      details: [
        'Kích hoạt xác thực 2 lớp (2FA) cho Zalo, Facebook, Instagram và email.',
        'Thiết lập "Mật khẩu gia đình" (Secret Word) để người nhà tự xác minh khi có cuộc gọi bất thường.',
        'Khóa chế độ xem danh sách bạn bè và bài viết công khai trên trang cá nhân.',
      ],
      color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
    {
      stepNumber: '04',
      title: 'BÁO CÁO (Report & Seek Help)',
      action: 'Tìm sự hỗ trợ từ người lớn',
      desc: 'Lưu lại bằng chứng an toàn, báo cáo sai phạm lên nền tảng và chia sẻ ngay với phụ huynh, thầy cô hoặc Tổng đài 111.',
      details: [
        'Chụp ảnh màn hình lưu đầy đủ đường link tài khoản và nội dung tin nhắn.',
        'Không im lặng chịu đựng: Bạn không có lỗi khi bị kẻ xấu cắt ghép hay tống tiền.',
        'Gọi Tổng đài Quốc gia Bảo vệ Trẻ em 111 (miễn phí 24/7) khi bị đe dọa hoặc quấy rối.',
      ],
      color: 'border-[#CF5B65]/40 text-[#CF5B65] bg-[#CF5B65]/10',
    },
  ];

  const problemCards = [
    {
      icon: Eye,
      title: 'Hình ảnh & video bị tạo sinh hoặc hoán đổi',
      desc: 'Công nghệ AI có thể hoán đổi khuôn mặt (Face Swap) hoặc tạo ra các cử chỉ giả mạo trông như người thật, khiến mắt thường khó nhận biết.',
      targetTab: 'academy' as ActiveTab,
    },
    {
      icon: Mic,
      title: 'Âm thanh nhân bản để mạo danh giọng nói',
      desc: 'Chỉ cần một đoạn video ngắn vài giây trên mạng, AI có thể bắt chước ngữ điệu của người thân, thầy cô để gửi tin nhắn thoại nhờ chuyển tiền gấp.',
      targetTab: 'simulator' as ActiveTab,
    },
    {
      icon: AlertOctagon,
      title: 'Lợi dụng tình huống khẩn cấp để lừa đảo',
      desc: 'Các chiêu trò "con đang cấp cứu", "nhờ nộp tiền thi STEM", "bình chọn cuộc thi" nhắm vào lòng tốt và sự ngây thơ của lứa tuổi học sinh.',
      targetTab: 'simulator' as ActiveTab,
    },
    {
      icon: UserX,
      title: 'Xúc phạm danh dự, bắt nạt và tống tiền',
      desc: 'Ảnh học sinh bị cắt ghép vào bối cảnh nhạy cảm để đe dọa, tống tiền hoặc phát tán vào nhóm chat của trường, gây tổn thương tâm lý sâu sắc.',
      targetTab: 'emergency' as ActiveTab,
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 lg:pt-14 pb-12 border-b border-[#172941]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1f3554_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#55DDF2]/10 border border-[#55DDF2]/30 text-[#55DDF2] text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Digital Safety & Forensics</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Đừng vội tin những gì <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#55DDF2] via-[#A9D8F0] to-white">
                  bạn nhìn thấy trên mạng.
                </span>
              </h1>

              <p className="text-lg sm:text-xl font-medium text-[#A9D8F0]/90">
                Nhận diện dấu hiệu Deepfake. Kiểm chứng thông tin. Bảo vệ bản thân trên mạng xã hội.
              </p>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Deepfake có thể khiến hình ảnh, video và giọng nói giả mạo trông giống như thật. Deepfake Scanner giúp học sinh tìm hiểu rủi ro, kiểm tra nội dung đáng ngờ và thực hành những bước ứng phó an toàn trong thế giới số.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onTabChange('scanner')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#55DDF2] to-[#38b2d6] text-[#101C32] font-bold text-sm shadow-lg shadow-[#55DDF2]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Bắt đầu kiểm chứng tệp</span>
                </button>

                <button
                  onClick={() => onTabChange('simulator')}
                  className="px-6 py-3 rounded-xl bg-[#172941] hover:bg-[#1f3554] text-white border border-[#55DDF2]/30 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <span>Thực hành tình huống mạng</span>
                  <ArrowRight className="w-4 h-4 text-[#55DDF2]" />
                </button>
              </div>

              {/* Research Project Topic Subtitle */}
              <div className="pt-4 border-t border-[#172941] flex items-center gap-3 text-xs text-slate-400">
                <Award className="w-4 h-4 text-[#55DDF2] shrink-0" />
                <span>
                  Đề tài Nghiên cứu Khoa học Kỹ thuật dành cho học sinh Trung học Cơ sở.
                </span>
              </div>
            </div>

            {/* Right Column: Visual Forensic Media Inspection UI Graphic */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-[#172941]/90 border border-[#55DDF2]/30 p-5 shadow-2xl overflow-hidden group">
                {/* Tech Scan Line Animation */}
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#55DDF2] to-transparent top-1/4 animate-pulse pointer-events-none" />

                {/* Header bar of the inspection frame */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f3554] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-[11px] text-[#55DDF2] font-bold">DIGITAL FORENSIC SIMULATOR</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">FRAME #4092</span>
                </div>

                {/* Simulated Portrait with Analysis Overlays */}
                <div className="relative bg-[#101C32] rounded-xl border border-slate-700/60 p-4 aspect-[4/3] flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#55DDF2_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />

                  {/* Corner Targets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#55DDF2]" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#55DDF2]" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#55DDF2]" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#55DDF2]" />

                  {/* Simulated Inspection Nodes */}
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="bg-[#172941]/90 border border-slate-600 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Đồng tử & Mống mắt: Không đồng tâm</span>
                    </div>
                    <div className="bg-[#172941]/90 border border-slate-600 px-2 py-1 rounded text-[10px] text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#55DDF2]" />
                      <span>Đường biên cằm: Nhòe biến dạng</span>
                    </div>
                  </div>

                  {/* Center Target Box */}
                  <div className="self-center my-auto w-28 h-28 border border-dashed border-[#55DDF2]/60 rounded-lg flex items-center justify-center relative">
                    <span className="absolute -top-2 bg-[#101C32] px-1 text-[9px] font-mono text-[#55DDF2]">FACIAL AREA</span>
                    <div className="w-16 h-16 rounded-full border border-blue-400/40 flex items-center justify-center">
                      <Cpu className="w-6 h-6 text-[#55DDF2]/80" />
                    </div>
                  </div>

                  {/* Bottom Analysis Indicator */}
                  <div className="relative z-10 bg-[#172941]/95 border border-[#55DDF2]/30 p-2.5 rounded-lg flex items-center justify-between text-[11px]">
                    <div>
                      <p className="font-semibold text-white">Khuyến nghị phân tích</p>
                      <p className="text-[10px] text-slate-300">Có dấu hiệu chỉnh sửa AI. Cần xác minh thêm.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/40">
                      SUSPICIOUS
                    </span>
                  </div>
                </div>

                {/* Subtext explaining graphic */}
                <p className="mt-3 text-[10px] text-slate-400 text-center italic">
                  * Hình ảnh minh họa giao diện giám định đa phương tiện của Deepfake Scanner
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PHẦN NÊU VẤN ĐỀ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <p className="text-xs uppercase tracking-wider text-[#55DDF2] font-bold">Thực trạng trên mạng xã hội</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Vì sao chúng ta cần kiểm chứng nội dung số?</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Học sinh THCS là nhóm đối tượng tích cực nhất trên mạng xã hội nhưng cũng là nhóm dễ bị tổn thương nhất trước các thủ đoạn công nghệ cao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemCards.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[#172941]/60 border border-[#1f3554] hover:border-[#55DDF2]/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#55DDF2]/10 border border-[#55DDF2]/30 flex items-center justify-center text-[#55DDF2] group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-white leading-snug">{p.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
                <button
                  onClick={() => onTabChange(p.targetTab)}
                  className="mt-5 text-xs text-[#55DDF2] font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Tìm hiểu giải pháp</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. QUY TRÌNH AN TOÀN 4 BƯỚC NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#172941] to-[#101C32] border border-[#55DDF2]/20 p-6 sm:p-10 shadow-xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#55DDF2] bg-[#55DDF2]/10 px-3 py-1 rounded-full border border-[#55DDF2]/20">
              Nguyên tắc phản xạ cốt lõi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Quy trình an toàn 4 bước</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Nhấn vào từng bước bên dưới để xem hướng dẫn chi tiết khi đối mặt với thông tin nghi ngờ.
            </p>
          </div>

          {/* Stepper buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {processSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedProcessStep(idx)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedProcessStep === idx
                    ? `${s.color} ring-2 ring-[#55DDF2]/40 shadow-md`
                    : 'border-[#1f3554] bg-[#101C32]/80 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block mb-1 opacity-70">{s.stepNumber}</span>
                <p className="text-sm font-bold text-white mb-0.5">{s.title.split(' ')[0]}</p>
                <p className="text-[11px] truncate opacity-80">{s.action}</p>
              </button>
            ))}
          </div>

          {/* Detailed step panel */}
          <div className="p-6 rounded-2xl bg-[#101C32] border border-[#1f3554] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f3554] pb-4">
              <div>
                <span className="text-xs font-mono text-[#55DDF2] font-bold">BƯỚC {processSteps[selectedProcessStep].stepNumber}</span>
                <h3 className="text-lg font-bold text-white">{processSteps[selectedProcessStep].title}</h3>
              </div>
              <span className="text-xs text-slate-300 italic">{processSteps[selectedProcessStep].desc}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {processSteps[selectedProcessStep].details.map((detail, dIdx) => (
                <div key={dIdx} className="p-3.5 rounded-xl bg-[#172941]/50 border border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-[#55DDF2] shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. PHẦN GIỚI THIỆU 4 TRỤ CỘT GIẢI PHÁP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <p className="text-xs uppercase tracking-wider text-[#55DDF2] font-bold">Mô hình tích hợp</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">4 Trụ cột Giải pháp của Dự án</h2>
          <p className="text-slate-300 text-sm">
            Kết hợp giữa công nghệ trí tuệ nhân tạo hiện đại, phương pháp kiểm chứng độc lập và giáo dục kỹ năng thực tế.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => onTabChange('scanner')}
            className="p-6 rounded-2xl bg-[#172941]/70 border border-[#1f3554] hover:border-[#55DDF2]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#55DDF2]/20 text-[#55DDF2] flex items-center justify-center font-bold">
                01
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#55DDF2] group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Social Threat Scanner (Phân tích Đa tầng)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tích hợp 3 chế độ: Giám định ảnh (Deepfake & OCR), Rà soát bài đăng mạng xã hội mạo danh, và Phân tích tin nhắn lừa đảo/trộm OTP/bắt nạt với trích dẫn câu chữ cụ thể.
            </p>
          </div>

          <div 
            onClick={() => onTabChange('evidence-lab')}
            className="p-6 rounded-2xl bg-[#172941]/70 border border-[#1f3554] hover:border-[#55DDF2]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                02
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Quy trình kiểm chứng thông tin (Evidence Lab)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Checklist tương tác giúp học sinh không phụ thuộc hoàn toàn vào AI. Rèn luyện phương pháp đọc ngang (Lateral Reading) và đối chiếu nguồn tin độc lập.
            </p>
          </div>

          <div 
            onClick={() => onTabChange('simulator')}
            className="p-6 rounded-2xl bg-[#172941]/70 border border-[#1f3554] hover:border-[#55DDF2]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                03
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Mô phỏng tình huống thực tế (Safety Simulator)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thực hành 5 tình huống phổ biến (giọng nói mẹ đòi tiền, video bạn cùng lớp, tống tiền ảnh ghép, hack nick hỏi OTP, tin giả đài truyền hình) trong môi trường an toàn.
            </p>
          </div>

          <div 
            onClick={() => onTabChange('research')}
            className="p-6 rounded-2xl bg-[#172941]/70 border border-[#1f3554] hover:border-[#55DDF2]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                04
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Đánh giá hiệu quả bằng nghiên cứu thực tế</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thu thập dữ liệu khảo sát thật và so sánh trước/sau can thiệp. Dashboard hiện có dữ liệu minh họa, cần thay bằng kết quả đã thu thập trước khi kết luận.
            </p>
          </div>
        </div>
      </section>

      {/* 5. THẺ TRẢI NGHIỆM NHANH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-[#172941]/40 border border-[#1f3554]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs text-[#55DDF2] font-bold uppercase tracking-wider">Hành động ngay</span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">Bắt đầu trải nghiệm ngay trên thiết bị của em</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Chọn một trong ba hoạt động chính bên dưới để khám phá năng lực nhận diện và phòng vệ số.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onTabChange('scanner')}
                className="px-4 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 transition-all"
              >
                1. Soi tệp nghi ngờ
              </button>
              <button
                onClick={() => onTabChange('simulator')}
                className="px-4 py-2.5 rounded-xl bg-[#101C32] border border-[#55DDF2]/40 text-white font-semibold text-xs hover:bg-[#172941] transition-all"
              >
                2. Chơi thử tình huống
              </button>
              <button
                onClick={() => onTabChange('safebot')}
                className="px-4 py-2.5 rounded-xl bg-[#101C32] border border-slate-700 text-slate-200 font-semibold text-xs hover:bg-[#172941] transition-all"
              >
                3. Hỏi trợ lý SafeBot
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

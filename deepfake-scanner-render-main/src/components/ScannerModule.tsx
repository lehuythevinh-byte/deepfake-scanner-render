import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, ScanMode, ThreatScanResult } from '../types';
import { THREAT_SCENARIOS } from '../data/threatScenariosData';
import { 
  Upload, 
  FileText, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  AlertOctagon, 
  Eye, 
  Info, 
  RefreshCw, 
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
  Share2,
  MessageSquare,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  ShieldAlert,
  UserCheck,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Bot
} from 'lucide-react';

interface ScannerModuleProps {
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
}

// Keep image payloads reasonably sized while preserving enough detail for analysis.
const MAX_API_IMAGE_BYTES = 8 * 1024 * 1024;

const readBlobAsDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
  reader.readAsDataURL(blob);
});

const prepareImageForApi = async (file: File): Promise<{ dataUrl: string; mimeType: string }> => {
  if (file.size <= MAX_API_IMAGE_BYTES) {
    return { dataUrl: await readBlobAsDataUrl(file), mimeType: file.type };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('IMAGE_DECODE_FAILED'));
      element.src = objectUrl;
    });

    const attempts = [
      { maxSide: 1600, quality: 0.82 },
      { maxSide: 1400, quality: 0.76 },
      { maxSide: 1200, quality: 0.70 },
      { maxSide: 1000, quality: 0.64 },
    ];

    for (const attempt of attempts) {
      const scale = Math.min(1, attempt.maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      if (!context) continue;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', attempt.quality));
      if (blob && blob.size <= MAX_API_IMAGE_BYTES) {
        return { dataUrl: await readBlobAsDataUrl(blob), mimeType: 'image/jpeg' };
      }
    }
    throw new Error('IMAGE_TOO_LARGE_FOR_API');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const ScannerModule: React.FC<ScannerModuleProps> = ({ onTabChange, aiConfigured }) => {
  // Mode selection
  const [scanMode, setScanMode] = useState<ScanMode>('image');

  // Shared file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [contextualNotes, setContextualNotes] = useState<string>('');

  // Mode B: Social Post inputs
  const [postPlatform, setPostPlatform] = useState<string>('TikTok');
  const [accountName, setAccountName] = useState<string>('');
  const [accountHandle, setAccountHandle] = useState<string>('');
  const [postCaption, setPostCaption] = useState<string>('');
  const [postLink, setPostLink] = useState<string>('');
  const [relatedComments, setRelatedComments] = useState<string>('');

  // Mode C: Message & Scam inputs
  const [senderName, setSenderName] = useState<string>('');
  const [senderPlatform, setSenderPlatform] = useState<string>('Zalo');
  const [messageText, setMessageText] = useState<string>('');
  const [extractedLinks, setExtractedLinks] = useState<string>('');

  // Execution states
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [threatResult, setThreatResult] = useState<ThreatScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [showScenariosModal, setShowScenariosModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean preview URL when file changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelection = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setScanError('Tệp quá lớn. Vui lòng chọn ảnh nhỏ hơn 20MB.');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setScanError('Định dạng không được hỗ trợ. Vui lòng chọn ảnh PNG, JPEG hoặc WEBP.');
      return;
    }
    setScanError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setThreatResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setThreatResult(null);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Quick preset loaders for all 3 modes
  const loadModeSample = (sampleType: string) => {
    cancelSelection();

    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (sampleType === 'face_swap') {
      setScanMode('image');
      ctx.fillStyle = '#172941';
      ctx.fillRect(0, 0, 600, 400);
      const grad = ctx.createRadialGradient(300, 200, 50, 300, 200, 250);
      grad.addColorStop(0, '#23395d');
      grad.addColorStop(1, '#0e1828');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#f0c49f';
      ctx.beginPath();
      ctx.ellipse(300, 190, 95, 125, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('[CHÂN DUNG NGHI HOÁN ĐỔI KHUÔN MẶT - FACE SWAP]', 40, 370);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'demo_face_swap_sample.png', { type: 'image/png' });
          handleFileSelection(file);
          setContextualNotes('Ảnh đại diện nhận từ một tài khoản lạ nhắn tin nhờ bình chọn cuộc thi.');
        }
      });
    } else if (sampleType === 'celeb_ad_post') {
      setScanMode('social_post');
      setPostPlatform('Facebook');
      setAccountName('VTV News Tin Nóng 24h (Tài khoản không tích xanh)');
      setAccountHandle('vtv_tinnong_online');
      setPostCaption('THÔNG BÁO KHẨN CẤP: Học sinh toàn quốc được nghỉ học 1 tháng từ ngày mai! Nhấn ngay vào liên kết http://moet-nghihoc-khan2026.xyz để xem danh sách trường áp dụng.');
      setPostLink('http://moet-nghihoc-khan2026.xyz/xem-danh-sach');
      setRelatedComments('Nhiều bạn học sinh đang tag nhau vào bình luận rủ nhau đi chơi.');
      setContextualNotes('Bài đăng đang lan truyền nhanh chóng trên các hội nhóm học sinh.');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(40, 40, 520, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('BẢN TIN ĐẶC BIỆT: HỌC SINH NGHỈ HỌC 1 THÁNG', 60, 78);
      ctx.font = '14px sans-serif';
      ctx.fillText('Link: http://moet-nghihoc-khan2026.xyz/xem-danh-sach', 60, 200);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'screenshot_fake_news_post.png', { type: 'image/png' });
          handleFileSelection(file);
        }
      });
    } else if (sampleType === 'voice_money_msg') {
      setScanMode('message_scam');
      setSenderName('Mẹ (Tài khoản Zalo mới tạo)');
      setSenderPlatform('Zalo');
      setMessageText('Con ơi, mẹ đang ngoài đường xe bị va quẹt phải bồi thường gấp 500 nghìn cho người ta, mẹ quên mang ví. Con bắn ngay vào số tài khoản 0987654321 ngân hàng MB Bank tên NGUYEN VAN A cho chú nhé! Khẩn cấp con nhé!');
      setExtractedLinks('STK: 0987654321 - MB Bank');
      setContextualNotes('Tin nhắn kèm 1 file ghi âm giọng nói giống mẹ nhưng hơi rè và gấp gáp.');

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('TIN NHẮN ZALO TỪ "MẸ"', 50, 80);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText('▶ [Tin nhắn thoại 0:14]: "Con ơi mẹ bị va quẹt xe bồi thường gấp..."', 50, 130);
      ctx.fillText('STK: 0987654321 - MB Bank - NGUYEN VAN A', 50, 170);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'screenshot_urgent_voice_msg.png', { type: 'image/png' });
          handleFileSelection(file);
        }
      });
    } else if (sampleType === 'otp_theft_msg') {
      setScanMode('message_scam');
      setSenderName('Minh Hoàng (Bạn cùng lớp)');
      setSenderPlatform('Messenger');
      setMessageText('Ê Hoàng ơi, tao đang tham gia bình chọn ảnh thi STEM trường mình, tao gửi mã bình chọn về số điện thoại mày rồi đó, đọc cho tao 6 số đó liền nha để tao kịp nộp trước giờ chót!');
      setExtractedLinks('');
      setContextualNotes('Ngay sau đó máy nhận được tin nhắn SMS chứa mã kích hoạt Zalo.');

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('MESSENGER: "MINH HOÀNG" HỎI MÃ OTP', 50, 90);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText('"Đọc cho tao 6 số vừa gửi về máy mày liền nha!"', 50, 140);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'screenshot_otp_request.png', { type: 'image/png' });
          handleFileSelection(file);
        }
      });
    } else if (sampleType === 'authentic_study') {
      setScanMode('image');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('ẢNH TÀI LIỆU HỌC TẬP CHÂN THỰC', 60, 190);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText('Ảnh chụp bài làm nhóm môn Khoa học tự nhiên lớp 8', 60, 230);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'authentic_study_doc.png', { type: 'image/png' });
          handleFileSelection(file);
          setContextualNotes('Ảnh chụp bài tập nhóm từ bàn học gửi cho bạn cùng lớp.');
        }
      });
    }
  };

  // Run the multi-layered scan
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanError(null);
    setThreatResult(null);
    setProcessingStep('Đang xác thực định dạng và trích xuất dữ liệu đa phương tiện...');

    try {
      let base64Data = '';
      let fileMime = '';

      if (selectedFile) {
        setProcessingStep('Đang tối ưu ảnh để gửi an toàn đến máy chủ AI...');
        const preparedImage = await prepareImageForApi(selectedFile);
        base64Data = preparedImage.dataUrl;
        fileMime = preparedImage.mimeType;
      }

      setProcessingStep('Đang gửi dữ liệu đến hệ thống phân tích chiêu trò...');

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanMode,
          imageBase64: base64Data,
          mimeType: fileMime,
          fileName: selectedFile?.name || 'input_content',
          contextualNotes: contextualNotes.trim(),
          postData: scanMode === 'social_post' ? {
            platform: postPlatform,
            accountName: accountName.trim(),
            handle: accountHandle.trim(),
            postCaption: postCaption.trim(),
            postLink: postLink.trim(),
            relatedComments: relatedComments.trim(),
          } : undefined,
          messageData: scanMode === 'message_scam' ? {
            senderName: senderName.trim(),
            senderPlatform: senderPlatform,
            messageText: messageText.trim(),
            extractedLinks: extractedLinks.trim(),
          } : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setScanError(result.message || 'Có lỗi xảy ra trong quá trình phân tích.');
        setIsScanning(false);
        return;
      }

      setProcessingStep('Chuẩn hóa báo cáo phân tầng 6 nhóm rủi ro...');
      setThreatResult({
        ...result.data,
        isHeuristicNotice: Boolean(result.isHeuristicNotice),
        aiFailureCode: result.aiFailureCode,
      } as ThreatScanResult);
    } catch (err: any) {
      console.error('Scan request error:', err);
      if (err?.message === 'IMAGE_TOO_LARGE_FOR_API') {
        setScanError('Ảnh quá lớn sau khi tối ưu. Hãy thử ảnh có độ phân giải thấp hơn hoặc ảnh nhỏ hơn 20MB.');
      } else if (err?.message === 'IMAGE_READ_FAILED' || err?.message === 'IMAGE_DECODE_FAILED') {
        setScanError('Không đọc được ảnh này. Hãy thử lưu lại ảnh dưới dạng PNG, JPEG hoặc WEBP rồi tải lên lại.');
      } else {
        setScanError('Không thể kết nối máy chủ AI. Hãy kiểm tra GEMINI_API_KEY tại Render → Environment và xem Render Logs.');
      }
    } finally {
      setIsScanning(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Module Title & 10-Scenario Badge */}
      <div className="border-b border-[#172941] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>HỆ THỐNG GIÁM ĐỊNH ĐA TẦNG NÂNG CAO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Social Threat Scanner: Giám Định Deepfake & Chiêu Trò Mạng Xã Hội
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            Hệ thống phân tích nhiều lớp dành cho học sinh THCS: không chỉ tìm dấu vết ảnh do AI tạo ra, mà còn nhận biết nguy cơ mạo danh, bẫy chuyển tiền, trộm OTP, bắt nạt trực tuyến và tin giả chưa kiểm chứng.
          </p>
        </div>

        <button
          onClick={() => setShowScenariosModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#172941] border border-[#55DDF2]/40 hover:bg-[#1f3554] text-xs font-semibold text-[#55DDF2] flex items-center gap-2 shrink-0 transition-all shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Xem 10 kịch bản chiêu trò</span>
        </button>
      </div>

      {/* 3 Main Mode Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setScanMode('image');
            cancelSelection();
          }}
          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
            scanMode === 'image'
              ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-lg text-white'
              : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            scanMode === 'image' ? 'bg-[#55DDF2]/20 text-[#55DDF2]' : 'bg-slate-800 text-slate-400'
          }`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2]">CHẾ ĐỘ A</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">Image Scanner</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Soi dấu vết AI tạo sinh, hoán đổi khuôn mặt (Face Swap), tính nhất quán quang học và đọc chữ (OCR).
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setScanMode('social_post');
            cancelSelection();
          }}
          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
            scanMode === 'social_post'
              ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-lg text-white'
              : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            scanMode === 'social_post' ? 'bg-[#55DDF2]/20 text-[#55DDF2]' : 'bg-slate-800 text-slate-400'
          }`}>
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2]">CHẾ ĐỘ B</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">Social Post Scanner</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Phân tích bài đăng, bài PR mạo danh, link bẫy, ngôn ngữ kích động sợ hãi hoặc bôi nhọ người khác.
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setScanMode('message_scam');
            cancelSelection();
          }}
          className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
            scanMode === 'message_scam'
              ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-lg text-white'
              : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            scanMode === 'message_scam' ? 'bg-[#55DDF2]/20 text-[#55DDF2]' : 'bg-slate-800 text-slate-400'
          }`}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2]">CHẾ ĐỘ C</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">Message & Scam Scanner</p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Rà soát tin nhắn đòi tiền gấp, đòi mã OTP, trúng thưởng đóng phí, tống tiền hoặc ép giữ bí mật.
            </p>
          </div>
        </button>
      </div>

      {/* Main Analysis Input Form & Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>1. Dữ liệu đầu vào: {scanMode === 'image' ? 'Ảnh cần kiểm tra' : scanMode === 'social_post' ? 'Bài đăng MXH' : 'Tin nhắn chat'}</span>
              </h2>
              <span className="text-[10px] text-slate-400">Tối đa 20MB</span>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                {scanMode === 'image' ? 'Tải ảnh hoặc khung hình video:' : 'Tải ảnh chụp màn hình (Khuyến nghị):'}
              </label>
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#55DDF2]/30 hover:border-[#55DDF2] rounded-2xl p-6 text-center cursor-pointer bg-[#101C32]/60 hover:bg-[#101C32] transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#55DDF2]/10 text-[#55DDF2] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-white">Kéo thả ảnh chụp vào đây hoặc nhấn để chọn</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Ảnh có thể được gửi đến Gemini API khi phân tích; tránh tải tệp nhạy cảm</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-[#55DDF2]/40 bg-[#101C32] p-2 space-y-2">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Xem trước"
                      className="w-full h-40 object-contain rounded-lg bg-black/40"
                    />
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                    <span className="truncate max-w-[200px] text-white font-medium">{selectedFile.name}</span>
                    <button
                      onClick={cancelSelection}
                      className="text-[11px] text-[#CF5B65] hover:underline"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mode-Specific Input Fields */}
            {scanMode === 'social_post' && (
              <div className="space-y-3 pt-2 border-t border-slate-700/60">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nền tảng</label>
                    <select
                      value={postPlatform}
                      onChange={(e) => setPostPlatform(e.target.value)}
                      className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white focus:outline-none focus:border-[#55DDF2]"
                    >
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Threads">Threads</option>
                      <option value="YouTube">YouTube Shorts</option>
                      <option value="Zalo">Zalo Nhật ký</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Tên tài khoản / Handle</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="Ví dụ: VTV24 Tin Nóng (@vtv24_real)"
                      className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Chú thích bài đăng (Caption)</label>
                  <textarea
                    rows={2}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                    placeholder="Dán toàn bộ nội dung dòng chữ trong bài đăng..."
                    className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2] resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Đường dẫn bài đăng / Website nhắc tới</label>
                  <input
                    type="text"
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    placeholder="Ví dụ: http://nhan-qua-mienphi-2026.xyz"
                    className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2]"
                  />
                </div>
              </div>
            )}

            {scanMode === 'message_scam' && (
              <div className="space-y-3 pt-2 border-t border-slate-700/60">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ứng dụng nhắn tin</label>
                    <select
                      value={senderPlatform}
                      onChange={(e) => setSenderPlatform(e.target.value)}
                      className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white focus:outline-none focus:border-[#55DDF2]"
                    >
                      <option value="Zalo">Zalo Chat</option>
                      <option value="Messenger">Messenger</option>
                      <option value="Telegram">Telegram</option>
                      <option value="SMS">Tin nhắn SMS</option>
                      <option value="Instagram">Instagram Direct</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Người gửi xưng danh</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Ví dụ: Mẹ, Bạn cùng lớp, Cô giáo..."
                      className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Nội dung tin nhắn nhận được</label>
                  <textarea
                    rows={3}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Dán câu chữ trong tin nhắn (ví dụ: đòi chuyển tiền, đòi gửi mã OTP, dọa nạt...)"
                    className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2] resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">STK ngân hàng hoặc link gửi kèm (Nếu có)</label>
                  <input
                    type="text"
                    value={extractedLinks}
                    onChange={(e) => setExtractedLinks(e.target.value)}
                    placeholder="Ví dụ: STK 0987654321 MB Bank hoặc link đăng nhập..."
                    className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2]"
                  />
                </div>
              </div>
            )}

            {/* Contextual Notes (Available in all modes) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">
                Ngữ cảnh xuất hiện (Tùy chọn)
              </label>
              <textarea
                rows={2}
                value={contextualNotes}
                onChange={(e) => setContextualNotes(e.target.value)}
                placeholder="Ai gửi cho em? Em có đang bị thúc ép không? Bạn bè nói gì về nội dung này?..."
                className="w-full text-xs rounded-xl bg-[#101C32] border border-slate-700 p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-[#55DDF2] resize-none"
              />
            </div>

            {/* Quick Preset Buttons for Testing */}
            <div className="pt-2 border-t border-slate-700/60 space-y-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#55DDF2]" />
                <span>Nạp nhanh mẫu thử nghiệm tình huống:</span>
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {scanMode === 'image' && (
                  <>
                    <button
                      type="button"
                      onClick={() => loadModeSample('face_swap')}
                      className="text-left px-3 py-2 rounded-lg bg-[#101C32] border border-slate-700 hover:border-[#55DDF2] text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span>Mẫu A1: Chân dung nghi hoán đổi mặt (Face Swap)</span>
                      <span className="text-[10px] text-amber-400 font-mono">Ảnh giả</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadModeSample('authentic_study')}
                      className="text-left px-3 py-2 rounded-lg bg-[#101C32] border border-slate-700 hover:border-[#55DDF2] text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span>Mẫu A2: Ảnh tài liệu học tập bình thường</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Chân thực</span>
                    </button>
                  </>
                )}
                {scanMode === 'social_post' && (
                  <button
                    type="button"
                    onClick={() => loadModeSample('celeb_ad_post')}
                    className="text-left px-3 py-2 rounded-lg bg-[#101C32] border border-slate-700 hover:border-[#55DDF2] text-slate-300 hover:text-white flex items-center justify-between"
                  >
                    <span>Mẫu B1: Bài đăng giả danh đài truyền hình kèm link độc</span>
                    <span className="text-[10px] text-amber-400 font-mono">Tin giả</span>
                  </button>
                )}
                {scanMode === 'message_scam' && (
                  <>
                    <button
                      type="button"
                      onClick={() => loadModeSample('voice_money_msg')}
                      className="text-left px-3 py-2 rounded-lg bg-[#101C32] border border-slate-700 hover:border-[#55DDF2] text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span>Mẫu C1: Giả giọng mẹ va quẹt xe đòi 500k gấp</span>
                      <span className="text-[10px] text-[#CF5B65] font-mono">Lừa tiền</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => loadModeSample('otp_theft_msg')}
                      className="text-left px-3 py-2 rounded-lg bg-[#101C32] border border-slate-700 hover:border-[#55DDF2] text-slate-300 hover:text-white flex items-center justify-between"
                    >
                      <span>Mẫu C2: Bạn thân nhờ bình chọn thi STEM xin mã OTP</span>
                      <span className="text-[10px] text-amber-400 font-mono">Trộm nick</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {scanError && (
              <div className="p-3 rounded-xl bg-[#CF5B65]/10 border border-[#CF5B65]/40 text-[#CF5B65] text-xs flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{scanError}</span>
              </div>
            )}

            {/* Run Analysis Button */}
            <button
              onClick={handleStartScan}
              disabled={isScanning || (!selectedFile && !postCaption && !messageText && !contextualNotes)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                isScanning || (!selectedFile && !postCaption && !messageText && !contextualNotes)
                  ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#55DDF2] to-[#38b2d6] text-[#101C32] hover:brightness-110 active:scale-98 shadow-lg shadow-[#55DDF2]/20'
              }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang thực hiện giám định đa tầng...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bắt đầu phân tích an toàn số</span>
                </>
              )}
            </button>

            {/* Privacy pledge */}
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 text-center">
              <Lock className="w-3 h-3 text-[#41866C]" />
              <span>Quyền riêng tư: Tệp gốc không lưu trong lịch sử tài khoản; nếu đăng nhập, hệ thống lưu tên tệp và tóm tắt kết quả.</span>
            </p>
          </div>
        </div>

        {/* Right Column: Detailed 6-Part Multi-Layered Threat Report */}
        <div className="lg:col-span-7">
          {isScanning ? (
            /* Loading State */
            <div className="min-h-[460px] rounded-2xl bg-[#172941]/60 border border-[#1f3554] p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-[#55DDF2]/20 border-t-[#55DDF2] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[#101C32] flex items-center justify-center text-[#55DDF2]">
                  <Search className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-base font-bold text-white">Đang rà soát đa tầng (OCR, Deepfake, Scam & Impersonation)</h3>
                <p className="text-xs text-[#A9D8F0] font-mono">{processingStep || 'Đang phân tích...'}</p>
                <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                  Hệ thống đang trích xuất văn bản từ hình ảnh, đối chiếu 10 kịch bản lừa đảo phổ biến và phân tích các dấu vết quang học phi tự nhiên.
                </p>
              </div>
            </div>
          ) : threatResult ? (
            /* Full Multi-Layered Threat Report */
            <div className="rounded-2xl bg-[#172941]/90 border border-[#55DDF2]/30 p-6 space-y-6 animate-in fade-in duration-300">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f3554] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#55DDF2] tracking-wider">
                      BÁO CÁO PHÂN TÍCH RỦI RO ĐA TẦNG
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">· {threatResult.scanMode.toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{threatResult.overallStatusLabel}</h3>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                  threatResult.overallStatus === 'suspicious'
                    ? 'bg-[#CF5B65]/20 text-[#CF5B65] border-[#CF5B65]/40'
                    : threatResult.overallStatus === 'inconclusive'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {threatResult.overallStatus === 'suspicious' 
                    ? 'CÓ DẤU HIỆU ĐÁNG NGỜ' 
                    : threatResult.overallStatus === 'inconclusive' 
                    ? 'CHƯA ĐỦ THÔNG TIN' 
                    : 'CHƯA PHÁT HIỆN BẤT THƯỜNG'}
                </span>
              </div>

              {/* Matched Scenarios Badges */}
              {threatResult.isHeuristicNotice && (
                <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-xs leading-relaxed text-amber-100" role="status">
                  <p className="font-bold mb-1">Chế độ dự phòng — chưa có kết quả giám định AI</p>
                  <p>Máy chủ đang sử dụng quy tắc nhận diện từ văn bản. Phân tích hình ảnh bằng AI chưa hoàn tất; trạng thái này không chứng minh ảnh thật hay giả. Hãy dùng Evidence Lab và xác minh qua nguồn độc lập.</p>
                  {threatResult.aiFailureCode && (
                    <p className="mt-2 border-t border-amber-300/20 pt-2 text-amber-200">
                      Mã chẩn đoán: <strong>{threatResult.aiFailureCode}</strong>. Kiểm tra Render → Environment và Render Logs để biết chi tiết.
                    </p>
                  )}
                </div>
              )}
              {threatResult.matchedScenarioCodes && threatResult.matchedScenarioCodes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#101C32] border border-amber-500/40 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Khớp với kịch bản chiêu trò nhận diện:</span>
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {threatResult.matchedScenarioCodes.map((code) => {
                      const matchedInfo = THREAT_SCENARIOS.find((s) => s.code === code);
                      return (
                        <span key={code} className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-xs font-semibold border border-amber-500/30">
                          {matchedInfo ? matchedInfo.title : code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Tóm tắt nhận định:</span>
                {threatResult.summary}
              </div>

              {/* 1. Tính xác thực hình ảnh */}
              <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#55DDF2]" />
                    <span>1. Tính xác thực của hình ảnh</span>
                  </h4>
                  <span className="text-[11px] text-[#A9D8F0] font-mono">{threatResult.imageAuthenticity.statusLabel}</span>
                </div>
                <div className="space-y-2">
                  {threatResult.imageAuthenticity.observations.map((obs, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-3 text-xs p-2 rounded-lg bg-[#172941]/50">
                      <div>
                        <span className="font-semibold text-slate-200">{obs.category}: </span>
                        <span className="text-slate-300 text-[11px]">{obs.observation}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                        obs.severity === 'high' ? 'text-[#CF5B65] bg-[#CF5B65]/10' : 'text-blue-300 bg-blue-500/10'
                      }`}>
                        {obs.severity}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * {threatResult.imageAuthenticity.technicalNote}
                </p>
              </div>

              {/* 2. Rủi ro lừa đảo (Scam Risks) & Trích dẫn câu chữ cụ thể */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                threatResult.scamRisks.detected
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#101C32] border-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>2. Rủi ro lừa đảo & Dấu hiệu thúc ép</span>
                  </h4>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    Mức độ: {threatResult.scamRisks.riskLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-semibold">{threatResult.scamRisks.title}</p>

                {/* Exact Quotes Evidence */}
                {threatResult.scamRisks.exactQuotes && threatResult.scamRisks.exactQuotes.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#101C32] border border-amber-500/30 space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1">
                      <Quote className="w-3 h-3" />
                      <span>Câu chữ cụ thể làm căn cứ:</span>
                    </span>
                    {threatResult.scamRisks.exactQuotes.map((q, idx) => (
                      <p key={idx} className="text-xs font-mono text-amber-200 italic pl-2 border-l-2 border-amber-400">
                        {q}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-300 leading-relaxed">{threatResult.scamRisks.explanation}</p>
              </div>

              {/* 3. Rủi ro mạo danh (Impersonation Risks) */}
              <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#55DDF2]" />
                    <span>3. Rủi ro mạo danh danh tính</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">Mức độ: {threatResult.impersonationRisks.riskLevel}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {threatResult.impersonationRisks.suspiciousIndicators.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. Rủi ro đối với học sinh (Youth Safety, Bullying, Blackmail) */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                threatResult.youthRisks.detected
                  ? 'bg-[#CF5B65]/10 border-[#CF5B65]/40 text-white'
                  : 'bg-[#101C32] border-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-[#CF5B65] uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>4. Cảnh báo bảo vệ an toàn học sinh</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#CF5B65] font-bold">
                    {threatResult.youthRisks.riskLevel === 'high' ? 'NGUY CƠ CAO' : 'THEO DÕI'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                  {threatResult.youthRisks.studentGuidance}
                </p>
                {threatResult.youthRisks.emergencyNotice && (
                  <div className="p-2.5 rounded-lg bg-[#CF5B65]/20 text-xs text-white flex items-center justify-between">
                    <span>{threatResult.youthRisks.emergencyNotice}</span>
                    <a href="tel:111" className="font-bold underline text-white ml-2">Gọi 111 ngay</a>
                  </div>
                )}
              </div>

              {/* 5. Nguồn, bằng chứng & Những điều chưa thể xác minh */}
              <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-[#55DDF2]" />
                  <span>5. Nguồn, Bằng chứng & Thông tin chưa thể xác minh</span>
                </h4>

                {threatResult.sourcesAndEvidence.extractedOcrText && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Văn bản trích xuất (OCR):</span>
                    <p className="text-xs text-slate-300 bg-[#172941]/60 p-2.5 rounded-lg border border-slate-700/60 font-mono">
                      {threatResult.sourcesAndEvidence.extractedOcrText}
                    </p>
                  </div>
                )}

                {threatResult.sourcesAndEvidence.analyzedLinks && threatResult.sourcesAndEvidence.analyzedLinks.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Cảnh báo liên kết / Tên miền:</span>
                    {threatResult.sourcesAndEvidence.analyzedLinks.map((link, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                        <p className="font-mono font-bold break-all">{link.url}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5">{link.warning}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Unverified Gaps */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Những thông tin chưa thể xác minh chỉ từ tệp này:</span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {threatResult.sourcesAndEvidence.unverifiedGaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-500 font-bold">·</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6. Hướng dẫn hành động 4 bước */}
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/60 space-y-3">
                <h4 className="text-xs font-bold text-[#A9D8F0] uppercase tracking-wider flex items-center gap-2 border-b border-blue-900/60 pb-2">
                  <CheckCircle className="w-4 h-4 text-[#55DDF2]" />
                  <span>6. Hướng dẫn hành động theo quy trình 4 bước</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="p-2.5 rounded-lg bg-[#101C32]">
                    <strong className="text-[#55DDF2]">BƯỚC 1 - DỪNG LẠI: </strong>
                    <span>{threatResult.actionGuidance.step1Stop}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101C32]">
                    <strong className="text-emerald-400">BƯỚC 2 - KIỂM CHỨNG: </strong>
                    <span>{threatResult.actionGuidance.step2Verify.join(' · ')}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101C32]">
                    <strong className="text-amber-400">BƯỚC 3 - BẢO VỆ: </strong>
                    <span>{threatResult.actionGuidance.step3Protect.join(' · ')}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101C32]">
                    <strong className="text-[#CF5B65]">BƯỚC 4 - BÁO CÁO: </strong>
                    <span>{threatResult.actionGuidance.step4Report.join(' · ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onTabChange('evidence-lab')}
                  className="px-4 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Kiểm chứng nguồn tại Evidence Lab</span>
                </button>

                <button
                  onClick={() => onTabChange('safebot')}
                  className="px-4 py-2.5 rounded-xl bg-[#172941] border border-[#55DDF2]/40 text-white hover:bg-[#1f3554] text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Bot className="w-3.5 h-3.5 text-[#55DDF2]" />
                  <span>Hỏi SafeBot AI giải thích thêm</span>
                </button>

                <button
                  onClick={() => onTabChange('emergency')}
                  className="px-4 py-2.5 rounded-xl bg-[#101C32] border border-[#CF5B65]/40 text-[#CF5B65] hover:bg-[#CF5B65]/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Danh bạ ứng phó khẩn (111)</span>
                </button>

                <button
                  onClick={cancelSelection}
                  className="px-4 py-2.5 rounded-xl bg-[#101C32] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all ml-auto"
                >
                  Kiểm tra nội dung khác
                </button>
              </div>

              {/* Scientific Disclaimer */}
              <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-800">
                * {threatResult.scientificDisclaimer}
              </p>
            </div>
          ) : (
            /* Standby Guide */
            <div className="h-full rounded-2xl bg-[#172941]/40 border border-[#1f3554] p-8 flex flex-col justify-center space-y-6">
              <div>
                <span className="text-xs uppercase font-bold text-[#55DDF2] tracking-wider">HỆ THỐNG AN TOÀN SỐ PHÂN TẦNG</span>
                <h3 className="text-xl font-bold text-white mt-1">Social Threat Scanner hoạt động như thế nào?</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Thay vì chỉ dựa vào một chỉ số thị giác đơn lẻ, hệ thống kết hợp giữa phân tích đa phương tiện (ảnh/video), nhận dạng ký tự (OCR), rà soát bẫy lừa đảo và đối chiếu kịch bản nhằm bảo vệ học sinh một cách toàn diện nhất.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#55DDF2]">TẦNG 1: THỊ GIÁC & OCR</span>
                  <h4 className="text-xs font-bold text-white">Giám định quang học & Đọc chữ</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Trích xuất văn bản từ ảnh chụp màn hình, kiểm tra độ bất nhất mống mắt, viền cắt ghép và các dấu vết nội suy pixel AI.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400">TẦNG 2: BẪY LỪA ĐẢO</span>
                  <h4 className="text-xs font-bold text-white">Rà soát yêu cầu chuyển tiền / OTP</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Chỉ ra chính xác câu chữ có dấu hiệu lừa đảo, giả mạo trúng thưởng, hối thúc thời gian hoặc dụ bấm link đăng nhập.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-400">TẦNG 3: MẠO DANH & ĐỜI TƯ</span>
                  <h4 className="text-xs font-bold text-white">Xác minh tài khoản & Danh tính</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Phát hiện các tài khoản clone sao chép họ tên bạn bè, thầy cô hoặc người nổi tiếng để khai thác lòng tin của học sinh.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#101C32] border border-slate-700/60 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#CF5B65]">TẦNG 4: BẢO VỆ HỌC SINH</span>
                  <h4 className="text-xs font-bold text-white">Chống bắt nạt & Tống tiền</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Cảnh báo khẩn cấp các hành vi ghép ảnh bôi nhọ, đe dọa phát tán ảnh nhạy cảm; kích hoạt đường dây nóng 111 bảo vệ tức thì.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#101C32] border border-[#1f3554] flex items-center justify-between text-xs text-slate-300">
                <span>Chọn một trong 3 chế độ (A, B, C) ở trên hoặc nạp mẫu thử nghiệm ở cột bên trái để bắt đầu.</span>
                <span className="text-[#55DDF2] font-semibold shrink-0 ml-2">← Thử ngay</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 10 Threat Scenarios Reference Modal */}
      {showScenariosModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#101C32] border border-[#55DDF2]/40 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#172941] pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2]">
                  CẨM NANG NHẬN DIỆN CHIÊU TRÒ MẠNG XÃ HỘI
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">10 Kịch Bản Nguy Hiểm Đối Với Học Sinh THCS</h3>
              </div>
              <button
                onClick={() => setShowScenariosModal(false)}
                className="p-2 rounded-full bg-[#172941] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {THREAT_SCENARIOS.map((scen) => (
                <div key={scen.id} className="p-4 rounded-2xl bg-[#172941]/70 border border-[#1f3554] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{scen.title}</h4>
                    <span className="text-[10px] font-mono text-[#55DDF2] uppercase bg-[#101C32] px-2 py-0.5 rounded border border-slate-700">
                      {scen.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{scen.description}</p>
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-amber-300 block">Dấu hiệu nhận biết:</span>
                    <ul className="space-y-0.5 text-xs text-slate-400">
                      {scen.typicalSignals.map((sig, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">·</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-1.5 border-t border-slate-700/60 text-xs text-emerald-300">
                    <strong>Hành động đúng: </strong>
                    <span>{scen.recommendedAction}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowScenariosModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 transition-all"
              >
                Đã hiểu & Đóng bảng kịch bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

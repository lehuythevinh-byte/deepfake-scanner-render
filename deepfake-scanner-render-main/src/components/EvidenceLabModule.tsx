import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  CheckSquare, 
  HelpCircle, 
  Search, 
  ExternalLink, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCcw,
  BookOpen,
  Info
} from 'lucide-react';

interface EvidenceLabModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

type SuspiciousType = 'image' | 'video' | 'voice' | 'viral_post' | 'clone_account';

interface ChecklistItem {
  id: string;
  question: string;
  explanation: string;
  riskSignificance: 'critical' | 'important' | 'contextual';
}

export const EvidenceLabModule: React.FC<EvidenceLabModuleProps> = ({ onTabChange }) => {
  const [selectedType, setSelectedType] = useState<SuspiciousType>('image');
  const [checkedItems, setCheckedItems] = useState<Record<string, 'yes' | 'no' | 'unsure'>>({});

  const mediaTypes = [
    { id: 'image' as SuspiciousType, label: 'Hình ảnh tĩnh', icon: '🖼️', hint: 'Ảnh chân dung, sự kiện, ảnh chụp màn hình' },
    { id: 'video' as SuspiciousType, label: 'Video clip', icon: '🎬', hint: 'Clip TikTok, Facebook Reels, video nhạy cảm' },
    { id: 'voice' as SuspiciousType, label: 'Giọng nói / Cuộc gọi', icon: '🎙️', hint: 'Tin nhắn thoại, cuộc gọi giả giọng nhờ tiền' },
    { id: 'viral_post' as SuspiciousType, label: 'Tin tức lan truyền', icon: '📢', hint: 'Tin sốc, thông báo nghỉ học, đồn thổi' },
    { id: 'clone_account' as SuspiciousType, label: 'Tài khoản mạo danh', icon: '👤', hint: 'Nick mới tạo giống bạn bè, thầy cô' },
  ];

  // Specific checklist tailored to the media type
  const checklistData: Record<SuspiciousType, ChecklistItem[]> = {
    image: [
      {
        id: 'img_source',
        question: 'Em có biết rõ tài khoản gốc đầu tiên đăng tải bức ảnh này không?',
        explanation: 'Ảnh được chia sẻ lại qua nhiều nhóm chat thường đã bị cắt bớt viền hoặc mất nguồn gốc ban đầu.',
        riskSignificance: 'important',
      },
      {
        id: 'img_reliable',
        question: 'Nguồn đăng có phải là trang chính thống hoặc người em quen biết ngoài đời thực không?',
        explanation: 'Các tài khoản ẩn danh, trang tin giật gân thường có động cơ tạo ảnh câu view hoặc lừa đảo.',
        riskSignificance: 'important',
      },
      {
        id: 'img_independent',
        question: 'Có cơ quan báo chí hoặc nguồn tin độc lập uy tín nào khác xác nhận nội dung này không?',
        explanation: 'Nếu một sự việc chấn động mà chỉ xuất hiện trên một tài khoản mạng xã hội đơn lẻ, khả năng cao là sai sự thật.',
        riskSignificance: 'critical',
      },
      {
        id: 'img_face_artifacts',
        question: 'Khi phóng to vùng mắt, kẽ răng và viền cằm, có thấy dấu hiệu nhòe vỡ hoặc biến dạng bất thường không?',
        explanation: 'AI tạo sinh thường để lại các vết mờ cục bộ quanh vành tai, chân tóc và ánh phản chiếu trong mắt.',
        riskSignificance: 'important',
      },
      {
        id: 'img_urgent_threat',
        question: 'Bức ảnh này có đang bị lợi dụng để đòi tiền, đe dọa hoặc bôi nhọ danh dự của ai không?',
        explanation: 'Nếu có yếu tố đe dọa, đây là hành vi quấy rối/tống tiền, cần xử lý theo quy trình bảo vệ pháp lý.',
        riskSignificance: 'critical',
      },
    ],
    video: [
      {
        id: 'vid_source',
        question: 'Video có nguồn phát hành chính thức, rõ ngày giờ và địa điểm quay không?',
        explanation: 'Video cắt ghép ác ý thường bị cố tình làm mờ và xóa bỏ ngày tháng để gây hiểu nhầm.',
        riskSignificance: 'important',
      },
      {
        id: 'vid_lip_sync',
        question: 'Cử động môi của người nói có khớp hoàn toàn với từng âm tiết phát ra không?',
        explanation: 'Deepfake lồng tiếng thường bị trễ khẩu hình hoặc môi giật nhẹ khi nói các âm bật (p, b, m).',
        riskSignificance: 'important',
      },
      {
        id: 'vid_blink_natural',
        question: 'Chuyển động chớp mắt và quay đầu của người trong video có tự nhiên không?',
        explanation: 'Video tạo bằng AI thường có ánh nhìn đờ đẫn, tần số chớp mắt quá ít hoặc quá nhanh bất thường.',
        riskSignificance: 'important',
      },
      {
        id: 'vid_cross_verify',
        question: 'Người có mặt trong video đã lên tiếng xác nhận hay đính chính trên kênh chính thức của họ chưa?',
        explanation: 'Luôn tìm kiếm phát ngôn chính thức từ nhân vật trước khi tin hoặc chia sẻ.',
        riskSignificance: 'critical',
      },
      {
        id: 'vid_peer_pressure',
        question: 'Em có đang bị các bạn trong nhóm chat hối thúc phải "share mạnh" không?',
        explanation: 'Hiệu ứng đám đông thường khiến học sinh chia sẻ thông tin mà chưa kịp suy nghĩ.',
        riskSignificance: 'important',
      },
    ],
    voice: [
      {
        id: 'voice_urgent_money',
        question: 'Đoạn ghi âm có yêu cầu chuyển tiền gấp, nạp thẻ hoặc đọc mã OTP không?',
        explanation: 'Dấu hiệu số 1 của tội phạm lừa đảo công nghệ cao: Luôn tạo bối cảnh nguy cấp (tai nạn, bồi thường, kẹt xe).',
        riskSignificance: 'critical',
      },
      {
        id: 'voice_sim_call',
        question: 'Em đã gọi điện thoại trực tiếp qua SIM viễn thông (bấm số trong danh bạ) để nói chuyện chưa?',
        explanation: 'Gọi SIM trực tiếp là cách nhanh nhất và an toàn nhất để phá vỡ mọi thủ đoạn giả giọng AI.',
        riskSignificance: 'critical',
      },
      {
        id: 'voice_secret_word',
        question: 'Người gửi có trả lời được câu hỏi bí mật riêng tư mà chỉ gia đình/bạn bè thân thiết mới biết không?',
        explanation: 'Kẻ dùng Voice Clone không thể biết được những kỷ niệm riêng tư hoặc mật mã gia đình.',
        riskSignificance: 'critical',
      },
      {
        id: 'voice_robotic_tone',
        question: 'Âm thanh có bị rè, ngắt hơi đột ngột hoặc đều đều như máy đọc không?',
        explanation: 'Mô hình AI nhại giọng thường thiếu hơi thở tự nhiên và có tạp âm kim loại ở tần số cao.',
        riskSignificance: 'important',
      },
    ],
    viral_post: [
      {
        id: 'post_official_portal',
        question: 'Thông báo này có xuất hiện trên Cổng thông tin của Bộ/Sở/Nhà trường không?',
        explanation: 'Các quyết định nghỉ học, thay đổi lịch thi luôn được đăng tải bằng văn bản có dấu đỏ.',
        riskSignificance: 'critical',
      },
      {
        id: 'post_sensational',
        question: 'Tiêu đề bài viết có dùng từ ngữ giật gân, kích động sợ hãi hoặc câu tương tác không?',
        explanation: 'Ví dụ: "Khẩn cấp", "Kinh hoàng", "Chia sẻ ngay trước khi bị xóa"... là đặc điểm của tin rác.',
        riskSignificance: 'important',
      },
      {
        id: 'post_reputable_press',
        question: 'Em đã thử tìm kiếm từ khóa trên các báo điện tử uy tín (VTV, Tuổi Trẻ, Thanh Niên) chưa?',
        explanation: 'Kỹ năng Lateral Reading: Nếu các báo lớn không đưa tin, sự việc đó 99% là tin bịa đặt.',
        riskSignificance: 'critical',
      },
      {
        id: 'post_link_phishing',
        question: 'Bài viết có kèm link lạ yêu cầu "bấm vào để xem tiếp" hoặc "đăng nhập Facebook để đọc" không?',
        explanation: 'Bẫy đánh cắp tài khoản (Phishing) cực kỳ phổ biến núp bóng tin sốc.',
        riskSignificance: 'critical',
      },
    ],
    clone_account: [
      {
        id: 'clone_creation_date',
        question: 'Tài khoản này mới được tạo gần đây và có rất ít bạn bè, bài viết cũ không?',
        explanation: 'Nick giả mạo thường được lập vội vàng, chỉ tải 1-2 ảnh đại diện của người bị mạo danh.',
        riskSignificance: 'important',
      },
      {
        id: 'clone_asking_favors',
        question: 'Tài khoản này có nhắn tin nhờ bình chọn cuộc thi, vay tiền hoặc mượn tài khoản game không?',
        explanation: 'Kẻ mạo danh thường nhanh chóng đưa ra yêu cầu lợi ích sau vài câu chào hỏi làm quen.',
        riskSignificance: 'critical',
      },
      {
        id: 'clone_direct_check',
        question: 'Em đã gặp trực tiếp người bạn đó ngoài đời hoặc gọi điện thoại hỏi xem có phải nick của bạn không?',
        explanation: 'Xác minh trực tiếp ngoài đời thực sẽ làm lộ ngay tài khoản mạo danh.',
        riskSignificance: 'critical',
      },
    ],
  };

  const currentChecklist = checklistData[selectedType];
  const answeredCount = Object.keys(checkedItems).filter((k) =>
    currentChecklist.some((item) => item.id === k)
  ).length;
  const totalCount = currentChecklist.length;
  const completionPercent = Math.round((answeredCount / totalCount) * 100);

  const handleAnswer = (itemId: string, answer: 'yes' | 'no' | 'unsure') => {
    setCheckedItems((prev) => ({ ...prev, [itemId]: answer }));
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  // Generate methodical guidance based on answers
  const getDiagnosticGuidance = () => {
    if (answeredCount === 0) {
      return {
        level: 'idle',
        title: 'Chưa bắt đầu kiểm chứng',
        message: 'Hãy lần lượt trả lời các câu hỏi trong bảng kiểm bên trái để nhận chỉ dẫn xác minh tương ứng.',
        action: 'Bắt đầu đánh dấu các mục',
      };
    }

    // Check specific critical flags
    const hasCriticalMoneyRisk = checkedItems['voice_urgent_money'] === 'yes' || checkedItems['img_urgent_threat'] === 'yes' || checkedItems['clone_asking_favors'] === 'yes';
    const noIndependentSource = checkedItems['img_independent'] === 'no' || checkedItems['vid_cross_verify'] === 'no' || checkedItems['post_official_portal'] === 'no';
    const unverifiedVoice = selectedType === 'voice' && checkedItems['voice_sim_call'] === 'no';

    if (hasCriticalMoneyRisk) {
      return {
        level: 'danger',
        title: 'CẢNH BÁO: DẤU HIỆU LỪA ĐẢO HOẶC TỐNG TIỀN NGUY HIỂM',
        message: 'Có yêu cầu tiền bạc, chuyển khoản, đe dọa hoặc hỏi mã OTP. Tuyệt đối KHÔNG thực hiện giao dịch, KHÔNG gửi mật khẩu. Hãy thông báo ngay cho bố mẹ hoặc thầy cô!',
        action: 'Chuyển sang mục Ứng phó khẩn cấp',
        nextTab: 'emergency' as ActiveTab,
      };
    }

    if (unverifiedVoice) {
      return {
        level: 'warning',
        title: 'CẦN XÁC MINH TRỰC TIẾP QUA SIM ĐIỆN THOẠI',
        message: 'Bạn chưa gọi điện thoại trực tiếp qua SIM cho người gửi. Hãy bấm số gọi ngay trong danh bạ để nói chuyện trực tiếp trước khi làm bất cứ việc gì.',
        action: 'Gọi điện thoại thoại trực tiếp ngay',
      };
    }

    if (noIndependentSource) {
      return {
        level: 'warning',
        title: 'CHƯA CÓ NGUỒN ĐỘC LẬP XÁC NHẬN',
        message: 'Nội dung chưa được cơ quan chức năng hoặc báo chí chính thống kiểm chứng. Bạn nên tạm dừng chia sẻ và không bình luận khẳng định sự việc.',
        action: 'Dừng chia sẻ & Tra cứu đọc ngang (Lateral Reading)',
      };
    }

    if (answeredCount === totalCount) {
      return {
        level: 'safe',
        title: 'ĐÃ HOÀN THÀNH BẢNG KIỂM CHỨNG KỸ NĂNG',
        message: 'Em đã thực hiện đầy đủ các bước rà soát thông tin. Hãy tiếp tục duy trì thói quen kiểm chứng nguồn trước khi tin hoặc tương tác trên mạng xã hội.',
        action: 'Thực hành tình huống mạng xã hội',
        nextTab: 'simulator' as ActiveTab,
      };
    }

    return {
      level: 'in_progress',
      title: 'ĐANG KIỂM CHỨNG TỪNG BƯỚC',
      message: `Đã hoàn thành ${answeredCount}/${totalCount} tiêu chí. Hãy tiếp tục đánh dấu các câu hỏi còn lại để có bức tranh toàn diện.`,
      action: 'Tiếp tục kiểm tra',
    };
  };

  const diagnostic = getDiagnosticGuidance();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6">
        <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
          <CheckSquare className="w-4 h-4" />
          <span>PHÒNG THỰC HÀNH KIỂM CHỨNG ĐỘC LẬP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Evidence Lab: Kiểm Chứng Thông Tin Không Phụ Thuộc AI</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          AI chỉ là công cụ hỗ trợ xác suất. Kỹ năng quan trọng nhất của học sinh THCS trong kỷ nguyên số là phương pháp kiểm chứng nguồn tin độc lập và tư duy phản biện.
        </p>
      </div>

      {/* Step 1: Choose suspicious media type */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-white uppercase tracking-wider block">
          Bước 1: Em đang nghi ngờ loại nội dung nào trên mạng xã hội?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {mediaTypes.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedType(item.id);
                setCheckedItems({});
              }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedType === item.id
                  ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-md'
                  : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <span className="text-xl block mb-1">{item.icon}</span>
              <p className="text-xs font-bold text-white">{item.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.hint}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Interactive Checklist & Diagnostic Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Questions Checklist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Bước 2: Bảng kiểm tra thực tế ({answeredCount}/{totalCount})</span>
            </h2>
            <button
              onClick={handleResetChecklist}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Làm lại bảng kiểm</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#101C32] rounded-full h-2 border border-slate-700/60 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-[#55DDF2] h-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>

          {/* Questions List */}
          <div className="space-y-3 pt-2">
            {currentChecklist.map((item, idx) => {
              const currentVal = checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#172941]/80 border border-[#1f3554] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#55DDF2] font-bold">CÂU #{idx + 1}</span>
                        {item.riskSignificance === 'critical' && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#CF5B65]/20 text-[#CF5B65]">
                            Trọng yếu
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-white leading-snug">
                        {item.question}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 bg-[#101C32]/60 p-2.5 rounded-lg border border-slate-800">
                    💡 <em>Gợi ý:</em> {item.explanation}
                  </p>

                  {/* Yes / No / Unsure Radio Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAnswer(item.id, 'yes')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        currentVal === 'yes'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-[#101C32] text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ✓ Có / Đúng vậy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer(item.id, 'no')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        currentVal === 'no'
                          ? 'bg-[#CF5B65]/20 text-[#CF5B65] border-[#CF5B65] shadow-sm'
                          : 'bg-[#101C32] text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ✕ Không / Chưa rõ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswer(item.id, 'unsure')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        currentVal === 'unsure'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                          : 'bg-[#101C32] text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      ? Không chắc chắn
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Methodical Guidance Result Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
            diagnostic.level === 'danger'
              ? 'bg-[#CF5B65]/10 border-[#CF5B65]/40 text-white'
              : diagnostic.level === 'warning'
              ? 'bg-amber-500/10 border-amber-500/40 text-white'
              : diagnostic.level === 'safe'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
              : 'bg-[#172941]/90 border-[#1f3554] text-white'
          }`}>
            <div className="flex items-center gap-2">
              {diagnostic.level === 'danger' ? (
                <ShieldAlert className="w-5 h-5 text-[#CF5B65]" />
              ) : diagnostic.level === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : diagnostic.level === 'safe' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Info className="w-5 h-5 text-[#55DDF2]" />
              )}
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                CHỈ DẪN HÀNH ĐỘNG AN TOÀN SỐ
              </span>
            </div>

            <h3 className="text-base font-bold leading-snug">{diagnostic.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{diagnostic.message}</p>

            {/* Scientific Notice: Not a deepfake probability */}
            <div className="pt-2 border-t border-slate-700/50 text-[10px] text-slate-400">
              * Lưu ý khoa học: Bảng kiểm tra này đo lường mức độ tin cậy và kỹ năng xác minh của người dùng, không quy đổi thành xác suất Deepfake giả tạo.
            </div>

            {diagnostic.nextTab && (
              <button
                onClick={() => onTabChange(diagnostic.nextTab!)}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-[#101C32] font-bold text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>{diagnostic.action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Guide to Lateral Reading */}
          <div className="p-5 rounded-2xl bg-[#172941]/70 border border-[#1f3554] space-y-3">
            <h4 className="text-xs font-bold text-[#55DDF2] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Phương pháp "Đọc ngang" (Lateral Reading)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Các chuyên gia kiểm chứng sự thật không ở lại lâu trên trang web nghi vấn. Họ mở ngay các tab mới bên cạnh để tìm câu trả lời:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-[#55DDF2]">1.</span>
                <span>Ai đứng sau thông tin này?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#55DDF2]">2.</span>
                <span>Bằng chứng của họ là gì?</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#55DDF2]">3.</span>
                <span>Các nguồn uy tín khác nói gì về điều này?</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

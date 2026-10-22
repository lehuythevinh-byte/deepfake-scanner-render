import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  PhoneCall, 
  User, 
  HelpCircle, 
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface SafeBotModuleProps {
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
}

// Pre-scripted knowledge base for offline fallback
const SCRIPTED_KNOWLEDGE_BASE: Record<string, string> = {
  money_scam: `Chào em! Nếu em nhận được tin nhắn hoặc cuộc gọi giọng nói giống người thân giục chuyển tiền gấp, hãy áp dụng ngay quy trình 4 bước sau:

1. DỪNG LẠI NGAY: Tuyệt đối KHÔNG chuyển tiền, không nạp thẻ cào, không bấm link gửi kèm. Kẻ lừa đảo luôn cố tạo tình huống nguy cấp (tai nạn, viện phí, phạt tiền) để em mất bình tĩnh.
2. GỌI ĐIỆN THOẠI TRỰC TIẾP QUA SỐ SIM: Dùng điện thoại gọi thẳng vào số di động của người đó trong danh bạ. Nếu không liên lạc được, gọi ngay cho bố/mẹ hoặc người thân khác trong nhà để xác minh.
3. HỎI CÂU HỎI BÍ MẬT: Đặt câu hỏi chỉ người trong gia đình mới biết (ví dụ: món ăn sáng nay, tên thú cưng, sinh nhật bà...).
4. BÁO CÁO: Chụp lại màn hình số tài khoản đối tượng yêu cầu chuyển tiền và tin nhắn để báo cho người lớn và cơ quan công an nếu cần.`,

  blackmail_nudify: `Chào em! Thầy/cô hiểu em đang rất lo lắng và sợ hãi. Hãy hít thở sâu và ghi nhớ điều quan trọng nhất:
EM HOÀN TOÀN KHÔNG CÓ LỖI! Bức ảnh đó là sản phẩm cắt ghép giả tạo do kẻ xấu thực hiện nhằm tống tiền hoặc uy hiếp em.

Các bước hành động khẩn cấp:
1. TUYỆT ĐỐI KHÔNG NỘP TIỀN: Không mua thẻ cào hay chuyển khoản. Kẻ tống tiền sẽ không dừng lại mà sẽ tiếp tục vòi thêm tiền.
2. LƯU BẰNG CHỨNG: Chụp ảnh màn hình toàn bộ tin nhắn, tài khoản đe dọa và đường link (URL).
3. NÓI VỚI NGƯỜI LỚN ĐÁNG TIN CẬY: Hãy chia sẻ ngay với cha mẹ hoặc thầy cô chủ nhiệm. Người lớn sẽ đứng ra bảo vệ và làm việc với cơ quan chức năng để xử lý kẻ xấu.
4. GỌI TỔNG ĐÀI 111 (Miễn phí 24/7): Đây là Tổng đài Quốc gia Bảo vệ Trẻ em. Các chuyên gia sẽ tư vấn tâm lý, bảo mật danh tính và can thiệp pháp lý cho em ngay lập tức.`,

  verify_video: `Để kiểm chứng một video nghi vấn là Deepfake trên mạng xã hội, em hãy áp dụng các mẹo kỹ thuật và phương pháp tư duy sau:

1. Quan sát thị giác kỹ lưỡng:
- Mắt: Chớp mắt có tự nhiên không? Hai đồng tử có phản chiếu cùng một nguồn sáng không?
- Miệng và răng: Cử động môi có bị trượt khỏi âm thanh phát ra không? Răng có bị mờ thành dải trắng không?
- Đường viền cằm: Khi người đó quay đầu, viền cằm có bị biến dạng hay nhấp nháy không?
2. Kiểm tra nguồn gốc (Lateral Reading):
- Ai là người đăng video đầu tiên? Có trang báo chí chính thống nào (VTV, Tuổi Trẻ, Báo Thanh Niên...) đưa tin không?
- Sử dụng tính năng AI Scanner trên website này để rà soát dấu vết nén tạo sinh.
3. Nguyên tắc số 1: "Nhìn thấy không đồng nghĩa với Sự thật". Đừng vội chia sẻ khi chưa có xác nhận từ người có thẩm quyền!`,

  otp_hack: `Chào em! Nếu có bạn thân hoặc ai đó nhắn tin bảo: "Đọc cho tao 6 số vừa gửi về máy mày" hoặc nhờ bình chọn cuộc thi, em hãy nhớ:

1. ĐÓ LÀ BẪY ĐÁNH CẮP TÀI KHOẢN (HACK NICK): 6 số đó là mã OTP đăng nhập hoặc đổi mật khẩu Zalo, Facebook, Google của chính em! Nếu đọc cho họ, tài khoản của em sẽ bị cướp ngay lập tức.
2. TÀI KHOẢN BẠN CỦA EM ĐÃ BỊ HACK HOẶC GIẢ MẠO: Kẻ xấu dùng nick đó để đi lừa tất cả mọi người trong danh sách bạn bè.
3. HÀNH ĐỘNG CẦN LÀM:
- Từ chối gửi mã.
- Gọi điện thoại trực tiếp ngoài đời hoặc gặp mặt để báo cho bạn mình biết tài khoản của bạn đang bị kẻ xấu lợi dụng.`,

  helpline_111: `Tổng đài Quốc gia Bảo vệ Trẻ em 111 là gì?
- Đây là đường dây nóng công lập miễn phí 24/7 do Cục Trẻ em (Bộ LĐTBXH) quản lý.
- Đối tượng hỗ trợ: Tất cả trẻ em và học sinh dưới 16 tuổi tại Việt Nam, cũng như phụ huynh và thầy cô giáo.
- Các vấn đề được giải quyết: Bạo lực học đường, xâm hại, bắt nạt trực tuyến, tống tiền bằng hình ảnh cắt ghép, khủng hoảng tâm lý.
- Cam kết: Bảo mật 100% danh tính học sinh, có sự tham gia của luật sư và chuyên gia tâm lý để can thiệp bảo vệ em an toàn.`,
};

export const SafeBotModule: React.FC<SafeBotModuleProps> = ({ onTabChange, aiConfigured }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào em! SafeBot là Trợ lý An toàn Số đồng hành cùng học sinh THCS trong việc phòng tránh rủi ro Deepfake, lừa đảo công nghệ cao và bảo vệ quyền riêng tư trên mạng xã hội. Em đang gặp băn khoăn hay cần hướng dẫn xử lý tình huống nào?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    { text: 'Làm gì khi có tin nhắn giọng mẹ nhờ chuyển tiền gấp?', key: 'money_scam' },
    { text: 'Ảnh của em bị cắt ghép bôi nhọ thì phải làm sao?', key: 'blackmail_nudify' },
    { text: 'Làm thế nào để nhận diện video giả mạo?', key: 'verify_video' },
    { text: 'Bạn cùng lớp nhắn tin xin mã OTP 6 số?', key: 'otp_hack' },
    { text: 'Tổng đài 111 có thể giúp em những việc gì?', key: 'helpline_111' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Check if AI endpoint is available
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && !data.isFallbackNotice) {
        const botReply: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        // Fallback to the server's clear fallback notice or the existing offline scripts.
        const serverProvidedFallback = Boolean(data.isFallbackNotice || data.aiFailureCode === 'AI_NOT_CONFIGURED');
        let fallbackReply = typeof data.reply === 'string' && data.isFallbackNotice
          ? `${data.reply}\n\nMã chẩn đoán AI: ${data.aiFailureCode || 'GEMINI_REQUEST_FAILED'}. Kiểm tra Render Logs.`
          : data.aiFailureCode === 'AI_NOT_CONFIGURED'
            ? `${data.message || 'Gemini AI chưa được cấu hình trên máy chủ.'}\n\nMã chẩn đoán AI: AI_NOT_CONFIGURED. Thêm GEMINI_API_KEY trong Render → Environment rồi deploy lại.`
            : 'Thầy/cô và SafeBot khuyên em luôn giữ bình tĩnh. Hãy áp dụng quy trình 4 bước: DỪNG LẠI (không chuyển tiền/không gửi mã) → KIỂM CHỨNG (gọi điện thoại trực tiếp) → BẢO VỆ (đổi mật khẩu) → BÁO CÁO (nói với bố mẹ hoặc gọi Tổng đài 111).';

        const lowerText = text.toLowerCase();
        if (!serverProvidedFallback && (lowerText.includes('tiền') || lowerText.includes('giọng') || lowerText.includes('chuyển khoản'))) {
          fallbackReply = SCRIPTED_KNOWLEDGE_BASE.money_scam;
        } else if (!serverProvidedFallback && (lowerText.includes('ghép') || lowerText.includes('ảnh') || lowerText.includes('tống tiền') || lowerText.includes('bắt nạt'))) {
          fallbackReply = SCRIPTED_KNOWLEDGE_BASE.blackmail_nudify;
        } else if (!serverProvidedFallback && (lowerText.includes('otp') || lowerText.includes('mã') || lowerText.includes('hack'))) {
          fallbackReply = SCRIPTED_KNOWLEDGE_BASE.otp_hack;
        } else if (!serverProvidedFallback && (lowerText.includes('111') || lowerText.includes('tổng đài') || lowerText.includes('giúp'))) {
          fallbackReply = SCRIPTED_KNOWLEDGE_BASE.helpline_111;
        } else if (!serverProvidedFallback && (lowerText.includes('video') || lowerText.includes('nhận diện') || lowerText.includes('deepfake'))) {
          fallbackReply = SCRIPTED_KNOWLEDGE_BASE.verify_video;
        }

        const botReply: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFallback: true,
        };
        setMessages((prev) => [...prev, botReply]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Offline fallback
      const botReply: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: SCRIPTED_KNOWLEDGE_BASE.money_scam,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Cuộc trò chuyện đã được làm mới. Em cần hỗ trợ vấn đề an toàn số nào khác không?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
            <Bot className="w-4 h-4" />
            <span>CỐ VẤN AN TOÀN SỐ DÀNH CHO HỌC SINH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">SafeBot AI: Trợ Lý Hướng Dẫn Phòng Vệ</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Luôn lắng nghe, bảo mật và hướng dẫn các bước ứng phó thực tế khi học sinh gặp nguy cơ trên mạng.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl bg-[#172941] text-slate-400 hover:text-[#CF5B65] hover:bg-[#CF5B65]/10 border border-slate-700 transition-colors text-xs flex items-center gap-1.5"
          title="Xóa lịch sử trò chuyện"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Làm mới hội thoại</span>
        </button>
      </div>

      {/* Scripted mode notice if AI is not connected */}
      {aiConfigured === false && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#55DDF2] shrink-0" />
            <span>
              <strong>Chế độ hướng dẫn an toàn số theo kịch bản chuyên gia:</strong> Các câu trả lời được biên soạn chuẩn mực theo cẩm nang Bộ GD&ĐT và Cục Trẻ em.
            </span>
          </div>
        </div>
      )}

      {/* Suggested Quick Prompts */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#55DDF2]" />
          <span>Câu hỏi gợi ý nhanh:</span>
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="px-3 py-1.5 rounded-lg bg-[#172941] border border-slate-700/70 hover:border-[#55DDF2]/60 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors"
            >
              {q.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-3xl bg-[#0e1726] border border-[#1f3554] p-4 sm:p-6 min-h-[440px] max-h-[580px] overflow-y-auto space-y-4 shadow-xl">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isBot 
                  ? 'bg-gradient-to-br from-[#55DDF2]/20 to-[#172941] border border-[#55DDF2]/40 text-[#55DDF2]'
                  : 'bg-blue-600 text-white'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                isBot
                  ? 'bg-[#172941] border border-slate-700/60 text-slate-100 rounded-tl-sm space-y-2 shadow-md'
                  : 'bg-[#55DDF2] text-[#101C32] font-medium rounded-tr-sm'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className={`text-[10px] pt-1 flex items-center justify-between ${
                  isBot ? 'text-slate-400 border-t border-slate-700/40' : 'text-slate-700'
                }`}>
                  <span>{isBot ? 'SafeBot Digital Assistant' : 'Em'}</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#172941] border border-[#55DDF2]/40 text-[#55DDF2] flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#172941] border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#55DDF2] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#55DDF2] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#55DDF2] animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-400 text-[11px] ml-1">SafeBot đang soạn câu trả lời an toàn...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2 rounded-2xl bg-[#172941] border border-slate-700 flex items-center gap-2 shadow-lg">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Nhập câu hỏi hoặc tình huống em đang gặp..."
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputPrompt.trim() || isLoading}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            !inputPrompt.trim() || isLoading
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-[#55DDF2] text-[#101C32] hover:brightness-110 active:scale-95'
          }`}
        >
          <span>Gửi</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Emergency reminder banner */}
      <div className="p-3 rounded-xl bg-[#CF5B65]/10 border border-[#CF5B65]/30 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 text-[#CF5B65] font-semibold">
          <PhoneCall className="w-4 h-4" />
          <span>Nếu em đang bị đe dọa vũ lực hoặc tống tiền nguy hiểm:</span>
        </div>
        <button
          onClick={() => onTabChange('emergency')}
          className="text-xs text-white font-bold underline hover:text-[#55DDF2]"
        >
          Xem danh bạ Tổng đài 111 & Công an →
        </button>
      </div>
    </div>
  );
};

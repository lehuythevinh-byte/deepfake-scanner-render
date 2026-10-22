import React, { useState } from 'react';
import { ActiveTab, SimulatorScenario, SimulatorChoice } from '../types';
import { SIMULATOR_SCENARIOS } from '../data/simulatorData';
import { 
  Gamepad2, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Award,
  Sparkles,
  Phone,
  Video,
  FileImage,
  Send
} from 'lucide-react';

interface SimulatorModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const SimulatorModule: React.FC<SimulatorModuleProps> = ({ onTabChange }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, boolean>>({});

  const scenario = SIMULATOR_SCENARIOS[currentScenarioIndex];
  const selectedChoice = scenario.choices.find((c) => c.id === selectedChoiceId);

  const completedCount = Object.keys(completedScenarios).length;
  const totalCount = SIMULATOR_SCENARIOS.length;

  const handleSelectChoice = (choice: SimulatorChoice) => {
    setSelectedChoiceId(choice.id);
    if (choice.isSafe) {
      setCompletedScenarios((prev) => ({ ...prev, [scenario.id]: true }));
    }
  };

  const handleNextScenario = () => {
    setSelectedChoiceId(null);
    if (currentScenarioIndex < SIMULATOR_SCENARIOS.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
    } else {
      setCurrentScenarioIndex(0);
    }
  };

  const handleResetCurrent = () => {
    setSelectedChoiceId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>MÔ PHỎNG PHẢN XẠ AN TOÀN SỐ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Safety Simulator: Thực Hành 5 Tình Huống Mạng Xã Hội</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Rèn luyện kỹ năng ra quyết định an toàn trong môi trường giả lập. Thử thách bản thân trước các thủ đoạn Deepfake và tin tặc thường gặp nhất.
          </p>
        </div>

        {/* Progress & Badge */}
        <div className="p-3.5 rounded-2xl bg-[#172941] border border-[#1f3554] flex items-center gap-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#55DDF2]/10 text-[#55DDF2] flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Kỹ năng an toàn đã đạt</p>
            <p className="text-[11px] text-slate-300">
              <span className="text-[#55DDF2] font-bold">{completedCount}</span> / {totalCount} Tình huống
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SIMULATOR_SCENARIOS.map((item, idx) => {
          const isCurrent = idx === currentScenarioIndex;
          const isPassed = completedScenarios[item.id];
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentScenarioIndex(idx);
                setSelectedChoiceId(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-[#172941] border-[#55DDF2] ring-1 ring-[#55DDF2]/40 shadow-sm'
                  : isPassed
                  ? 'bg-[#101C32] border-emerald-500/30 text-emerald-400'
                  : 'bg-[#101C32] border-[#1f3554] text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="font-bold">{item.code}</span>
                {isPassed && <span className="text-emerald-400">✓ Đạt</span>}
              </div>
              <p className="text-xs font-semibold text-white truncate">{item.title}</p>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Simulated Smartphone / Chat Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-[#0e1726] border-2 border-slate-700 p-4 shadow-2xl relative overflow-hidden">
            {/* Phone Top Notch / Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="font-mono text-slate-300">14:30</span>
              <div className="flex items-center gap-1.5 font-semibold text-white">
                {scenario.mediaType === 'audio' ? (
                  <Phone className="w-3.5 h-3.5 text-[#55DDF2]" />
                ) : scenario.mediaType === 'video' ? (
                  <Video className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>{scenario.simulatedSender}</span>
              </div>
              <span className="text-emerald-400">● 4G</span>
            </div>

            {/* Context Story Card */}
            <div className="p-4 bg-[#172941]/60 rounded-2xl my-3 text-xs text-slate-200 leading-relaxed border border-[#1f3554]">
              <span className="text-[10px] uppercase font-bold text-[#55DDF2] block mb-1">BỐI CẢNH THỰC TẾ:</span>
              {scenario.context}
            </div>

            {/* Simulated Chat Bubble */}
            <div className="space-y-3 py-2">
              <div className="flex items-start gap-2.5 max-w-[90%]">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {scenario.simulatedSender.charAt(0)}
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#172941] border border-slate-700 text-xs text-white space-y-2 shadow-md">
                  <p className="font-semibold text-amber-300">{scenario.simulatedMessage}</p>
                  {scenario.mediaDescription && (
                    <div className="p-2 rounded bg-[#101C32] text-[10px] text-slate-400 border border-slate-800">
                      📎 <em>Mô tả tệp kèm theo:</em> {scenario.mediaDescription}
                    </div>
                  )}
                  <span className="text-[9px] text-slate-400 block text-right">Vừa xong · Đã gửi</span>
                </div>
              </div>
            </div>

            {/* Simulated chat bottom bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
              <div className="flex-1 py-1.5 px-3 rounded-full bg-[#172941] border border-slate-800 text-[11px] text-slate-400">
                Lựa chọn phương án ứng phó...
              </div>
              <div className="w-8 h-8 rounded-full bg-[#55DDF2]/20 text-[#55DDF2] flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic">
            * Kịch bản tình huống được xây dựng từ các vụ việc lừa đảo công nghệ cao thực tế tại Việt Nam.
          </p>
        </div>

        {/* Right Column: Question & Multiple Choices */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#172941]/90 border border-[#1f3554] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2] tracking-wider">
                MỤC TIÊU RÈN LUYỆN
              </span>
              <span className="text-xs text-slate-400 font-semibold">{scenario.code}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">{scenario.targetSkill}</h2>
            <div className="p-3 rounded-xl bg-[#101C32] border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200">
              ❓ {scenario.question}
            </div>

            {/* Choices Buttons */}
            <div className="space-y-2.5 pt-2">
              {scenario.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm transition-all flex items-start gap-3 border ${
                      isSelected
                        ? choice.isSafe
                          ? 'bg-emerald-500/15 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                          : 'bg-[#CF5B65]/15 border-[#CF5B65] text-white ring-2 ring-[#CF5B65]/30'
                        : 'bg-[#101C32] border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-500'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? choice.isSafe
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[#CF5B65] text-white'
                        : 'bg-[#172941] text-slate-400'
                    }`}>
                      {choice.id.toUpperCase().slice(-1)}
                    </span>
                    <span className="leading-relaxed">{choice.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback & Action Guidance Drawer */}
          {selectedChoice && (
            <div className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-300 ${
              selectedChoice.isSafe
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                : 'bg-amber-500/10 border-amber-500/40 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {selectedChoice.isSafe ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      QUYẾT ĐỊNH XUẤT SẮC & AN TOÀN
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      CẢNH BÁO RỦI RO - CẦN ĐIỀU CHỈNH
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {selectedChoice.feedback}
              </p>

              <div className="p-3.5 rounded-xl bg-[#101C32] border border-slate-800 text-xs text-[#A9D8F0] space-y-1">
                <span className="font-bold text-white block">💡 Lời khuyên hành động:</span>
                <p>{selectedChoice.actionGuidance}</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleResetCurrent}
                  className="px-4 py-2 rounded-xl bg-[#101C32] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Chọn lại phương án khác</span>
                </button>

                <button
                  onClick={handleNextScenario}
                  className="px-5 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 flex items-center gap-2 transition-all"
                >
                  <span>Chuyển sang tình huống tiếp theo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Key Principle Summary Box */}
          <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#55DDF2] shrink-0 mt-0.5" />
            <span>
              <strong>Nguyên tắc ghi nhớ:</strong> {scenario.keyPrinciple}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ActiveTab, SurveyResponseData } from '../types';
import { SURVEY_QUESTIONS, RESEARCH_BENCHMARK_DATA } from '../data/surveyData';
import { 
  BarChart3, 
  Download, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award, 
  Layers, 
  HelpCircle,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';

interface ResearchDashboardModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const ResearchDashboardModule: React.FC<ResearchDashboardModuleProps> = ({ onTabChange }) => {
  const [activeDataSet, setActiveDataSet] = useState<'benchmark' | 'live'>('benchmark');
  const [showSurveyModal, setShowSurveyModal] = useState<boolean>(false);
  // Start blank so the form never silently records pre-filled/example answers as real survey data.
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, any>>({});
  const [surveyValidationError, setSurveyValidationError] = useState<string | null>(null);

  const [liveSubmissions, setLiveSubmissions] = useState<SurveyResponseData[]>(() => {
    try {
      const saved = localStorage.getItem('deepfake_scanner_live_surveys');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('deepfake_scanner_live_surveys', JSON.stringify(liveSubmissions));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [liveSubmissions]);

  const handleSurveyOptionChange = (questionId: string, val: any) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionId]: val }));
    setSurveyValidationError(null);
  };

  const handleCheckboxToggle = (questionId: string, val: string) => {
    setSurveyValidationError(null);
    setSurveyAnswers((prev) => {
      const currentList: string[] = prev[questionId] || [];
      if (currentList.includes(val)) {
        return { ...prev, [questionId]: currentList.filter((x) => x !== val) };
      } else {
        return { ...prev, [questionId]: [...currentList, val] };
      }
    });
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    const unanswered = SURVEY_QUESTIONS.filter((question) => {
      const value = surveyAnswers[question.id];
      if (question.type === 'checkbox') return !Array.isArray(value) || value.length === 0;
      if (question.type === 'rating') return !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 5;
      return typeof value !== 'string' || value.trim().length === 0;
    });
    if (unanswered.length > 0) {
      setSurveyValidationError(`Em hãy trả lời đầy đủ các câu hỏi trước khi gửi. Còn ${unanswered.length} câu chưa có câu trả lời.`);
      return;
    }
    const newSubmission: SurveyResponseData = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      grade: surveyAnswers.grade,
      hasHeardDeepfake: surveyAnswers.hasHeardDeepfake,
      encounteredSuspicious: surveyAnswers.encounteredSuspicious,
      mainInformationSources: surveyAnswers.mainInformationSources,
      checksSourceBeforeSharing: surveyAnswers.checksSourceBeforeSharing,
      knowsVerificationSteps: surveyAnswers.knowsVerificationSteps,
      understandsAiLimitations: surveyAnswers.understandsAiLimitations === 'Không',
      actionWhenUrgentRequest: surveyAnswers.actionWhenUrgentRequest,
      wantsToUseScanner: surveyAnswers.wantsToUseScanner === 'Rất cần thiết',
      mostValuedFeature: surveyAnswers.mostValuedFeature,
      satisfactionScore: Number(surveyAnswers.satisfactionScore) || 5,
    };

    setLiveSubmissions((prev) => [newSubmission, ...prev]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowSurveyModal(false);
      setActiveDataSet('live');
    }, 1500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const dataset = activeDataSet === 'benchmark'
      ? [
          { Trạng_thái_dữ_liệu: 'MINH HỌA - KHÔNG PHẢI KHẢO SÁT THẬT', Khối_lớp: 'Khối 6', Số_lượng: 68, Tỷ_lệ: '21.25%' },
          { Trạng_thái_dữ_liệu: 'MINH HỌA - KHÔNG PHẢI KHẢO SÁT THẬT', Khối_lớp: 'Khối 7', Số_lượng: 82, Tỷ_lệ: '25.62%' },
          { Trạng_thái_dữ_liệu: 'MINH HỌA - KHÔNG PHẢI KHẢO SÁT THẬT', Khối_lớp: 'Khối 8', Số_lượng: 96, Tỷ_lệ: '30.00%' },
          { Trạng_thái_dữ_liệu: 'MINH HỌA - KHÔNG PHẢI KHẢO SÁT THẬT', Khối_lớp: 'Khối 9', Số_lượng: 74, Tỷ_lệ: '23.13%' },
        ]
      : liveSubmissions.map((s, idx) => ({
          STT: idx + 1,
          Trạng_thái_dữ_liệu: 'Phiếu lưu cục bộ trên trình duyệt; chưa đồng bộ máy chủ',
          Thời_gian: s.timestamp,
          Khối_lớp: s.grade,
          Biết_Deepfake: s.hasHeardDeepfake,
          Từng_gặp_nghi_vấn: s.encounteredSuspicious,
          Kiểm_chứng_trước_khi_share: s.checksSourceBeforeSharing,
          Hiểu_giới_hạn_AI: s.understandsAiLimitations ? 'Có' : 'Không',
          Tính_năng_yêu_thích: s.mostValuedFeature,
          Điểm_hài_lòng: s.satisfactionScore,
        }));

    if (dataset.length === 0) {
      alert('Chưa có dữ liệu khảo sát thực tế để xuất CSV.');
      return;
    }

    const csvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const headers = Object.keys(dataset[0]).map(csvCell).join(',');
    const rows = dataset.map((obj) => Object.values(obj).map(csvCell).join(','));
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `nghien_cuu_deepfake_${activeDataSet}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleResetLiveData = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu khảo sát trực tuyến trên máy này không?')) {
      setLiveSubmissions([]);
      localStorage.removeItem('deepfake_scanner_live_surveys');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>TRUNG TÂM DỮ LIỆU KHOA HỌC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Từ Thực Trạng Đến Giải Pháp: Dữ Liệu Nghiên Cứu</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Minh bạch phương pháp nghiên cứu, thực trạng nhận thức của học sinh THCS và đo lường sự tiến bộ thực tế trước và sau can thiệp (Pre-test vs Post-test).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSurveyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#55DDF2] to-[#38b2d6] text-[#101C32] font-bold text-xs hover:brightness-110 flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Làm phiếu khảo sát</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#172941] border border-slate-700 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Xuất bảng số liệu CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2.5 rounded-xl bg-[#172941] border border-slate-700 hover:text-white text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="In báo cáo tóm tắt"
          >
            <Printer className="w-3.5 h-3.5 text-[#55DDF2]" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Dataset Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-[#101C32] rounded-2xl border border-slate-700/60">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDataSet('benchmark')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDataSet === 'benchmark'
                ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 DỮ LIỆU MINH HỌA (N = 320 GIẢ LẬP)
          </button>
          <button
            onClick={() => setActiveDataSet('live')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDataSet === 'live'
                ? 'bg-[#172941] text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🌐 KHẢO SÁT TRỰC TUYẾN ({liveSubmissions.length} PHIẾU)
          </button>
        </div>

        <div className="text-[11px] text-slate-400 px-3">
          {activeDataSet === 'benchmark' ? (
            <span className="text-amber-300 font-mono">* Dữ liệu minh họa dựng sẵn — chưa xác minh là khảo sát thật</span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono">* Phiếu được lưu cục bộ trên trình duyệt này (localStorage), không đồng bộ lên máy chủ</span>
              {liveSubmissions.length > 0 && (
                <button onClick={handleResetLiveData} className="text-xs text-[#CF5B65] hover:underline">
                  Xóa
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Data Overview Cards */}
      {activeDataSet === 'benchmark' ? (
        <div className="space-y-8">
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100" role="note">
            <p className="font-bold mb-1">Lưu ý về tính liêm chính khoa học</p>
            <p>Các số liệu N=320, tỷ lệ phần trăm và biểu đồ bên dưới là dữ liệu minh họa được khai báo sẵn trong mã nguồn để trình diễn dashboard. Chúng chưa được xác minh là kết quả khảo sát thực tế; không dùng làm bằng chứng trong báo cáo hoặc khi thuyết trình như số liệu thật. Hãy thay bằng dữ liệu đã thu thập hợp lệ.</p>
          </div>
          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Cỡ mẫu minh họa</span>
              <p className="text-2xl font-extrabold text-white font-mono">N = 320</p>
              <p className="text-[11px] text-[#A9D8F0]">Học sinh THCS Khối 6-9</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian thu thập</span>
              <p className="text-2xl font-extrabold text-white font-mono">10/2025 - 03/2026</p>
              <p className="text-[11px] text-[#A9D8F0]">6 tháng khảo sát & thử nghiệm</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Mức tăng minh họa</span>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">+58.4%</p>
              <p className="text-[11px] text-slate-300">Từ 28.4% lên 86.8%</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Điểm hài lòng minh họa</span>
              <p className="text-2xl font-extrabold text-[#55DDF2] font-mono">4.72 / 5.0</p>
              <p className="text-[11px] text-[#A9D8F0]">Dễ hiểu & thiết thực</p>
            </div>
          </div>

          {/* Section 1: Pre-test vs Post-test Comparison Table & Bars (Core Scientific Contribution) */}
          <div className="p-6 rounded-2xl bg-[#172941]/90 border border-[#55DDF2]/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f3554] pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-[#55DDF2] tracking-wider">
                  VÍ DỤ MINH HỌA TRƯỚC / SAU
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Ví dụ trình bày biểu đồ trước và sau can thiệp
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                Phương pháp Pre/Post-Test
              </span>
            </div>

            <div className="space-y-4">
              {RESEARCH_BENCHMARK_DATA.prePostComparison.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#101C32] border border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-white text-sm">{item.metric}</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-sm">
                      {item.improvement}
                    </span>
                  </div>

                  {/* Dual comparison bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Pre intervention */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Trước can thiệp (Pre-test)</span>
                        <span className="font-mono text-slate-300 font-bold">{item.preIntervention}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-slate-500 h-full rounded-full"
                          style={{ width: `${item.preIntervention}%` }}
                        />
                      </div>
                    </div>

                    {/* Post intervention */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#A9D8F0]">
                        <span className="font-semibold text-[#55DDF2]">Sau khi dùng website (Post-test)</span>
                        <span className="font-mono text-emerald-400 font-bold">{item.postIntervention}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full"
                          style={{ width: `${item.postIntervention}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#101C32] border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Nhận xét khoa học:</span>
              </p>
              <p>
                Đây chỉ là phần nhận xét mẫu cho dữ liệu minh họa, không phải kết luận thực nghiệm. Chỉ viết nhận xét khoa học sau khi tính toán lại từ phiếu khảo sát thật, kiểm tra chất lượng dữ liệu và mô tả rõ cỡ mẫu cũng như phương pháp.
              </p>
            </div>
          </div>

          {/* Section 2: Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <div className="p-6 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Cơ cấu khối lớp khảo sát</span>
                <span className="text-xs text-[#55DDF2]">N = 320</span>
              </h4>
              <div className="space-y-3 pt-2">
                {RESEARCH_BENCHMARK_DATA.gradeDistribution.map((g, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{g.name}</span>
                      <span className="font-mono">{g.count} học sinh ({g.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#101C32] rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-[#55DDF2] to-blue-500 h-full rounded-full"
                        style={{ width: `${g.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Popularity */}
            <div className="p-6 rounded-2xl bg-[#172941]/80 border border-[#1f3554] space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Phân hệ được học sinh đánh giá cao nhất</span>
                <span className="text-xs text-[#55DDF2]">Tỷ lệ bình chọn</span>
              </h4>
              <div className="space-y-3 pt-2">
                {RESEARCH_BENCHMARK_DATA.featureRatings.map((f, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>{f.feature}</span>
                      <span className="font-mono font-bold text-white">{f.votePercent}%</span>
                    </div>
                    <div className="w-full bg-[#101C32] rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-[#55DDF2] h-full rounded-full"
                        style={{ width: `${f.votePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Online Submissions Section */
        <div className="space-y-6">
          {liveSubmissions.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#172941]/40 border border-[#1f3554] space-y-4">
              <p className="text-slate-300 text-sm">Chưa có phiếu khảo sát trực tuyến nào được gửi trên phiên làm việc này.</p>
              <button
                onClick={() => setShowSurveyModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Làm phiếu khảo sát ngay</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#172941] border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">
                  Đã ghi nhận {liveSubmissions.length} phiếu phản hồi hợp lệ trong phiên này
                </span>
                <button onClick={handleExportCSV} className="text-[#55DDF2] underline font-semibold">
                  Tải danh sách CSV
                </button>
              </div>

              {/* Submissions Table */}
              <div className="rounded-2xl bg-[#172941]/80 border border-[#1f3554] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#101C32] text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">#</th>
                        <th className="p-3.5">Khối lớp</th>
                        <th className="p-3.5">Đã biết Deepfake</th>
                        <th className="p-3.5">Kiểm chứng trước khi share</th>
                        <th className="p-3.5">Phân hệ thích nhất</th>
                        <th className="p-3.5">Đánh giá sao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {liveSubmissions.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-[#101C32]/40 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-semibold text-white">{sub.grade}</td>
                          <td className="p-3.5">{sub.hasHeardDeepfake}</td>
                          <td className="p-3.5">{sub.checksSourceBeforeSharing}</td>
                          <td className="p-3.5 text-[#55DDF2]">{sub.mostValuedFeature}</td>
                          <td className="p-3.5 font-bold text-amber-400">{'★'.repeat(sub.satisfactionScore)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Survey Questionnaire Modal */}
      {showSurveyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#101C32] border border-[#55DDF2]/40 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-[#172941] pb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-[#55DDF2]">
                PHIẾU KHẢO SÁT NGHIÊN CỨU KHOA HỌC
              </span>
              <h2 className="text-xl font-bold text-white mt-1">Đánh Giá Thực Trạng & Hiệu Quả Giải Pháp An Toàn Số</h2>
              <p className="text-xs text-slate-300 mt-1">
                Phiếu khảo sát ẩn danh, không thu thập họ tên, số điện thoại hay thông tin cá nhân.
              </p>
            </div>

            <form onSubmit={handleSaveSurvey} className="space-y-6">
              {SURVEY_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="space-y-3 p-4 rounded-xl bg-[#172941]/60 border border-[#1f3554]">
                  <p className="text-xs font-bold text-white flex items-start gap-2">
                    <span className="text-[#55DDF2] font-mono">Q{idx + 1}.</span>
                    <span>{q.question}</span>
                  </p>

                  {/* Radio Options */}
                  {q.type === 'radio' && q.options && (
                    <div className="space-y-2 pt-1">
                      {q.options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.value}
                            checked={surveyAnswers[q.id] === opt.value}
                            onChange={() => handleSurveyOptionChange(q.id, opt.value)}
                            className="text-[#55DDF2] focus:ring-[#55DDF2]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox Options */}
                  {q.type === 'checkbox' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const checked = (surveyAnswers[q.id] || []).includes(opt.value);
                        return (
                          <label
                            key={opt.value}
                            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleCheckboxToggle(q.id, opt.value)}
                              className="text-[#55DDF2] rounded focus:ring-[#55DDF2]"
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Rating Stars */}
                  {q.type === 'rating' && (
                    <div className="flex items-center gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleSurveyOptionChange(q.id, star)}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= Number(surveyAnswers[q.id] || 0) ? 'text-amber-400' : 'text-slate-600'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-slate-300 ml-2 font-mono">
                        {surveyAnswers[q.id] || 'Chưa chọn'} / 5 Sao
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {surveyValidationError && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/50 text-amber-100 text-xs" role="alert">
                  {surveyValidationError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Cảm ơn em! Phiếu đã được lưu trên trình duyệt của thiết bị này. Dữ liệu chưa được gửi lên máy chủ nghiên cứu.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#172941] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#55DDF2] text-[#101C32] font-bold text-xs hover:brightness-110 transition-all shadow-md"
                >
                  Gửi phiếu khảo sát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

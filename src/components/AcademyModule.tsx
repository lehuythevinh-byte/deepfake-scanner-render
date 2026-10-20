import React, { useState } from 'react';
import { ActiveTab, AcademyArticle } from '../types';
import { ACADEMY_ARTICLES } from '../data/academyData';
import { 
  BookOpen, 
  Search, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  ArrowRight, 
  X, 
  FileText, 
  ExternalLink,
  Shield,
  Tag
} from 'lucide-react';

interface AcademyModuleProps {
  onTabChange: (tab: ActiveTab) => void;
}

export const AcademyModule: React.FC<AcademyModuleProps> = ({ onTabChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<AcademyArticle | null>(null);

  const categories = [
    { id: 'all', label: 'Tất cả chủ đề' },
    { id: 'foundations', label: '1. Kiến thức nền tảng' },
    { id: 'youth_risks', label: '2. Rủi ro học sinh THCS' },
    { id: 'detection_prevention', label: '3. Nhận biết & Phòng tránh' },
    { id: 'incident_response', label: '4. Hướng dẫn xử lý sự cố' },
  ];

  const filteredArticles = ACADEMY_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#172941] pb-6">
        <div className="flex items-center gap-2 text-xs text-[#55DDF2] font-bold tracking-wider uppercase mb-1">
          <BookOpen className="w-4 h-4" />
          <span>THƯ VIỆN AN TOÀN SỐ DÀNH CHO HỌC SINH THCS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Học Viện Deepfake: Kiến Thức & Kỹ Năng Số</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Hệ thống bài học, cẩm nang phòng tránh rủi ro và các chỉ dẫn khoa học được thiết kế ngắn gọn, trực quan, phù hợp với lứa tuổi trung học cơ sở và phụ huynh.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/40 shadow-sm'
                  : 'bg-[#101C32] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết, rủi ro..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#172941] border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#55DDF2] transition-colors"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#172941]/40 border border-[#1f3554] space-y-3">
          <p className="text-slate-400 text-sm">Không tìm thấy bài viết phù hợp với từ khóa "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs text-[#55DDF2] underline font-medium"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="p-6 rounded-2xl bg-[#172941]/80 border border-[#1f3554] hover:border-[#55DDF2]/50 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-semibold text-[#55DDF2]">{article.categoryLabel}</span>
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#55DDF2] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>

                {/* Key Takeaways snippet */}
                <div className="p-3 rounded-xl bg-[#101C32] border border-slate-800 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Điểm cốt lõi:</p>
                  <p className="text-xs text-slate-200 line-clamp-2">
                    · {article.keyTakeaways[0]}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-[#55DDF2] font-semibold">
                <span>Đọc toàn bộ bài viết</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Article Modal Viewer */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#101C32] border border-[#55DDF2]/40 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#172941] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#55DDF2] font-semibold">{activeArticle.categoryLabel}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{activeArticle.readTime} đọc</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{activeArticle.title}</h2>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-full bg-[#172941] text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-[#172941]/70 border border-[#1f3554] text-xs sm:text-sm text-slate-200 leading-relaxed italic">
              {activeArticle.summary}
            </div>

            {/* Key Takeaways */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/50 space-y-2">
              <h3 className="text-xs font-bold text-[#A9D8F0] uppercase tracking-wider">
                🌟 Điều cần nhớ (Key Takeaways)
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {activeArticle.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#55DDF2] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Sections */}
            <div className="space-y-6">
              {activeArticle.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-bold text-white border-l-2 border-[#55DDF2] pl-3">
                    {sec.heading}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-3">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Items */}
            {activeArticle.actionItems.length > 0 && (
              <div className="p-4 rounded-xl bg-[#172941] border border-slate-700/60 space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  ✅ Danh sách hành động thực tế dành cho học sinh:
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-200">
                  {activeArticle.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✔</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {activeArticle.references.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-1.5 text-[10px] text-slate-400">
                <p className="font-semibold uppercase text-slate-500">Tài liệu tham khảo chính thống:</p>
                {activeArticle.references.map((ref, idx) => (
                  <p key={idx}>[{idx + 1}] {ref}</p>
                ))}
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-[#172941] text-white hover:bg-[#1f3554] text-xs font-semibold transition-colors"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

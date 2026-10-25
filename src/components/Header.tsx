import React, { useState } from 'react';
import { ActiveTab, AuthUser } from '../types';
import { 
  ShieldAlert, 
  Search, 
  BookOpen, 
  CheckSquare, 
  Gamepad2, 
  Bot, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Menu,
  X,
  Sparkles,
  Info,
  UserRound,
  ShieldCheck,
  Link2,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  aiConfigured: boolean | null;
  currentUser?: AuthUser | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, aiConfigured, currentUser = null }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'Trang chủ', icon: ShieldAlert },
    ...(currentUser ? [{ id: 'app' as ActiveTab, label: 'Không gian App', icon: LayoutDashboard }] : []),
    { id: 'scanner' as ActiveTab, label: 'Quét Ảnh & Video', icon: Search },
    { id: 'link-scanner' as ActiveTab, label: 'Quét Link', icon: Link2 },
    { id: 'evidence-lab' as ActiveTab, label: 'Kiểm chứng', icon: CheckSquare },
    { id: 'academy' as ActiveTab, label: 'Học viện', icon: BookOpen },
    { id: 'simulator' as ActiveTab, label: 'Tình huống', icon: Gamepad2 },
    { id: 'safebot' as ActiveTab, label: 'SafeBot AI', icon: Bot },
    { id: 'research' as ActiveTab, label: 'Nghiên cứu', icon: BarChart3 },
    { id: 'emergency' as ActiveTab, label: 'Ứng phó khẩn', icon: AlertTriangle, highlight: true },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#101C32]/95 backdrop-blur-md border-b border-[#172941]">
      {/* Top Banner: Official Research Topic */}
      <div className="bg-gradient-to-r from-[#172941] via-[#101C32] to-[#172941] border-b border-[#55DDF2]/15 py-1.5 px-4 text-center">
        <p className="text-xs text-[#A9D8F0] tracking-wide flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#55DDF2] bg-[#55DDF2]/10 px-2 py-0.5 rounded">
            Đề tài NCKH
          </span>
          <span className="font-medium text-slate-200">
            GIẢI PHÁP GIÚP HỌC SINH TRUNG HỌC CƠ SỞ TRÁNH MỘT SỐ TÁC ĐỘNG RỦI RO TỪ DEEPFAKE KHI SỬ DỤNG MẠNG XÃ HỘI
          </span>
        </p>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button 
            onClick={() => handleSelectTab('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#55DDF2]/20 to-[#172941] border border-[#55DDF2]/40 flex items-center justify-center text-[#55DDF2] shadow-sm group-hover:border-[#55DDF2] transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">DEEPFAKE SCANNER</span>
                <span className="text-[10px] text-[#55DDF2] font-semibold tracking-widest uppercase">EDU</span>
              </div>
              <p className="text-[11px] text-[#A9D8F0] font-medium tracking-tight">TRUNG TÂM AN TOÀN SỐ</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2] ${
                    item.highlight
                      ? isActive
                        ? 'bg-[#CF5B65] text-white shadow-sm'
                        : 'text-[#CF5B65] hover:bg-[#CF5B65]/10 border border-[#CF5B65]/30'
                      : isActive
                      ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#172941]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-inherit' : isActive ? 'text-[#55DDF2]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* AI Connection Status Indicator */}
          {/* AI Connection Status Indicator & Account */}
          <div className="hidden sm:flex items-center gap-3">
            <div 
              title={aiConfigured ? "Đã cấu hình API key; trạng thái gọi mô hình vẫn cần được xác minh khi phân tích" : "Chế độ kiểm chứng thủ công & kịch bản"}
              className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#172941] border border-[#1f3554] text-[11px]"
            >
              <span className={`w-2 h-2 rounded-full ${aiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono text-[10px]">
                {aiConfigured ? 'AI KEY SET' : 'MANUAL MODE'}
              </span>
            </div>
            <button
              onClick={() => handleSelectTab('account')}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${activeTab === 'account' ? 'border-[#55DDF2]/50 bg-[#172941] text-[#55DDF2]' : 'border-[#35506d] text-slate-200 hover:bg-[#172941]'}`}
            >
              {currentUser?.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserRound className="w-4 h-4" />}
              <span>{currentUser?.role === 'admin' ? 'Quản trị' : currentUser ? 'Tài khoản' : 'Đăng nhập'}</span>
            </button>
          </div>

          {/* Mobile menu toggle button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#172941] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#101C32] border-b border-[#172941] px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#172941]">
            <span className="text-xs text-slate-400 font-medium">Hệ thống điều hướng an toàn số</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${aiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{aiConfigured ? 'Đã cấu hình AI' : 'Kiểm chứng thủ công'}</span>
            </div>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.highlight
                    ? isActive
                      ? 'bg-[#CF5B65] text-white'
                      : 'text-[#CF5B65] bg-[#CF5B65]/10'
                    : isActive
                    ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/30'
                    : 'text-slate-300 hover:bg-[#172941]/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-inherit" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => handleSelectTab('account')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'account' ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/30' : 'text-slate-200 hover:bg-[#172941]/50'}`}
          >
            {currentUser?.role === 'admin' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserRound className="w-4 h-4" />}
            <span>{currentUser?.role === 'admin' ? 'Quản trị' : currentUser ? 'Tài khoản' : 'Đăng nhập'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

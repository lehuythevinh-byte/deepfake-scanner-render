import React, { useEffect, useRef, useState } from 'react';
import { ActiveTab, AuthUser } from '../types';
import { isMarketingTab } from '../lib/routes';
import { DEFAULT_SITE_CONFIG, SiteConfig } from '../lib/siteConfig';
import {
  ShieldAlert, Menu, X, UserRound, ShieldCheck, LogOut, ChevronDown,
  LayoutDashboard, Search, Link2, Bot, Clock, FileText, BookOpen, Gamepad2, BarChart3, AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser?: AuthUser | null;
  authLoading?: boolean;
  onLogout?: () => void;
  siteConfig?: SiteConfig;
}

const PRIMARY = [
  { id: 'app' as ActiveTab, label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'scanner' as ActiveTab, label: 'AI Scanner', icon: Search },
  { id: 'link-scanner' as ActiveTab, label: 'Link Scanner', icon: Link2 },
  { id: 'safebot' as ActiveTab, label: 'SafeBot', icon: Bot },
  { id: 'history' as ActiveTab, label: 'Lịch sử', icon: Clock },
  { id: 'report' as ActiveTab, label: 'Báo cáo', icon: FileText },
];
const MORE = [
  { id: 'academy' as ActiveTab, label: 'Học viện', icon: BookOpen },
  { id: 'simulator' as ActiveTab, label: 'Tình huống', icon: Gamepad2 },
  { id: 'research' as ActiveTab, label: 'Nghiên cứu', icon: BarChart3 },
  { id: 'emergency' as ActiveTab, label: 'Ứng phó khẩn', icon: AlertTriangle },
];

const Brand: React.FC<{ onClick: () => void; siteConfig?: SiteConfig }> = ({ onClick, siteConfig = DEFAULT_SITE_CONFIG }) => (
  <button onClick={onClick} className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2] rounded-lg">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#55DDF2]/25 to-[#0b1426] border border-[#55DDF2]/40 flex items-center justify-center text-[#55DDF2] group-hover:border-[#55DDF2] transition-colors">
      <ShieldAlert className="w-5 h-5" />
    </div>
    <div className="leading-tight">
      <div className="font-extrabold text-sm sm:text-base tracking-[0.14em] text-white">{siteConfig.siteName}</div>
      <p className="text-[9px] sm:text-[10px] font-medium tracking-[0.28em]" style={{ color: siteConfig.accentColor }}>{siteConfig.brandSubtitle}</p>
    </div>
  </button>
);

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, currentUser = null, authLoading = false, onLogout, siteConfig = DEFAULT_SITE_CONFIG }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // App shell for signed-in users on any non-marketing page; marketing pages stay minimal.
  const inApp: boolean = currentUser !== null && !isMarketingTab(activeTab) && activeTab !== 'login' && activeTab !== 'register';

  useEffect(() => {
    const close = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (tab: ActiveTab) => { onTabChange(tab); setMobileOpen(false); setMoreOpen(false); };
  const shell = 'sticky top-0 z-50 border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl';

  if (!inApp) {
    return (
      <header className={shell}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Brand onClick={() => go('home')} siteConfig={siteConfig} />
          <div className="flex items-center gap-2 sm:gap-3">
            {authLoading ? null : currentUser ? (
              <>
                <button onClick={() => go('app')} style={{ backgroundColor: siteConfig.accentColor }} className="px-4 py-2 rounded-lg text-[#08121f] text-sm font-bold hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white">Vào ứng dụng</button>
              </>
            ) : (
              <>
                <button onClick={() => go('login')} className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]">Đăng nhập</button>
                <button onClick={() => go('register')} style={{ backgroundColor: siteConfig.accentColor }} className="px-3 sm:px-4 py-2 rounded-lg text-[#08121f] text-sm font-bold hover:brightness-110 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap">Tạo tài khoản</button>
              </>
            )}
          </div>
        </div>
      </header>
    );
  }

  const isAdmin = (currentUser as AuthUser | null)?.role === 'admin';
  const linkCls = (active: boolean) => `flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2] ${active ? 'bg-[#172941] text-[#55DDF2] border border-[#55DDF2]/30' : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'}`;

  return (
    <header className={shell}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Brand onClick={() => go('app')} siteConfig={siteConfig} />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Điều hướng ứng dụng">
          {PRIMARY.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} aria-current={activeTab === id ? 'page' : undefined} className={linkCls(activeTab === id)}><Icon className="w-3.5 h-3.5" />{label}</button>
          ))}
          <div className="relative" ref={moreRef}>
            <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-haspopup="menu" className={linkCls(MORE.some((m) => m.id === activeTab))}>Thêm <ChevronDown className="w-3.5 h-3.5" /></button>
            {moreOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0b1426] p-1 shadow-2xl">
                {MORE.map(({ id, label, icon: Icon }) => (
                  <button key={id} role="menuitem" onClick={() => go(id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/5 text-left"><Icon className="w-4 h-4 text-slate-400" />{label}</button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button onClick={() => go('account')} className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${activeTab === 'account' || activeTab === 'admin' ? 'border-[#55DDF2]/50 bg-[#172941] text-[#55DDF2]' : 'border-white/10 text-slate-200 hover:bg-white/5'}`}>
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserRound className="w-4 h-4" />}{isAdmin ? 'Quản trị' : 'Tài khoản'}
          </button>
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5"><LogOut className="w-4 h-4" />Đăng xuất</button>
        </div>

        <button onClick={() => setMobileOpen((v) => !v)} className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#55DDF2]" aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden max-h-[80dvh] overflow-y-auto border-t border-white/5 bg-[#070d1a] px-4 py-3 space-y-1">
          {[...PRIMARY, ...MORE].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => go(id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${activeTab === id ? 'bg-[#172941] text-[#55DDF2]' : 'text-slate-300 hover:bg-white/5'}`}><Icon className="w-4 h-4" />{label}</button>
          ))}
          <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
            <button onClick={() => go('account')} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold text-slate-200 hover:bg-white/5">{isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <UserRound className="w-4 h-4" />}{isAdmin ? 'Quản trị & Tài khoản' : 'Tài khoản'}</button>
            <button onClick={() => { setMobileOpen(false); onLogout?.(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-white/5"><LogOut className="w-4 h-4" />Đăng xuất</button>
          </div>
        </div>
      )}
    </header>
  );
};

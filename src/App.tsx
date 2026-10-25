import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab, AuthUser } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { ScannerModule } from './components/ScannerModule';
import { LinkScannerModule } from './components/LinkScannerModule';
import { EvidenceLabModule } from './components/EvidenceLabModule';
import { AcademyModule } from './components/AcademyModule';
import { SimulatorModule } from './components/SimulatorModule';
import { SafeBotModule } from './components/SafeBotModule';
import { ResearchDashboardModule } from './components/ResearchDashboardModule';
import { ResearchReportModule } from './components/ResearchReportModule';
import { EmergencyModule } from './components/EmergencyModule';
import { AccountModule } from './components/AccountModule';
import { HistoryModule } from './components/HistoryModule';
import { SurveyModal } from './components/SurveyModal';
import { TAB_PATHS, pathToTab, isPublicTab, loginUrlFor, getSafeNextTab } from './lib/routes';
import { DEFAULT_SITE_CONFIG, SiteConfig } from './lib/siteConfig';

const VALID_HASH_TABS = new Set<string>(Object.keys(TAB_PATHS));

// URL -> tab. Pathname wins; legacy "#tab" links keep working.
function resolveInitialTab(): ActiveTab {
  if (typeof window === 'undefined') return 'home';
  const fromPath = pathToTab(window.location.pathname);
  if (fromPath) return fromPath;
  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash && VALID_HASH_TABS.has(hash)) return hash as ActiveTab;
  return 'home';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(resolveInitialTab);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [databaseConfigured, setDatabaseConfigured] = useState<boolean | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [surveyMax, setSurveyMax] = useState(1000);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const promptedThisLoad = useRef(false);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      setDatabaseConfigured(typeof data.databaseConfigured === 'boolean' ? data.databaseConfigured : null);
      setCurrentUser(data.authenticated && data.user ? (data.user as AuthUser) : null);
    } catch {
      setCurrentUser(null);
      setDatabaseConfigured(null);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  // Load the latest public website configuration saved by an administrator.
  useEffect(() => {
    let cancelled = false;
    const apply = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      if (!cancelled) setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...(value as Partial<SiteConfig>) });
    };
    fetch('/api/site-config', { credentials: 'same-origin', cache: 'no-store' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => apply(data?.config))
      .catch(() => undefined);
    const onConfigUpdated = (event: Event) => apply((event as CustomEvent<SiteConfig>).detail);
    window.addEventListener('df-site-config-updated', onConfigUpdated);
    return () => { cancelled = true; window.removeEventListener('df-site-config-updated', onConfigUpdated); };
  }, []);

  // Check backend health and AI configuration status on startup
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setAiConfigured(Boolean(data.aiConfigured));
          if (typeof data.databaseConfigured === 'boolean') {
            setDatabaseConfigured(data.databaseConfigured);
          }
        } else {
          setAiConfigured(false);
        }
      } catch (e) {
        console.warn('Backend health check error, falling back to manual mode:', e);
        setAiConfigured(false);
      }
    };

    checkBackendStatus();
  }, []);

  // Navigation = real URLs (history API). Guarding is applied when rendering AND enforced again by the backend.
  const handleTabChange = useCallback((tab: ActiveTab) => {
    const target = TAB_PATHS[tab] ?? '/';
    if (window.location.pathname !== target || window.location.search || window.location.hash) {
      window.history.pushState({}, '', target);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleNavigation = () => setActiveTab(resolveInitialTab());
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('hashchange', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('hashchange', handleNavigation);
    };
  }, []);

  // ---- Route guard ----
  const needsLogin = !isPublicTab(activeTab);
  const redirectToLogin = authLoaded && !currentUser && needsLogin;
  const redirectToApp = authLoaded && Boolean(currentUser) && (activeTab === 'login' || activeTab === 'register');

  useEffect(() => {
    if (redirectToLogin) {
      // Keep the intended internal destination in ?next= (validated again after login).
      window.history.replaceState({}, '', loginUrlFor(activeTab));
      setActiveTab('login');
    }
  }, [redirectToLogin, activeTab]);

  useEffect(() => {
    if (redirectToApp) handleTabChange(getSafeNextTab());
  }, [redirectToApp, handleTabChange]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      /* cookie is also cleared server-side on next request; continue */
    }
    promptedThisLoad.current = false;
    setSurveyOpen(false);
    await refreshAuth();
    handleTabChange('home');
  }, [refreshAuth, handleTabChange]);

  // ---- Survey invitation (server decides; never while a task is on screen) ----
  useEffect(() => {
    if (!currentUser || activeTab !== 'app' || promptedThisLoad.current) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/survey/status', { credentials: 'same-origin', cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (cancelled || !res.ok || !data.shouldPrompt) return;
        promptedThisLoad.current = true;
        if (typeof data.maxCommentLength === 'number') setSurveyMax(data.maxCommentLength);
        setSurveyOpen(true);
      } catch {
        /* survey failures must never affect the app */
      }
    }, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentUser?.id, activeTab]);

  const deferSurvey = useCallback(async (kind: 'snooze' | 'dismiss') => {
    setSurveyOpen(false); // never trap the user, even if the request fails
    try {
      await fetch('/api/survey/defer', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }),
      });
    } catch {
      /* ignored: the invitation is only shown once per page load anyway */
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-[#F5F7FA]" style={{ backgroundColor: siteConfig.backgroundColor }}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        aiConfigured={aiConfigured}
        currentUser={currentUser}
        authLoading={!authLoaded}
        onLogout={() => void handleLogout()}
        siteConfig={siteConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Protected route while the session is still being verified / redirecting: render nothing sensitive */}
        {needsLogin && (!authLoaded || !currentUser) ? (
          <div className="py-24 text-center text-sm text-slate-400" role="status">Đang kiểm tra phiên đăng nhập…</div>
        ) : (<>
        {/* Landing and overview routes */}
        {(activeTab === 'home' || activeTab === 'landing' || activeTab === 'features' || activeTab === 'how-it-works' || activeTab === 'safety-guide') && (
          <LandingPage
            onTabChange={handleTabChange}
            currentUser={currentUser}
            aiConfigured={aiConfigured}
            siteConfig={siteConfig}
          />
        )}

        {/* Member App Dashboard at /app */}
        {activeTab === 'app' && (
          <UserDashboard
            user={currentUser}
            onTabChange={handleTabChange}
            aiConfigured={aiConfigured}
            databaseConfigured={databaseConfigured}
          />
        )}

        {/* Threat Scanner (Image & Video frame sampling) */}
        {activeTab === 'scanner' && (
          <ScannerModule onTabChange={handleTabChange} aiConfigured={aiConfigured} />
        )}

        {/* Link Safety Scanner */}
        {activeTab === 'link-scanner' && (
          <LinkScannerModule onTabChange={handleTabChange} />
        )}

        {/* Scan History & Reports */}
        {activeTab === 'history' && (
          <HistoryModule user={currentUser} onTabChange={handleTabChange} />
        )}

        {/* Forensic Evidence Lab */}
        {activeTab === 'evidence-lab' && (
          <EvidenceLabModule onTabChange={handleTabChange} />
        )}

        {/* Academy & STEM Knowledge Base */}
        {activeTab === 'academy' && (
          <AcademyModule onTabChange={handleTabChange} />
        )}

        {/* Interactive Scenario Simulator */}
        {activeTab === 'simulator' && (
          <SimulatorModule onTabChange={handleTabChange} />
        )}

        {/* SafeBot AI Chat */}
        {activeTab === 'safebot' && (
          <SafeBotModule onTabChange={handleTabChange} aiConfigured={aiConfigured} />
        )}

        {/* Research Dashboard & Survey Data */}
        {activeTab === 'research' && (
          <ResearchDashboardModule onTabChange={handleTabChange} />
        )}

        {/* Scientific Research Report */}
        {activeTab === 'report' && (
          <ResearchReportModule onTabChange={handleTabChange} />
        )}

        {/* Emergency Response & Hotlines */}
        {activeTab === 'emergency' && (
          <EmergencyModule onTabChange={handleTabChange} />
        )}

        {/* Account / Admin / Auth Portal */}
        {(activeTab === 'account' || activeTab === 'admin' || activeTab === 'login' || activeTab === 'register') && (
          <AccountModule
            user={currentUser}
            databaseConfigured={databaseConfigured}
            onAuthChanged={refreshAuth}
            onTabChange={handleTabChange}
            initialMode={activeTab === 'register' ? 'register' : 'login'}
            onOpenSurvey={() => setSurveyOpen(true)}
          />
        )}
        </>)}
      </main>

      {/* Unified Global Footer */}
      <Footer onTabChange={handleTabChange} signedIn={Boolean(currentUser)} siteConfig={siteConfig} />

      <SurveyModal
        open={surveyOpen && Boolean(currentUser)}
        maxCommentLength={surveyMax}
        onClose={() => void deferSurvey('snooze')}
        onDefer={deferSurvey}
        onSubmitted={() => setSurveyOpen(false)}
      />
    </div>
  );
}

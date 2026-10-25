import React, { useState, useEffect, useCallback } from 'react';
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

// Pathname to Tab resolver
function resolveInitialTab(): ActiveTab {
  if (typeof window === 'undefined') return 'home';

  // 1. Check pathname first (e.g., /app, /app/scanner, /link-scanner, /login, /app/history)
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  if (pathname === '/app') return 'app';
  if (pathname === '/app/scanner' || pathname === '/scanner') return 'scanner';
  if (pathname === '/app/link-scanner' || pathname === '/link-scanner') return 'link-scanner';
  if (pathname === '/app/history' || pathname === '/history') return 'history';
  if (pathname === '/app/safebot' || pathname === '/safebot') return 'safebot';
  if (pathname === '/login' || pathname === '/register' || pathname === '/account' || pathname === '/admin') return 'account';
  if (pathname === '/features') return 'features';
  if (pathname === '/how-it-works') return 'how-it-works';
  if (pathname === '/safety-guide') return 'safety-guide';

  // 2. Check hash fallback
  const hash = window.location.hash.replace('#', '').toLowerCase();
  const validTabs: ActiveTab[] = [
    'home',
    'landing',
    'features',
    'how-it-works',
    'safety-guide',
    'app',
    'scanner',
    'link-scanner',
    'evidence-lab',
    'academy',
    'simulator',
    'safebot',
    'research',
    'report',
    'emergency',
    'account',
    'admin',
    'login',
    'register',
  ];

  if (hash && validTabs.includes(hash as ActiveTab)) {
    return hash as ActiveTab;
  }

  return 'home';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(resolveInitialTab);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [databaseConfigured, setDatabaseConfigured] = useState<boolean | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      setDatabaseConfigured(typeof data.databaseConfigured === 'boolean' ? data.databaseConfigured : null);
      setCurrentUser(data.authenticated && data.user ? (data.user as AuthUser) : null);
    } catch {
      setCurrentUser(null);
      setDatabaseConfigured(null);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

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

  // Sync tab change with URL hash & browser history
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser navigation (back / forward / hash changes)
  useEffect(() => {
    const handleNavigation = () => {
      const resolved = resolveInitialTab();
      if (resolved !== activeTab) {
        setActiveTab(resolved);
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#101C32] text-[#F5F7FA]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        aiConfigured={aiConfigured}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Landing and overview routes */}
        {(activeTab === 'home' || activeTab === 'landing' || activeTab === 'features' || activeTab === 'how-it-works' || activeTab === 'safety-guide') && (
          <LandingPage
            onTabChange={handleTabChange}
            currentUser={currentUser}
            aiConfigured={aiConfigured}
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
          />
        )}
      </main>

      {/* Unified Global Footer */}
      <Footer onTabChange={handleTabChange} />
    </div>
  );
}

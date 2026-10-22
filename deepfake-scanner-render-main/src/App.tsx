import React, { useState, useEffect } from 'react';
import type { ActiveTab } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeModule } from './components/HomeModule';
import { ScannerModule } from './components/ScannerModule';
import { EvidenceLabModule } from './components/EvidenceLabModule';
import { AcademyModule } from './components/AcademyModule';
import { SimulatorModule } from './components/SimulatorModule';
import { SafeBotModule } from './components/SafeBotModule';
import { ResearchDashboardModule } from './components/ResearchDashboardModule';
import { ResearchReportModule } from './components/ResearchReportModule';
import { EmergencyModule } from './components/EmergencyModule';
import { AccountModule } from './components/AccountModule';
import { AdminModule } from './components/AdminModule';
import type { AppUser } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    // Check URL hash for direct deep linking
    const hash = window.location.hash.replace('#', '') as ActiveTab;
    const validTabs: ActiveTab[] = [
      'home',
      'scanner',
      'evidence-lab',
      'academy',
      'simulator',
      'safebot',
      'research',
      'report',
      'emergency',
      'account',
      'admin',
    ];
    return validTabs.includes(hash) ? hash : 'home';
  });

  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authAvailable, setAuthAvailable] = useState(true);

  // Check backend health and AI configuration status on startup
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setAiConfigured(Boolean(data.aiConfigured));
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

  // Restore the current account session on page load.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
        const data = await response.json();
        setCurrentUser(data.authenticated && data.user ? data.user as AppUser : null);
        setAuthAvailable(Boolean(data.authAvailable));
      } catch {
        setCurrentUser(null);
        setAuthAvailable(false);
      }
    };
    void checkSession();
  }, []);

  const handleAuthChange = (user: AppUser | null, available = true) => {
    setCurrentUser(user);
    setAuthAvailable(available);
  };

  // Sync tab changes with URL hash
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      const validTabs: ActiveTab[] = [
        'home',
        'scanner',
        'evidence-lab',
        'academy',
        'simulator',
        'safebot',
        'research',
        'report',
        'emergency',
        'account',
        'admin',
      ];
      if (validTabs.includes(hash) && hash !== activeTab) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#101C32] text-[#F5F7FA]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        aiConfigured={aiConfigured}
        user={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeModule onTabChange={handleTabChange} aiConfigured={aiConfigured} />
        )}
        {activeTab === 'scanner' && (
          <ScannerModule onTabChange={handleTabChange} aiConfigured={aiConfigured} />
        )}
        {activeTab === 'evidence-lab' && (
          <EvidenceLabModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'academy' && (
          <AcademyModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'simulator' && (
          <SimulatorModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'safebot' && (
          <SafeBotModule onTabChange={handleTabChange} aiConfigured={aiConfigured} />
        )}
        {activeTab === 'research' && (
          <ResearchDashboardModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'report' && (
          <ResearchReportModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'emergency' && (
          <EmergencyModule onTabChange={handleTabChange} />
        )}
        {activeTab === 'account' && (
          <AccountModule user={currentUser} authAvailable={authAvailable} onAuthChange={handleAuthChange} onTabChange={handleTabChange} />
        )}
        {activeTab === 'admin' && (
          <AdminModule user={currentUser} />
        )}
      </main>

      {/* Unified Global Footer */}
      <Footer onTabChange={handleTabChange} />
    </div>
  );
}

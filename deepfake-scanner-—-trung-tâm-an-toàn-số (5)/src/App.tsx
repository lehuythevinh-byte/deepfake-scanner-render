import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, AuthUser } from './types';
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
    ];
    return validTabs.includes(hash) ? hash : 'home';
  });

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
        currentUser={currentUser}
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
          <AccountModule
            user={currentUser}
            databaseConfigured={databaseConfigured}
            onAuthChanged={refreshAuth}
          />
        )}
      </main>

      {/* Unified Global Footer */}
      <Footer onTabChange={handleTabChange} />
    </div>
  );
}

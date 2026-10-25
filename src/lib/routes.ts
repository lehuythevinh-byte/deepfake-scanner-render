import type { ActiveTab } from '../types';

// Single source of truth for URL <-> tab mapping.
export const TAB_PATHS: Record<ActiveTab, string> = {
  home: '/',
  landing: '/',
  features: '/features',
  'how-it-works': '/how-it-works',
  'safety-guide': '/safety-guide',
  login: '/login',
  register: '/register',
  emergency: '/emergency',
  academy: '/academy',
  app: '/app',
  scanner: '/app/scanner',
  'link-scanner': '/app/link-scanner',
  safebot: '/app/safebot',
  history: '/app/history',
  'evidence-lab': '/app/evidence-lab',
  simulator: '/app/simulator',
  research: '/app/research',
  report: '/app/reports',
  account: '/account',
  admin: '/admin',
};

// Legacy aliases kept so old bookmarks keep working.
const PATH_ALIASES: Record<string, ActiveTab> = {
  '/scanner': 'scanner',
  '/link-scanner': 'link-scanner',
  '/history': 'history',
  '/safebot': 'safebot',
};

const PATH_TO_TAB: Record<string, ActiveTab> = (() => {
  const map: Record<string, ActiveTab> = {};
  (Object.keys(TAB_PATHS) as ActiveTab[]).forEach((tab) => {
    const p = TAB_PATHS[tab];
    if (!(p in map)) map[p] = tab; // first wins ('/' -> home)
  });
  return { ...map, ...PATH_ALIASES };
})();

export const PUBLIC_TABS: ReadonlySet<ActiveTab> = new Set<ActiveTab>([
  'home', 'landing', 'features', 'how-it-works', 'safety-guide', 'login', 'register', 'emergency', 'academy',
]);

// Tabs that belong to the signed-in application shell (internal navigation).
export const isPublicTab = (tab: ActiveTab): boolean => PUBLIC_TABS.has(tab);
export const isMarketingTab = (tab: ActiveTab): boolean =>
  tab === 'home' || tab === 'landing' || tab === 'features' || tab === 'how-it-works' || tab === 'safety-guide';

export function pathToTab(pathname: string): ActiveTab | null {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return PATH_TO_TAB[clean] ?? null;
}

/**
 * Open-redirect safe: only internal absolute paths that exactly match a known
 * protected route are accepted. Anything else (http://…, //host, javascript:, \\…) is rejected.
 */
export function sanitizeNextPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string' || raw.length > 200) return null;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || /[\u0000-\u001f]/.test(raw)) return null;
  const pathOnly = raw.split(/[?#]/)[0];
  const tab = pathToTab(pathOnly);
  if (!tab || isPublicTab(tab)) return null;
  return TAB_PATHS[tab];
}

export function loginUrlFor(tab: ActiveTab): string {
  const target = TAB_PATHS[tab];
  return isPublicTab(tab) ? '/login' : `/login?next=${encodeURIComponent(target)}`;
}

/** Tab to open after a successful login (defaults to the dashboard). */
export function getSafeNextTab(): ActiveTab {
  if (typeof window === 'undefined') return 'app';
  const next = sanitizeNextPath(new URLSearchParams(window.location.search).get('next'));
  const tab = next ? pathToTab(next) : null;
  return tab ?? 'app';
}

import { useState, useEffect, useCallback } from 'react';
import { useStore } from './store';
import { loadState, checkAndRequestPersistence } from './db';
import { BottomNav, type NavTab } from './components/BottomNav';
import { StorageGate } from './components/StorageGate';
import { Onboarding } from './components/Onboarding';
import { OverviewPage } from './pages/OverviewPage';
import { AccountsPage } from './pages/AccountsPage';
import { SettingsPage } from './pages/SettingsPage';
import { t } from './i18n';

const ONBOARDING_KEY = 'acorn-onboarding-done';

const PAGE_TITLES: Record<NavTab, () => string> = {
  overview: () => t('overview'),
  accounts: () => t('accounts'),
  settings: () => t('settings'),
};

type BootStage =
  | 'storage-check'    // checking persistence status
  | 'storage-prompt'   // need to ask user
  | 'storage-denied'   // user was denied
  | 'storage-unsupported'
  | 'loading'          // reading IndexedDB
  | 'onboarding'       // first-time walkthrough
  | 'ready';

export default function App() {
  const [stage, setStage] = useState<BootStage>('storage-check');
  const [tab, setTab] = useState<NavTab>('overview');
  const { hydrate, locale } = useStore();

  const finishBoot = useCallback(async () => {
    setStage('loading');
    const state = await loadState();
    if (state) hydrate(state);
    const onboardingDone = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setStage(onboardingDone ? 'ready' : 'onboarding');
  }, [hydrate]);

  useEffect(() => {
    checkAndRequestPersistence().then(status => {
      if (status === 'denied') { setStage('storage-denied'); return; }
      if (status === 'unsupported') { setStage('storage-unsupported'); return; }
      finishBoot();
    });
  }, [finishBoot]);

  async function requestStorageAndContinue() {
    const status = await checkAndRequestPersistence();
    if (status === 'granted') {
      await finishBoot();
    } else {
      setStage(status === 'unsupported' ? 'storage-unsupported' : 'storage-denied');
    }
  }

  function completeOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setStage('ready');
  }

  // Re-show onboarding from Settings
  function showOnboarding() {
    setStage('onboarding');
  }

  if (stage === 'storage-check' || stage === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#111827]">
        <div className="w-8 h-8 rounded-full border-2 border-[#16a34a] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (stage === 'storage-prompt') {
    return (
      <StorageGate
        status="checking"
        onRequest={requestStorageAndContinue}
        onContinueAnyway={finishBoot}
      />
    );
  }

  if (stage === 'storage-denied') {
    return (
      <StorageGate
        status="denied"
        onRequest={requestStorageAndContinue}
        onContinueAnyway={finishBoot}
      />
    );
  }

  if (stage === 'storage-unsupported') {
    return (
      <StorageGate
        status="unsupported"
        onRequest={requestStorageAndContinue}
        onContinueAnyway={finishBoot}
      />
    );
  }

  if (stage === 'onboarding') {
    return <Onboarding onDone={completeOnboarding} />;
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#111827] flex flex-col">
      <header className="sticky top-0 z-30 bg-[#111827] border-b border-[#374151] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">🌰</span>
          <span className="font-bold text-[#f9fafb] tracking-tight">Acorn</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#78350f] text-[#fcd34d]">beta</span>
        </div>
        <span className="text-sm text-[#9ca3af]">{PAGE_TITLES[tab]()}</span>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24 overflow-y-auto">
        {tab === 'overview' && <OverviewPage key={locale} />}
        {tab === 'accounts' && <AccountsPage key={locale} />}
        {tab === 'settings' && <SettingsPage key={locale} onShowOnboarding={showOnboarding} />}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

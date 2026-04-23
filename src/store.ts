import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  Account, Acorn, SavingsPlan, Deposit, Withdrawal,
  AppState, WebDAVConfig
} from './types';
import { saveState } from './db';
import { getLocale, setLocale, type Locale } from './i18n';

interface StoreState extends AppState {
  // UI
  locale: Locale;
  webdav: WebDAVConfig;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncError?: string;

  // Init
  hydrate: (state: AppState) => void;

  // Locale
  setLocale: (locale: Locale) => void;

  // WebDAV
  setWebDAV: (config: Partial<WebDAVConfig>) => void;

  // Accounts
  addAccount: (name: string, note?: string) => void;
  updateAccount: (id: string, changes: Partial<Pick<Account, 'name' | 'note'>>) => void;
  deleteAccount: (id: string) => void;

  // Acorns
  addAcorn: (data: Omit<Acorn, 'id' | 'createdAt'>) => void;
  updateAcorn: (id: string, changes: Partial<Omit<Acorn, 'id' | 'createdAt'>>) => void;
  deleteAcorn: (id: string) => void;

  // Savings Plans
  addSavingsPlan: (data: Omit<SavingsPlan, 'id' | 'createdAt'>) => void;
  updateSavingsPlan: (id: string, changes: Partial<Omit<SavingsPlan, 'id' | 'createdAt'>>) => void;
  deleteSavingsPlan: (id: string) => void;

  // Deposits
  addDeposit: (data: Omit<Deposit, 'id' | 'createdAt'>) => void;
  updateDeposit: (id: string, changes: Partial<Omit<Deposit, 'id' | 'createdAt'>>) => void;
  deleteDeposit: (id: string) => void;

  // Withdrawals
  addWithdrawal: (data: Omit<Withdrawal, 'id' | 'createdAt'>) => void;
  updateWithdrawal: (id: string, changes: Partial<Omit<Withdrawal, 'id' | 'createdAt'>>) => void;
  deleteWithdrawal: (id: string) => void;

  // Import/Export
  exportState: () => string;
  importState: (json: string) => void;

  // Sync
  setSyncStatus: (status: 'idle' | 'syncing' | 'success' | 'error', error?: string) => void;
}

const defaultWebDAV: WebDAVConfig = JSON.parse(
  localStorage.getItem('webdav') || JSON.stringify({
    url: '', username: '', password: '', enabled: false
  })
);

function now() {
  return new Date().toISOString();
}

function persist(state: AppState) {
  saveState(state).catch(console.error);
}

export const useStore = create<StoreState>((set, get) => ({
  accounts: [],
  acorns: [],
  savingsPlans: [],
  withdrawals: [],
  deposits: [],
  lastModified: now(),
  locale: getLocale(),
  webdav: defaultWebDAV,
  syncStatus: 'idle',

  hydrate(state) {
    set({ ...state });
  },

  setLocale(locale) {
    setLocale(locale);
    set({ locale });
  },

  setWebDAV(config) {
    const webdav = { ...get().webdav, ...config };
    localStorage.setItem('webdav', JSON.stringify(webdav));
    set({ webdav });
  },

  addAccount(name, note) {
    set(s => {
      const accounts = [...s.accounts, { id: uuid(), name, note, createdAt: now() }];
      const next = { ...s, accounts, lastModified: now() };
      persist(next);
      return next;
    });
  },

  updateAccount(id, changes) {
    set(s => {
      const accounts = s.accounts.map(a => a.id === id ? { ...a, ...changes } : a);
      const next = { ...s, accounts, lastModified: now() };
      persist(next);
      return next;
    });
  },

  deleteAccount(id) {
    set(s => {
      const acornIds = s.acorns.filter(a => a.accountId === id).map(a => a.id);
      const accounts = s.accounts.filter(a => a.id !== id);
      const acorns = s.acorns.filter(a => a.accountId !== id);
      const savingsPlans = s.savingsPlans.filter(p => !acornIds.includes(p.acornId));
      const deposits = s.deposits.filter(d => !acornIds.includes(d.acornId));
      const withdrawals = s.withdrawals.filter(w => !acornIds.includes(w.acornId));
      const next = { ...s, accounts, acorns, savingsPlans, deposits, withdrawals, lastModified: now() };
      persist(next);
      return next;
    });
  },

  addAcorn(data) {
    set(s => {
      const acorns = [...s.acorns, { id: uuid(), ...data, createdAt: now() }];
      const next = { ...s, acorns, lastModified: now() };
      persist(next);
      return next;
    });
  },

  updateAcorn(id, changes) {
    set(s => {
      const acorns = s.acorns.map(a => a.id === id ? { ...a, ...changes } : a);
      const next = { ...s, acorns, lastModified: now() };
      persist(next);
      return next;
    });
  },

  deleteAcorn(id) {
    set(s => {
      const acorns = s.acorns.filter(a => a.id !== id);
      const savingsPlans = s.savingsPlans.filter(p => p.acornId !== id);
      const deposits = s.deposits.filter(d => d.acornId !== id);
      const withdrawals = s.withdrawals.filter(w => w.acornId !== id);
      const next = { ...s, acorns, savingsPlans, deposits, withdrawals, lastModified: now() };
      persist(next);
      return next;
    });
  },

  addSavingsPlan(data) {
    set(s => {
      const savingsPlans = [...s.savingsPlans, { id: uuid(), ...data, createdAt: now() }];
      const next = { ...s, savingsPlans, lastModified: now() };
      persist(next);
      return next;
    });
  },

  updateSavingsPlan(id, changes) {
    set(s => {
      const savingsPlans = s.savingsPlans.map(p => p.id === id ? { ...p, ...changes } : p);
      const next = { ...s, savingsPlans, lastModified: now() };
      persist(next);
      return next;
    });
  },

  deleteSavingsPlan(id) {
    set(s => {
      const savingsPlans = s.savingsPlans.filter(p => p.id !== id);
      const next = { ...s, savingsPlans, lastModified: now() };
      persist(next);
      return next;
    });
  },

  addDeposit(data) {
    set(s => {
      const deposits = [...s.deposits, { id: uuid(), ...data, createdAt: now() }];
      const next = { ...s, deposits, lastModified: now() };
      persist(next);
      return next;
    });
  },

  updateDeposit(id, changes) {
    set(s => {
      const deposits = s.deposits.map(d => d.id === id ? { ...d, ...changes } : d);
      const next = { ...s, deposits, lastModified: now() };
      persist(next);
      return next;
    });
  },

  deleteDeposit(id) {
    set(s => {
      const deposits = s.deposits.filter(d => d.id !== id);
      const next = { ...s, deposits, lastModified: now() };
      persist(next);
      return next;
    });
  },

  addWithdrawal(data) {
    set(s => {
      const withdrawals = [...s.withdrawals, { id: uuid(), ...data, createdAt: now() }];
      const next = { ...s, withdrawals, lastModified: now() };
      persist(next);
      return next;
    });
  },

  updateWithdrawal(id, changes) {
    set(s => {
      const withdrawals = s.withdrawals.map(w => w.id === id ? { ...w, ...changes } : w);
      const next = { ...s, withdrawals, lastModified: now() };
      persist(next);
      return next;
    });
  },

  deleteWithdrawal(id) {
    set(s => {
      const withdrawals = s.withdrawals.filter(w => w.id !== id);
      const next = { ...s, withdrawals, lastModified: now() };
      persist(next);
      return next;
    });
  },

  exportState() {
    const { accounts, acorns, savingsPlans, deposits, withdrawals, lastModified } = get();
    return JSON.stringify({ accounts, acorns, savingsPlans, deposits, withdrawals, lastModified }, null, 2);
  },

  importState(json) {
    const parsed = JSON.parse(json) as AppState;
    const next = {
      accounts: parsed.accounts || [],
      acorns: parsed.acorns || [],
      savingsPlans: parsed.savingsPlans || [],
      deposits: parsed.deposits || [],
      withdrawals: parsed.withdrawals || [],
      lastModified: parsed.lastModified || now(),
    };
    set(next);
    persist(next);
  },

  setSyncStatus(status, error) {
    set({ syncStatus: status, syncError: error });
  },
}));

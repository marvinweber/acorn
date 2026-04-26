export type Rhythm = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Account {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
}

export interface Acorn {
  id: string;
  name: string;
  icon?: string;
  accountId: string;
  targetAmount?: number;
  targetDate?: string;
  note?: string;
  createdAt: string;
}

export interface SavingsPlan {
  id: string;
  acornId: string;
  amount: number;
  rhythm: Rhythm;
  planningRhythm?: Rhythm;
  start: string;
  end?: string;
  note?: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  acornId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Deposit {
  id: string;
  acornId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface AppState {
  accounts: Account[];
  acorns: Acorn[];
  savingsPlans: SavingsPlan[];
  withdrawals: Withdrawal[];
  deposits: Deposit[];
  lastModified: string;
}

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
  enabled: boolean;
  lastSync?: string;
}

import { openDB, type IDBPDatabase } from 'idb';
import type { AppState } from './types';

const DB_NAME = 'acorn-db';
const DB_VERSION = 1;
const STORE = 'state';

let db: IDBPDatabase | null = null;

async function getDb() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE);
        }
      },
    });
  }
  return db;
}

export type StoragePersistenceStatus = 'granted' | 'denied' | 'unsupported';

export async function checkAndRequestPersistence(): Promise<StoragePersistenceStatus> {
  if (!navigator.storage?.persist) return 'unsupported';
  const already = await navigator.storage.persisted();
  if (already) return 'granted';
  const granted = await navigator.storage.persist();
  return granted ? 'granted' : 'denied';
}

function extractAppState(state: AppState): AppState {
  return {
    accounts: state.accounts,
    acorns: state.acorns,
    savingsPlans: state.savingsPlans,
    deposits: state.deposits,
    withdrawals: state.withdrawals,
    lastModified: state.lastModified,
  };
}

export async function loadState(): Promise<AppState | null> {
  try {
    const database = await getDb();
    const result = await database.get(STORE, 'appState');
    return result ?? null;
  } catch (e) {
    console.error('[Acorn] Failed to load state from IndexedDB:', e);
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    const database = await getDb();
    // Only save plain data fields — functions cannot be serialized by structured clone
    await database.put(STORE, extractAppState(state), 'appState');
  } catch (e) {
    console.error('[Acorn] Failed to save state to IndexedDB:', e);
    throw e;
  }
}

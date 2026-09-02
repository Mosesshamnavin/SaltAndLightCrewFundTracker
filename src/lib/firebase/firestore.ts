import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Transaction, AuditLog, ChurchSettings, UserProfile, UserRole } from '@/types';

// Default initial dataset for instant preview and fallback
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Moses Sham Navin',
    email: 'admin@saltandlight.in',
    role: 'admin',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
  {
    id: 'user-member-1',
    name: 'Youth Member (Gmail)',
    email: 'member@gmail.com',
    role: 'user',
    createdAt: '2026-01-05T10:30:00.000Z',
    updatedAt: '2026-01-05T10:30:00.000Z',
  },
];

export const INITIAL_SETTINGS: ChurchSettings = {
  id: 'church_settings',
  churchName: 'Salt And Light Crew',
  currency: 'INR',
  currencySymbol: '₹',
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'Moses Sham Navin',
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-seed-1',
    type: 'expense',
    category: 'Utilities',
    amount: 258,
    description: 'paper cups',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-2',
    type: 'income',
    category: 'Sales',
    amount: 5450,
    description: 'last sun sale',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:05:00.000Z',
    updatedAt: '2026-09-01T10:05:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-3',
    type: 'income',
    category: 'Other',
    amount: 12,
    description: 'remaing money',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:10:00.000Z',
    updatedAt: '2026-09-01T10:10:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-4',
    type: 'expense',
    category: 'Product Purchase',
    amount: 3050,
    description: 'same as last sun',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:15:00.000Z',
    updatedAt: '2026-09-01T10:15:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-5',
    type: 'income',
    category: 'Alumni Contribution',
    amount: 1000,
    description: 'herber anna',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:20:00.000Z',
    updatedAt: '2026-09-01T10:20:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-6',
    type: 'income',
    category: 'Sales',
    amount: 3950,
    description: 'sales on last sun',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:25:00.000Z',
    updatedAt: '2026-09-01T10:25:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-7',
    type: 'expense',
    category: 'Product Purchase',
    amount: 2670,
    description: 'palarasam nongu pall',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:30:00.000Z',
    updatedAt: '2026-09-01T10:30:00.000Z',
    isDeleted: false,
  },
  {
    id: 'tx-seed-8',
    type: 'income',
    category: 'Alumni Contribution',
    amount: 3000,
    description: 'product purchase',
    date: '2026-09-01',
    createdBy: 'user-admin-1',
    createdByName: 'Moses Sham Navin',
    createdAt: '2026-09-01T10:35:00.000Z',
    updatedAt: '2026-09-01T10:35:00.000Z',
    isDeleted: false,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Local storage keys
const STORAGE_KEY_TX = 'sl_fund_transactions';
const STORAGE_KEY_AUDIT = 'sl_fund_audit_logs';
const STORAGE_KEY_SETTINGS = 'sl_fund_settings';
const STORAGE_KEY_USERS = 'sl_fund_users';

export function clearAllLocalFinancialData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_TX);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing data:', e);
  }
}

function getLocalData<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

/* =========================================================
   TRANSACTIONS SERVICE
========================================================= */

export async function fetchTransactions(): Promise<Transaction[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'transactions'));
      if (!snapshot.empty) {
        const list = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              ...data,
              id: docSnap.id,
            } as Transaction;
          })
          .filter((tx) => !tx.isDeleted);

        list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        setLocalData(STORAGE_KEY_TX, list);
        return list;
      } else if (INITIAL_TRANSACTIONS.length > 0) {
        for (const tx of INITIAL_TRANSACTIONS) {
          try {
            await setDoc(doc(db, 'transactions', tx.id), tx);
          } catch (err) {
            console.warn('Initial seed error:', err);
          }
        }
        setLocalData(STORAGE_KEY_TX, INITIAL_TRANSACTIONS);
        return INITIAL_TRANSACTIONS;
      }
    } catch (e) {
      console.warn('Firestore fetch error, falling back to local dataset:', e);
    }
  }

  // Fallback to local storage
  const localList = getLocalData<Transaction[]>(STORAGE_KEY_TX, []);
  if (localList && localList.length > 0) {
    return localList.filter((t) => !t.isDeleted);
  }
  setLocalData(STORAGE_KEY_TX, INITIAL_TRANSACTIONS);
  return INITIAL_TRANSACTIONS;
}

export async function createTransactionRecord(
  txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>,
  currentUser: { id: string; name: string }
): Promise<Transaction> {
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...txData,
    id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    createdAt: now,
    updatedAt: now,
    isDeleted: false,
  };

  // 1. Update local storage
  const list = getLocalData<Transaction[]>(STORAGE_KEY_TX, INITIAL_TRANSACTIONS);
  const updatedList = [newTx, ...list.filter((t) => t.id !== newTx.id)];
  setLocalData(STORAGE_KEY_TX, updatedList);

  // 2. Sync to Firestore using consistent ID
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'transactions', newTx.id);
      await setDoc(docRef, { ...newTx });
    } catch (e) {
      console.warn('Firestore create error, saving locally:', e);
    }
  }

  // 3. Create audit log
  try {
    await createAuditLogRecord({
      action: 'create',
      transactionId: newTx.id,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      newData: newTx,
    });
  } catch (e) {
    console.warn('Audit log create error:', e);
  }

  return newTx;
}

export async function updateTransactionRecord(
  id: string,
  txData: Partial<Transaction>,
  currentUser: { id: string; name: string }
): Promise<Transaction | null> {
  const now = new Date().toISOString();
  const list = getLocalData<Transaction[]>(STORAGE_KEY_TX, INITIAL_TRANSACTIONS);
  const existingIdx = list.findIndex((t) => t.id === id);
  const prevData = existingIdx >= 0 ? { ...list[existingIdx] } : null;

  const updatedTx: Transaction = {
    ...(existingIdx >= 0 ? list[existingIdx] : {}),
    ...txData,
    id,
    updatedAt: now,
  } as Transaction;

  // 1. Update local storage immediately for responsive UI
  if (existingIdx >= 0) {
    list[existingIdx] = updatedTx;
  } else {
    list.unshift(updatedTx);
  }
  setLocalData(STORAGE_KEY_TX, list);

  // 2. Sync with Firestore using setDoc with merge
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'transactions', id);
      await setDoc(docRef, { ...updatedTx }, { merge: true });
    } catch (e) {
      console.warn('Firestore update error (saved locally):', e);
    }
  }

  // 3. Create audit log
  try {
    await createAuditLogRecord({
      action: 'update',
      transactionId: id,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      previousData: prevData,
      newData: updatedTx,
    });
  } catch (e) {
    console.warn('Audit log write error:', e);
  }

  return updatedTx;
}

export async function softDeleteTransactionRecord(
  id: string,
  currentUser: { id: string; name: string }
): Promise<boolean> {
  const list = getLocalData<Transaction[]>(STORAGE_KEY_TX, INITIAL_TRANSACTIONS);
  const existingIdx = list.findIndex((t) => t.id === id);
  const prevData = existingIdx >= 0 ? { ...list[existingIdx] } : null;

  // 1. Remove from local storage list
  const updatedList = list.filter((t) => t.id !== id);
  setLocalData(STORAGE_KEY_TX, updatedList);

  // 2. Delete document from Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'transactions', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore delete error (deleted locally):', e);
    }
  }

  // 3. Record audit trail
  try {
    await createAuditLogRecord({
      action: 'delete',
      transactionId: id,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      previousData: prevData,
      newData: { isDeleted: true },
    });
  } catch (e) {
    console.warn('Audit log delete write error:', e);
  }

  return true;
}

/* =========================================================
   AUDIT LOGS SERVICE
========================================================= */

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'audit_logs'));
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
          } as AuditLog;
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLocalData(STORAGE_KEY_AUDIT, list);
        return list;
      }
    } catch (e) {
      console.warn('Firestore audit fetch error:', e);
    }
  }

  return getLocalData<AuditLog[]>(STORAGE_KEY_AUDIT, INITIAL_AUDIT_LOGS);
}

export async function createAuditLogRecord(
  log: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  const newLog: AuditLog = {
    ...log,
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'audit_logs'), newLog);
    } catch (e) {
      console.warn('Firestore create audit log error:', e);
    }
  }

  const list = getLocalData<AuditLog[]>(STORAGE_KEY_AUDIT, INITIAL_AUDIT_LOGS);
  setLocalData(STORAGE_KEY_AUDIT, [newLog, ...list]);
  return newLog;
}

/* =========================================================
   CHURCH SETTINGS SERVICE
========================================================= */

export async function fetchSettings(): Promise<ChurchSettings> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'church_settings');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as ChurchSettings;
      }
    } catch (e) {
      console.warn('Firestore settings fetch error:', e);
    }
  }

  return getLocalData<ChurchSettings>(STORAGE_KEY_SETTINGS, INITIAL_SETTINGS);
}

export async function updateSettingsRecord(
  settings: Partial<ChurchSettings>,
  currentUser: { name: string }
): Promise<ChurchSettings> {
  const current = await fetchSettings();
  const updated: ChurchSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser.name,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'settings', 'church_settings');
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.warn('Firestore settings update error:', e);
    }
  }

  setLocalData(STORAGE_KEY_SETTINGS, updated);
  return updated;
}

/* =========================================================
   USER MANAGEMENT SERVICE
========================================================= */

export async function fetchUsers(): Promise<UserProfile[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as UserProfile[];
      }
    } catch (e) {
      console.warn('Firestore users fetch error:', e);
    }
  }

  return getLocalData<UserProfile[]>(STORAGE_KEY_USERS, INITIAL_USERS);
}

export async function updateUserRoleRecord(
  userId: string,
  newRole: UserRole,
  adminUser: { name: string }
): Promise<UserProfile[]> {
  const users = await fetchUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    users[idx].role = newRole;
    users[idx].updatedAt = new Date().toISOString();
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore user role update error:', e);
    }
  }

  setLocalData(STORAGE_KEY_USERS, users);
  return users;
}

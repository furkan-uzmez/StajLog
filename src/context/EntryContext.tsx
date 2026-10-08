/* oxlint-disable react/only-export-components */
import React, { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import type { Entry } from '../interfaces/entry';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { INITIAL_ENTRIES } from '../utils/initialData';
import { isEntryArray } from '../utils/validation';

export interface EntryOperationResult {
  success: boolean;
  error?: string;
}

export interface EntryContextType {
  entries: Entry[];
  storageError: string | null;
  createEntry: (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>) => EntryOperationResult;
  updateEntry: (id: string, data: Partial<Omit<Entry, 'id' | 'createdAt'>>) => EntryOperationResult;
  deleteEntry: (id: string) => EntryOperationResult;
  restoreEntries: (newEntries: Entry[]) => EntryOperationResult;
  resetAllEntries: () => EntryOperationResult;
  loadInitialData: () => EntryOperationResult;
  getEntryById: (id: string) => Entry | undefined;
  clearStorageError: () => void;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface EntryProviderProps {
  children: ReactNode;
}

export const EntryProvider: React.FC<EntryProviderProps> = ({ children }) => {
  const storage = useLocalStorage<Entry[]>(
    'stajlog_entries',
    INITIAL_ENTRIES,
    isEntryArray
  );
  const entries = storage.value;
  const setEntries = storage.setValue;
  const storageError = storage.error;
  const clearStorageError = storage.clearError;

  const createEntry = useCallback(
    (data: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): EntryOperationResult => {
      const now = new Date().toISOString();
      const newEntry: Entry = {
        ...data,
        id: generateUUID(),
        createdAt: now,
        updatedAt: now,
      };
      const ok = setEntries((prev) => [newEntry, ...prev]);
      if (!ok) {
        return {
          success: false,
          error: 'Kayıt eklenirken depolama hatası oluştu (alan dolu veya depolama engellendi).',
        };
      }
      return { success: true };
    },
    [setEntries]
  );

  const updateEntry = useCallback(
    (id: string, data: Partial<Omit<Entry, 'id' | 'createdAt'>>): EntryOperationResult => {
      let found = false;
      const ok = setEntries((prev) => {
        const index = prev.findIndex((e) => e.id === id);
        if (index === -1) {
          found = false;
          return prev;
        }
        found = true;
        const now = new Date().toISOString();
        const updated: Entry = {
          ...prev[index],
          ...data,
          updatedAt: now,
        };
        const next = [...prev];
        next[index] = updated;
        return next;
      });

      if (!found) {
        return { success: false, error: 'Güncellenecek staj kaydı bulunamadı.' };
      }
      if (!ok) {
        return {
          success: false,
          error: 'Kayıt güncellenirken depolama hatası oluştu (alan dolu veya depolama engellendi).',
        };
      }
      return { success: true };
    },
    [setEntries]
  );

  const deleteEntry = useCallback(
    (id: string): EntryOperationResult => {
      const ok = setEntries((prev) => prev.filter((e) => e.id !== id));
      if (!ok) {
        return { success: false, error: 'Kayıt silinirken depolama hatası oluştu.' };
      }
      return { success: true };
    },
    [setEntries]
  );

  const restoreEntries = useCallback(
    (newEntries: Entry[]): EntryOperationResult => {
      const ok = setEntries(newEntries);
      if (!ok) {
        return { success: false, error: 'Kayıtlar geri yüklenirken depolama hatası oluştu.' };
      }
      return { success: true };
    },
    [setEntries]
  );

  const resetAllEntries = useCallback((): EntryOperationResult => {
    const ok = setEntries([]);
    if (!ok) {
      return { success: false, error: 'Kayıtlar sıfırlanırken depolama hatası oluştu.' };
    }
    return { success: true };
  }, [setEntries]);

  const loadInitialData = useCallback((): EntryOperationResult => {
    const ok = setEntries(INITIAL_ENTRIES);
    if (!ok) {
      return { success: false, error: 'Örnek veriler yüklenirken depolama hatası oluştu.' };
    }
    return { success: true };
  }, [setEntries]);

  const getEntryById = useCallback(
    (id: string): Entry | undefined => {
      return entries.find((e) => e.id === id);
    },
    [entries]
  );

  const value = useMemo<EntryContextType>(
    () => ({
      entries,
      storageError,
      createEntry,
      updateEntry,
      deleteEntry,
      restoreEntries,
      resetAllEntries,
      loadInitialData,
      getEntryById,
      clearStorageError,
    }),
    [
      entries,
      storageError,
      createEntry,
      updateEntry,
      deleteEntry,
      restoreEntries,
      resetAllEntries,
      loadInitialData,
      getEntryById,
      clearStorageError,
    ]
  );

  return <EntryContext.Provider value={value}>{children}</EntryContext.Provider>;
};

export function useEntries(): EntryContextType {
  const context = useContext(EntryContext);
  if (!context) {
    throw new Error('useEntries must be used within an EntryProvider');
  }
  return context;
}

import { useState, useEffect, useCallback, useRef } from 'react';

export type UseLocalStorageResult<T> = [
  T,
  (value: T | ((prev: T) => T)) => boolean,
  string | null,
  () => void
] & {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => boolean;
  error: string | null;
  removeItem: () => void;
  clearError: () => void;
};

/**
 * Maps storage exceptions (QuotaExceededError, SecurityError, etc.)
 * to readable localized error messages.
 */
export function formatStorageError(err: unknown): string {
  if (err instanceof DOMException) {
    if (
      err.name === 'QuotaExceededError' ||
      err.code === 22 ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ) {
      return 'Tarayıcı depolama kotası aşıldı (QuotaExceededError). Lütfen bazı kayıtları siliniz.';
    }
    if (err.name === 'SecurityError' || err.code === 18) {
      return 'Tarayıcı güvenlik ayarları LocalStorage erişimini engelliyor (SecurityError).';
    }
    return `${err.name}: ${err.message}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Bilinmeyen bir depolama hatası meydana geldi.';
}

/**
 * Computes initial storage state safely without throwing.
 */
export function getInitialStorageState<T>(
  key: string,
  initialValue: T,
  validator?: (val: unknown) => val is T
): { value: T; error: string | null } {
  if (typeof window === 'undefined') {
    return { value: initialValue, error: null };
  }

  try {
    const raw = window.localStorage.getItem(key);

    // Key is completely absent: persist initialValue to register key in storage
    if (raw === null) {
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      } catch (writeErr) {
        return {
          value: initialValue,
          error: formatStorageError(writeErr),
        };
      }
      return { value: initialValue, error: null };
    }

    const parsed = JSON.parse(raw);

    // If validator provided, ensure schema matches
    if (validator && !validator(parsed)) {
      console.warn(`LocalStorage validation failed for key "${key}". Falling back to initialValue.`);
      return {
        value: initialValue,
        error: `LocalStorage verisi ("${key}") beklenen şemaya uymuyor.`,
      };
    }

    return { value: parsed as T, error: null };
  } catch (err) {
    console.error(`LocalStorage read error for key "${key}":`, err);
    let msg = 'LocalStorage okuma hatası meydana geldi.';
    if (err instanceof DOMException && (err.name === 'SecurityError' || err.code === 18)) {
      msg = 'Tarayıcı güvenlik ayarları LocalStorage erişimini engelliyor (SecurityError).';
    } else if (err instanceof SyntaxError) {
      msg = `LocalStorage verisi ("${key}") geçersiz JSON formatında (SyntaxError).`;
    } else if (err instanceof Error) {
      msg = err.message;
    }
    return { value: initialValue, error: msg };
  }
}

/**
 * Fault-tolerant localStorage hook with runtime schema validation,
 * quota & security error handling, and cross-tab synchronization.
 *
 * Preserves empty array state `[]` when set (does not reset to initialValue on refresh).
 *
 * @param key The localStorage key
 * @param initialValue Default value if key does not exist
 * @param validator Optional runtime type-guard to validate parsed JSON
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validator?: (val: unknown) => val is T
): UseLocalStorageResult<T> {
  const [initialState] = useState(() =>
    getInitialStorageState(key, initialValue, validator)
  );

  const [storedValue, setStoredValue] = useState<T>(initialState.value);
  const [error, setError] = useState<string | null>(initialState.error);

  // Keep a ref tracking current state for clean updater computation without side-effects in setters
  const storedValueRef = useRef<T>(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)): boolean => {
      try {
        const nextValue =
          typeof value === 'function'
            ? (value as (prev: T) => T)(storedValueRef.current)
            : value;

        // 1. Attempt to persist to localStorage first
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        }

        // 2. Only on successful write, update React state and ref
        storedValueRef.current = nextValue;
        setStoredValue(nextValue);
        setError(null);
        return true;
      } catch (writeError) {
        // If write fails (QuotaExceededError, SecurityError, etc.), do NOT update state!
        const errorMsg = formatStorageError(writeError);
        console.error(`LocalStorage write error for key "${key}":`, writeError);
        setError(errorMsg);
        return false;
      }
    },
    [key]
  );

  const removeItem = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      storedValueRef.current = initialValue;
      setStoredValue(initialValue);
      setError(null);
    } catch (err) {
      setError(formatStorageError(err));
    }
  }, [key, initialValue]);
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen to storage events from other browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;

      if (e.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        const parsed = JSON.parse(e.newValue);
        if (validator && !validator(parsed)) {
          console.warn(`Storage event: validation failed for key "${key}".`);
          return;
        }
        setStoredValue(parsed as T);
        setError(null);
      } catch (parseError) {
        console.error(`Storage event: parse error for key "${key}":`, parseError);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue, validator]);

  const result = [storedValue, setValue, error, removeItem] as unknown as UseLocalStorageResult<T>;
  result.value = storedValue;
  result.setValue = setValue;
  result.error = error;
  result.removeItem = removeItem;
  result.clearError = clearError;

  return result;
}

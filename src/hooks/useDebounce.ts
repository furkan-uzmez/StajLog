import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce fast-changing values (such as search queries).
 *
 * @param value The value to debounce
 * @param delay Delay duration in milliseconds (defaults to 250ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

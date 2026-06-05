import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a debounced version of the given callback.
 * The callback fires only after `delayMs` milliseconds of inactivity.
 * Calling the returned function resets the timer.
 * The returned `cancel` function aborts any pending invocation.
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): { debouncedFn: (...args: Parameters<T>) => void; cancel: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref fresh without re-creating the debounced function
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delayMs);
    },
    [delayMs, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => cancel();
  }, [cancel]);

  return { debouncedFn, cancel };
}

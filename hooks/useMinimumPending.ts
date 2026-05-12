import { useEffect, useRef, useState, startTransition } from "react";

/** Минимальное время, в течение которого индикатор загрузки остаётся видимым после завершения операции. */
export const LOADER_MIN_VISIBLE_MS = 400;

/**
 * Держит флаг «идёт загрузка» истинным не меньше `minMs` с момента первого `active === true`,
 * чтобы лоадер не мигал при очень быстрых ответах API.
 */
export function useMinimumPending(
  active: boolean,
  minMs = LOADER_MIN_VISIBLE_MS
): boolean {
  const [displayed, setDisplayed] = useState(false);
  const startRef = useRef<number | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      startRef.current = Date.now();
      startTransition(() => {
        setDisplayed(true);
      });
      return;
    }

    if (startRef.current === null) {
      return;
    }

    const started = startRef.current;
    const elapsed = Date.now() - started;
    const remaining = Math.max(0, minMs - elapsed);

    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      startRef.current = null;
      setDisplayed(false);
    }, remaining);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [active, minMs]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  return active || displayed;
}

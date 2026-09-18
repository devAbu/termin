"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TOAST_DURATION_MS = 2600;

/**
 * Short-lived confirmation toast: `flash(message)` shows it for ~2.6 s, a newer call replaces it and
 * restarts the timer. Render with `{toast && <Toast message={toast} />}`.
 */
export function useFlashToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { toast, flash };
}

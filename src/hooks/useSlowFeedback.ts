import { useEffect, useState } from "react";

/**
 * Returns a contextual message when an operation is taking long.
 * - null for the first `quietMs` (default 3s)
 * - "Still working..." between quietMs and warnMs
 * - "Taking longer than usual — may take up to 30 seconds" after warnMs (default 6s)
 */
export function useSlowFeedback(
  isActive: boolean,
  quietMs = 3000,
  warnMs = 6000
): string | null {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 500);
    return () => clearInterval(id);
  }, [isActive]);

  if (!isActive || elapsed < quietMs) return null;
  if (elapsed < warnMs) return "Still working...";
  return "Taking longer than usual \u2014 may take up to 30 seconds";
}

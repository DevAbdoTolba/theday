import { useEffect, useState } from "react";
import { getJSON, setJSON, isBrowser } from "../utils/storage";

export default function usePersistentState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  // Load initial value on mount (client-only)
  useEffect(() => {
    if (!isBrowser) return;
    const stored = getJSON<T>(key, initialValue);
    setState(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Persist on change
  useEffect(() => {
    if (!isBrowser) return;
    try {
      setJSON(key, state);
    } catch (e) {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}

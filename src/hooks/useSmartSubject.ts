import { useState, useEffect, useRef } from "react";
import { useIndexedContext } from "../context/IndexedContext";
import { SubjectMaterials, UseSmartSubjectReturn } from "../utils/types";

export function useSmartSubject(
  subject: string,
  initialStaticData: SubjectMaterials | null
): UseSmartSubjectReturn {
  // logic: If we have static data, we aren't "loading" (blank screen), we are "fetching" (background sync)
  const [data, setData] = useState<SubjectMaterials | null>(initialStaticData);
  const [loading, setLoading] = useState(!initialStaticData);
  const [fetching, setFetching] = useState(false);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getSubjectByName, addOrUpdateSubject } = useIndexedContext();
  const syncLock = useRef<string | null>(null);
  const lastFetchedSubject = useRef<string | null>(null);

  useEffect(() => {
    if (!subject) return;
    if (syncLock.current === subject) return;

    let isMounted = true;
    const abortController = new AbortController();
    const startTime = performance.now();
    const trace: any[] = [];

    const loadData = async () => {
      try {
        // --- STEP 1: INDEXED DB SEARCH ---
        const cachedSubject = await getSubjectByName(subject);

        if (
          cachedSubject?.folders &&
          Object.keys(cachedSubject.folders).length > 0
        ) {
          // 🎯 HIT: Set UI immediately
          setData(cachedSubject.folders);
          setLoading(false);
          trace.push({
            step: "1. DB Search",
            status: "🎯 HIT",
            action: "UI Updated (Cache)",
            time: (performance.now() - startTime).toFixed(2) + "ms",
          });
        } else if (initialStaticData) {
          // ⚡ FALLBACK: Use static props if DB is empty
          setData(initialStaticData);
          setLoading(false);
          trace.push({
            step: "1. DB Search",
            status: "💨 MISS",
            action: "UI Updated (Static Props)",
            time: (performance.now() - startTime).toFixed(2) + "ms",
          });
        } else {
          // ⏳ WAITING: Complete miss, must show loading
          setLoading(true);
          trace.push({
            step: "1. DB Search",
            status: "💨 MISS",
            action: "Waiting for Network...",
            time: (performance.now() - startTime).toFixed(2) + "ms",
          });
        }

        // --- STEP 2: BACKGROUND FETCH ---
        setFetching(true);
        syncLock.current = subject;

        const response = await fetch(
          `/api/subjects/${encodeURIComponent(subject)}`,
          { signal: abortController.signal }
        );

        if (!response.ok) throw new Error("Network failure");
        const freshData: SubjectMaterials = await response.json();

        trace.push({
          step: "2. Fetch",
          status: "✅ OK",
          action: "Network Data Received",
          time: (performance.now() - startTime).toFixed(2) + "ms",
        });

        if (!isMounted) return;

        // --- STEP 3: DIFF & UPDATE ---
        // addOrUpdateSubject handles the logic to check for differences
        const result = await addOrUpdateSubject(subject, freshData);

        if (result.msg !== "No changes") {
          // UI Updates a second time because the background fetch found a difference
          setData(freshData);
          setNewItems(result.newItems || []);
          trace.push({
            step: "3. Diffing",
            status: "⚠️ DIFF",
            action: "UI Updated (Fresh Data)",
            time: (performance.now() - startTime).toFixed(2) + "ms",
          });
        } else {
          trace.push({
            step: "3. Diffing",
            status: "⚖️ STABLE",
            action: "No UI Update Needed",
            time: (performance.now() - startTime).toFixed(2) + "ms",
          });
        }

        setFetching(false);
        setLoading(false);

        console.log(`📊 Data Flow Trace: ${subject}`);
        console.table(trace);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Flow Error:", err);
        if (isMounted) {
          setError("Failed to sync data");
          setFetching(false);
          setLoading(false);
          syncLock.current = null;
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [subject]); // Only re-run if subject string changes

  return { data, loading, fetching, newItems, error };

}

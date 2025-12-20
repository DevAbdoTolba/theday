import { useState, useEffect } from "react";
import { useIndexedContext } from "../context/IndexedContext";
import { SubjectMaterials, UseSmartSubjectReturn } from "../utils/types";

export function useSmartSubject(
  subject: string | undefined,
  initialStaticData: SubjectMaterials | null
): UseSmartSubjectReturn {
  const [data, setData] = useState<SubjectMaterials | null>(initialStaticData);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getSubjectByName, addOrUpdateSubject } = useIndexedContext();

  useEffect(() => {
    if (!subject || typeof subject !== "string") return;

    let isMounted = true;

    const loadData = async () => {
      try {
        // Step 1: Check IndexedDB cache
        const cachedSubject = await getSubjectByName(subject);

        if (cachedSubject?.folders && Object.keys(cachedSubject.folders).length > 0) {
          // Cache hit - use cached data immediately
          if (isMounted) {
            setData(cachedSubject.folders);
          }

          // Step 2: Fetch fresh data in background and compare
          const result = await addOrUpdateSubject(subject, initialStaticData);

          if (!isMounted) return;

          if (result.msg !== "No changes") {
            // Update UI with fresh data
            setData(initialStaticData);
            setNewItems(result.newItems || []);
          }
        } else {
          // Cache miss - use initial static data
          if (isMounted) {
            setData(initialStaticData);
          }

          // Save to cache for next time
          await addOrUpdateSubject(subject, initialStaticData);
        }
      } catch (err) {
        console.error("Error loading subject data:", err);
        if (isMounted) {
          setError("Failed to load data");
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [subject]); // Only re-run when subject changes

  return { 
    data, 
    loading: false, // No loading state needed - we always have initialStaticData
    fetching: false, // No separate fetching indicator needed
    newItems, 
    error 
  };
}